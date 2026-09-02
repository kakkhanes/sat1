// ใส่ Web App URL ของคุณที่นี่
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylcgzUEKVOAhCNQMnIDQT4kUnm41nQw7zeEB6PBo1JkR1Uxbb5hn10bREsyE7YZyME/exec';

function calculatePortions() {
    const people = parseInt(document.getElementById('people').value) || 1;
    document.getElementById('rice-val').innerText = people * 150;
    document.getElementById('meat-val').innerText = people * 150;
    document.getElementById('veg-val').innerText = people * 100;
}

async function saveToGoogleSheet(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    const name = document.getElementById('food-name').value;
    const expiryDate = document.getElementById('expiry-date').value;
    
    const today = new Date();
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    submitBtn.innerHTML = "<span>⏳ กำลังบันทึก...</span>";
    submitBtn.disabled = true;

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, expiryDate: expiryDate, daysLeft: diffDays })
        });

        alert('✨ บันทึกวัตถุดิบลง Google Sheets สำเร็จ!');
        document.getElementById('food-name').value = '';
        document.getElementById('expiry-date').value = '';
        loadFromGoogleSheet();
    } catch (err) {
        alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
        submitBtn.innerHTML = "<span>บันทึกลง Google Sheets</span>";
        submitBtn.disabled = false;
    }
}

async function loadFromGoogleSheet() {
    const foodList = document.getElementById('food-list');
    foodList.innerHTML = '<p style="text-align:center; color:#64748b;">🔄 กำลังโหลดข้อมูลวัตถุดิบ...</p>';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const data = await res.json();
        foodList.innerHTML = '';

        if (!data || data.length === 0) {
            foodList.innerHTML = '<p style="text-align:center; color:#94a3b8;">ยังไม่มีข้อมูลวัตถุดิบในตู้เย็น</p>';
            return;
        }

        data.forEach(item => {
            let badgeClass = 'badge-normal';
            let statusText = `เหลือ ${item.daysLeft} วัน`;

            if (item.daysLeft < 0) {
                badgeClass = 'badge-danger';
                statusText = 'หมดอายุแล้ว';
            } else if (item.daysLeft <= 3) {
                badgeClass = 'badge-warning';
                statusText = `ควรทาน (เหลือ ${item.daysLeft} วัน)`;
            }

            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <div>
                    <div style="font-weight:600; font-size:15px;">${item.name}</div>
                    <div style="font-size:12px; color:#64748b;">วันหมดอายุ: ${item.expiryDate}</div>
                </div>
                <span class="badge-status ${badgeClass}">${statusText}</span>
            `;
            foodList.appendChild(div);
        });
    } catch (err) {
        foodList.innerHTML = '<p style="text-align:center; color:#ef4444;">ไม่สามารถดึงข้อมูลได้</p>';
    }
}

window.onload = loadFromGoogleSheet;