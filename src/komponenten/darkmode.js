// darkmode.js
export function setupDarkMode() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'dark-mode-toggle';
    toggleButton.textContent = '🌙';
    document.body.prepend(toggleButton);

    const savedMode = localStorage.getItem('mode') || 'light';
    if (savedMode === 'dark') {
        enableDarkMode(toggleButton);
    }

    toggleButton.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode(toggleButton);
        } else {
            enableDarkMode(toggleButton);
        }
    });

    function enableDarkMode(button) {
        document.body.classList.add('dark-mode');
        button.textContent = '☀️';
        localStorage.setItem('mode', 'dark');
    }

    function disableDarkMode(button) {
        document.body.classList.remove('dark-mode');
        button.textContent = '🌙 ';
        localStorage.setItem('mode', 'light');
    }


    
    
}