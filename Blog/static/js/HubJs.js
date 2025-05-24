document.addEventListener('DOMContentLoaded', function () {
    // 渐入效果
    const faders = document.querySelectorAll('.fade-in');

    // 页面加载后自动显示渐入效果
    setTimeout(() => {
        faders.forEach(fader => {
            fader.classList.add('appear');
        });
    }, 100);

    // 移除所有与登录模态框相关的代码
    // 保留移动端菜单功能
    // const mobileMenu = document.querySelector('.mobile-menu');
    // const navLinks = document.querySelector('.nav-links');
    // mobileMenu.addEventListener('click', function () {
    //     navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    // });

});