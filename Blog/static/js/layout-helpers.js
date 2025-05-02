// 通用布局助手函数
document.addEventListener('DOMContentLoaded', function() {
    // 添加Font Awesome CSS（如果页面没有添加）
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }

    // 添加返回顶部按钮CSS（如果页面没有添加）
    if (!document.querySelector('link[href*="back-to-top.css"]')) {
        const backToTopLink = document.createElement('link');
        backToTopLink.rel = 'stylesheet';
        backToTopLink.href = '/static/css/back-to-top.css';
        document.head.appendChild(backToTopLink);
    }

    // 动态加载返回顶部按钮JS
    const backToTopScript = document.createElement('script');
    backToTopScript.src = '/static/js/back-to-top.js';
    document.body.appendChild(backToTopScript);
}); 