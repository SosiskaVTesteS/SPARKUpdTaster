function openShare() {
    const modal = document.getElementById('shareModal');
    const qrImg = document.getElementById('qrImg');
    
    const targetUrl = "https://github.com/SPARK";
    
    // Мягкий золотой цвет (без неона)
    const goldColor = "c5a021"; 
    const bgColor = "0d1117";
    
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${targetUrl}&color=${goldColor}&bgcolor=${bgColor}`;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeShare() {
    const modal = document.getElementById('shareModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 400);
}
