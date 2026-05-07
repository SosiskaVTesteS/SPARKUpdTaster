function openShare() {
    const modal = document.getElementById('shareModal');
    const qrImg = document.getElementById('qrImg');
    
    // Генерируем QR для примера
    qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://github.com/SPARK";
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeShare() {
    const modal = document.getElementById('shareModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 400);
}

// ПАСХАЛКА: Если нажать на текст SPARK 7 раз
let clickCount = 0;
document.querySelector('.logo-text').addEventListener('click', () => {
    clickCount++;
    if (clickCount === 7) {
        alert("ИСКРА РАЗЖЖЕНА! 🚀 (Тут будет твой звук или эффект)");
        clickCount = 0;
    }
});
