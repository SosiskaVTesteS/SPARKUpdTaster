function openShare() {
    const modal = document.getElementById('shareModal');
    const qrImg = document.getElementById('qrImg');
    
    // Ссылка на проект (замени на свою)
    const targetUrl = "https://github.com/SPARK";
    
    // Генерируем QR в золотом цвете (#e8c55a -> color=e8c55a)
    // bgcolor=0d1117 делает фон QR таким же, как у карточки
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${targetUrl}&color=e8c55a&bgcolor=0d1117`;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeShare() {
    const modal = document.getElementById('shareModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 400);
}
