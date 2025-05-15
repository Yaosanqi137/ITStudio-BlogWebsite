// 暗黑模式切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取主题切换按钮
    const themeToggle = document.getElementById('themeToggle');
    
    // 检查本地存储中是否有主题设置
    const currentTheme = localStorage.getItem('theme');
    
    // 如果有存储的主题设置，应用该设置
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        
        // 更新按钮图标
        if (currentTheme === 'dark-mode') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // 添加切换事件
    themeToggle.addEventListener('click', function() {
        // 切换暗黑模式
        document.body.classList.toggle('dark-mode');
        
        // 根据当前模式更新图标
        if (document.body.classList.contains('dark-mode')) {
            this.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark-mode');
        } else {
            this.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.removeItem('theme');
        }
    });
}); 