function toggleSystem(element) {
    const wrapper = element.parentElement; // Получаем .system-wrapper
    const dimmer = document.getElementById('spaceDimmer');
    
    if (wrapper.classList.contains('focused')) {
        // Если уже открыто — закрываем
        wrapper.classList.remove('focused');
        dimmer.classList.remove('active');
    } else {
        // Закрываем все остальные системы перед открытием новой
        document.querySelectorAll('.system-wrapper').forEach(sys => {
            sys.classList.remove('focused');
        });
        
        // Открываем текущую
        wrapper.classList.add('focused');
        dimmer.classList.add('active');
    }
}

// Закрытие при клике на затемненный фон
document.getElementById('spaceDimmer').onclick = function() {
    this.classList.remove('active');
    document.querySelectorAll('.system-wrapper').forEach(sys => {
        sys.classList.remove('focused');
    });
};
