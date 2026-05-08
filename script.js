function focusSystem(element) {
    const anchor = element.closest('.sys-anchor');
    const dimmer = document.getElementById('spaceDimmer');
    
    if (anchor.classList.contains('focused')) {
        anchor.classList.remove('focused');
        dimmer.classList.remove('active');
    } else {
        document.querySelectorAll('.sys-anchor').forEach(el => el.classList.remove('focused'));
        anchor.classList.add('focused');
        dimmer.classList.add('active');
    }
}

document.getElementById('spaceDimmer').onclick = function() {
    this.classList.remove('active');
    document.querySelectorAll('.sys-anchor').forEach(el => el.classList.remove('focused'));
};
