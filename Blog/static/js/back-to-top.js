// 返回顶部按钮逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 检查并创建返回顶部按钮
    if (!document.querySelector('.back-to-top')) {
        const backToTopButton = document.createElement('button');
        backToTopButton.className = 'back-to-top';
        backToTopButton.title = '返回顶部';
        backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopButton);
    }

    // 添加滚动事件
    window.addEventListener('scroll', function() {
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.classList.toggle('active', window.scrollY > 200);
        }
    });

    // 添加点击事件
    document.addEventListener('click', function(e) {
        if (e.target.closest('.back-to-top')) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}); 