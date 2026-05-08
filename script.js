// Функция для центрирования и увеличения системы
function focusSystem(element) {
    // Находим родительский контейнер (якорь системы)
    const anchor = element.closest('.sys-anchor');
    const dimmer = document.getElementById('spaceDimmer');
    
    // Если система уже в фокусе — закрываем её
    if (anchor.classList.contains('focused')) {
        anchor.classList.remove('focused');
        dimmer.classList.remove('active');
    } else {
        // Сначала закрываем все остальные открытые системы, чтобы не было накладок
        document.querySelectorAll('.sys-anchor').forEach(el => {
            el.classList.remove('focused');
        });
        
        // Открываем ту, на которую кликнули
        anchor.classList.add('focused');
        dimmer.classList.add('active');
    }
}

// Закрытие системы при клике на затемненный фон
document.getElementById('spaceDimmer').onclick = function() {
    this.classList.remove('active');
    
    // Снимаем класс focus со всех систем
    document.querySelectorAll('.sys-anchor').forEach(el => {
        el.classList.remove('focused');
    });
};
