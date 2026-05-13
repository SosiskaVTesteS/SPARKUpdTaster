/**
 * SPARK // Journey Interaction Script
 * Этот скрипт отвечает за активацию планет при скролле и плавность анимаций.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Находим все секции с шагами нашего пути
    const journeySteps = document.querySelectorAll('.journey-step');

    // 2. Настройки для "датчика" видимости
    // threshold: 0.6 означает, что событие сработает, когда 60% секции будет в кадре
    const observerOptions = {
        root: null, // следим относительно окна браузера
        threshold: 0.5, 
        rootMargin: "0px"
    };

    // 3. Логика появления элементов
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Если секция зашла в зону видимости — добавляем класс active
                entry.target.classList.add('active');
                
                // Для еще более премиального эффекта: чуть замедляем появление текста
                const text = entry.target.querySelector('.text-content');
                if (text) {
                    text.style.opacity = '1';
                    text.style.transform = 'translateY(0)';
                }
            } else {
                // Если мы пролистали мимо (убираем класс, если хотим, чтобы планета "сдувалась" обратно)
                entry.target.classList.remove('active');
            }
        });
    };

    // 4. Создаем сам наблюдатель
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 5. Заставляем наблюдатель следить за каждой планетой
    journeySteps.forEach(step => {
        // Устанавливаем начальное состояние текста для анимации появления
        const text = step.querySelector('.text-content');
        if (text) {
            text.style.opacity = '0';
            text.style.transform = 'translateY(20px)';
            text.style.transition = 'all 1s ease-out';
        }
        
        observer.observe(step);
    });

    // 6. Дополнительная фишка: Параллакс эффект для сферы при движении мыши
    // Это добавит того самого ощущения "дорогого" сайта
    document.addEventListener('mousemove', (e) => {
        const activePlanet = document.querySelector('.journey-step.active .sphere');
        if (activePlanet) {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            activePlanet.style.left = `${moveX}px`;
            activePlanet.style.top = `${moveY}px`;
        }
    });
});
