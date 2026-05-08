function toggleSystem(clickedSystem) {
    const dimmer = document.getElementById('spaceDimmer');
    const allSystems = document.querySelectorAll('.cosmic-system');
    
    // Если кликнули на систему, которая уже открыта — закрываем её
    if (clickedSystem.classList.contains('focused')) {
        clickedSystem.classList.remove('focused');
        dimmer.classList.remove('active');
    } 
    // Если кликнули на новую систему
    else {
        // 1. Закрываем все остальные системы
        allSystems.forEach(sys => sys.classList.remove('focused'));
        
        // 2. Открываем ту, на которую кликнули
        clickedSystem.classList.add('focused');
        
        // 3. Включаем затемнение фона
        dimmer.classList.add('active');
    }
}

// Если кликнуть по темному фону вокруг системы — всё закрывается
document.getElementById('spaceDimmer').addEventListener('click', function() {
    this.classList.remove('active');
    document.querySelectorAll('.cosmic-system').forEach(sys => sys.classList.remove('focused'));
});
