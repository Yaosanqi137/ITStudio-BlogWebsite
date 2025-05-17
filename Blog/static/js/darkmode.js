document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');

    // 初始化主题（优先读取localStorage）
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }

    // 设置主题状态
    function setTheme(theme) {
        const isDark = theme === 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.toggle('dark-mode', isDark);

        // 更新图标
        themeToggle.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        // 强制重绘解决渐变背景问题
        document.body.style.backgroundImage = 'none';
        setTimeout(() => {
            document.body.style.backgroundImage = '';
        }, 10);
    }

    // 切换主题
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    });

    initTheme();
});