function toggleSystem(element) {
    const dimmer = document.getElementById('spaceDimmer');
    
    if (element.classList.contains('focused')) {
        element.classList.remove('focused');
        dimmer.classList.remove('active');
    } else {
        // Убираем фокус с других, если они были открыты
        document.querySelectorAll('.cosmic-system').forEach(sys => sys.classList.remove('focused'));
        
        element.classList.add('focused');
        dimmer.classList.add('active');
    }
}

// Закрытие при клике на пустоту
document.getElementById('spaceDimmer').onclick = function() {
    this.classList.remove('active');
    document.querySelectorAll('.cosmic-system').forEach(sys => sys.classList.remove('focused'));
};
