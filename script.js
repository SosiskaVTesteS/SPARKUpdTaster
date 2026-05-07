function openShare() {
    const modal = document.getElementById('shareModal');
    const qrImg = document.getElementById('qrImg');
    
    const targetUrl = "https://github.com/SPARK";
    
    // Цвет D4AF37 — это классическое "Золото" (Metallic Gold)
    // Оно выглядит гораздо спокойнее и натуральнее
    const goldColor = "d4af37"; 
    const bgColor = "0d1117";
    
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${targetUrl}&color=${goldColor}&bgcolor=${bgColor}`;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}
