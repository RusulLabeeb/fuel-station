// --- البيانات والحالة ---
let transactions = JSON.parse(localStorage.getItem('fuel_data')) || [];
let stats = { totalLiters: 0, totalRevenue: 0 };
let darkMode = true;
const prices = { 'Premium': 650, 'Regular': 450, 'Diesel': 400 };
const goals = { liters: 100, revenue: 100000 };

// --- عناصر الواجهة ---
const scrollBox = document.querySelector('.scroll-box');
const literValue = document.querySelector('.stat-circle strong');
const revenueValue = document.querySelector('.revenue strong');
const authCodeSpan = document.getElementById('code');

// --- وظائف التحديث ---
function updateUI() {
    // حساب الإحصائيات
    stats.totalLiters = transactions.reduce((sum, t) => sum + t.liters, 0);
    stats.totalRevenue = transactions.reduce((sum, t) => sum + t.totalCost, 0);

    // تحديث النصوص
    literValue.innerText = stats.totalLiters.toFixed(1);
    revenueValue.innerText = stats.totalRevenue.toLocaleString();

    // تحديث الدوائر (SVG)
    const literPercent = Math.min((stats.totalLiters / goals.liters) * 100, 100);
    const revenuePercent = Math.min((stats.totalRevenue / goals.revenue) * 100, 100);

    document.querySelector('.stat-circle .circle').style.strokeDasharray = `${literPercent}, 100`;
    document.querySelector('.revenue .circle').style.strokeDasharray = `${revenuePercent}, 100`;

    // تحديث القائمة
    renderTransactions();

    // حفظ البيانات
    localStorage.setItem('fuel_data', JSON.stringify(transactions));
}

function renderTransactions() {
    if (transactions.length === 0) {
        scrollBox.innerHTML = '<div class="empty-msg">No sales recorded yet. 🚀</div>';
        return;
    }

    scrollBox.innerHTML = transactions.map(t => `
            <div class="item-card">
                <div class="item-icon" style="color: ${t.type === 'Premium' ? '#f97316' : '#3b82f6'}">⛽</div>
                <div class="item-data">
                    <strong>${t.customerName}</strong>
                    <span>${t.type} • ${t.liters}L • ${t.time}</span>
                </div>
                <div class="item-price">
                    <p>${t.totalCost.toLocaleString()}</p>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
                </div>
            </div>
        `).join('');
}

// --- العمليات (Add / Delete) ---
function addTransaction() {
    // هنا يمكنك إظهار Modal حقيقي أو استخدام prompt للتبسيط في هذا المثال
    const name = prompt("Customer Name:", "General Customer");
    const liters = parseFloat(prompt("Quantity (Liters):", "0"));
    const type = prompt("Type (Premium, Regular, Diesel):", "Premium");

    if (liters > 0 && prices[type]) {
        const newItem = {
            id: Date.now(),
            customerName: name || "General Customer",
            type: type,
            liters: liters,
            totalCost: liters * prices[type],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        transactions.unshift(newItem);
        updateUI();
    } else {
        alert("Invalid input!");
    }
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateUI();
}

// --- وظائف المصادقة (SuperQi) ---
var authCode = '';

function authenticate() {
    my.getAuthCode({
        scopes: ['auth_base', 'USER_ID'],
        success: (res) => {
            authCode = res.authCode;
            document.getElementById('authCode').textContent = authCode;

            fetch('https://its.mouamle.space/api/auth-with-superQi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: authCode
                })
            }).then(res => res.json()).then(data => {
                my.alert({
                    content: "Login successful",
                });
            }).catch(err => {
                let errorDetails = '';
                if (err && typeof err === 'object') {
                    errorDetails = JSON.stringify(err, null, 2);
                } else {
                    errorDetails = String(err);
                }
                my.alert({
                    content: "Error: " + errorDetails,
                });
            });
        },
        fail: (res) => {
            console.log(res.authErrorScopes)
        },
    });

}

function copyAuthCode() {
    navigator.clipboard.writeText(authCode);
}

// --- الوضع الليلي ---
function toggleDarkMode() {
    const frame = document.querySelector('.mobile-frame');
    darkMode = !darkMode;
    if (darkMode) {
        frame.style.background = "#0c0d10";
        frame.style.color = "white";
    } else {
        frame.style.background = "#f5f7fa";
        frame.style.color = "#111";
    }
}

// --- تشغيل عند التحميل ---
document.querySelector('.main-add-btn').onclick = addTransaction;
document.querySelector('.login-btn').onclick = authenticate;
document.querySelector('.copy-btn').onclick = copyAuthCode;
document.querySelector('.top-bar button').onclick = toggleDarkMode;

// التشغيل الأولي
updateUI();