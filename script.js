function toggleSystem(element) {
    const wrapper = element.parentElement;
    const dimmer = document.getElementById('spaceDimmer');
    
    if (wrapper.classList.contains('focused')) {
        wrapper.classList.remove('focused');
        dimmer.classList.remove('active');
    } else {
        document.querySelectorAll('.system-wrapper').forEach(sys => {
            sys.classList.remove('focused');
        });
        wrapper.classList.add('focused');
        dimmer.classList.add('active');
    }
}

document.getElementById('spaceDimmer').onclick = function() {
    this.classList.remove('active');
    document.querySelectorAll('.system-wrapper').forEach(sys => {
        sys.classList.remove('focused');
    });
};
