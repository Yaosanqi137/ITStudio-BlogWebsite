// 导航栏交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 添加移动端菜单切换功能
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    
    // 检查当前窗口宽度，只在移动视图下添加菜单切换按钮
    const isMobile = window.innerWidth <= 900;
    
    // 只在移动视图下创建菜单按钮和关闭按钮
    if (isMobile && !document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('div');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        nav.appendChild(menuToggle);
        
        // 创建关闭按钮
        const closeMenu = document.createElement('div');
        closeMenu.className = 'close-menu';
        closeMenu.innerHTML = '<i class="fas fa-times"></i>';
        navLinks.appendChild(closeMenu);
        
        // 添加菜单切换事件
        menuToggle.addEventListener('click', function() {
            navLinks.classList.add('active');
        });
        
        // 添加关闭菜单事件
        closeMenu.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    }
    
    // 给当前页面的导航链接添加active类
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    
    navItems.forEach(item => {
        // 判断链接是否与当前路径匹配（排除首页按钮）
        const href = item.getAttribute('href');
        if (href !== '/' && currentPath.includes(href)) {
            // 先移除所有active类，再添加到当前项
            navItems.forEach(link => link.classList.remove('active'));
            item.classList.add('active');
        }
    });
    
    // 移除滚动时导航栏变色的功能
    // window.addEventListener('scroll', function() {
    //     const header = document.querySelector('header');
    //     if (window.scrollY > 50) {
    //         header.style.background = 'rgba(0, 0, 0, 0.8)';
    //         header.style.backdropFilter = 'blur(15px)';
    //     } else {
    //         header.style.background = 'rgba(255, 255, 255, 0.2)';
    //         header.style.backdropFilter = 'blur(10px)';
    //     }
    // });
    
    // 导航链接悬停效果
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.color = 'rgba(255, 107, 107, 0.8)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.color = '#fff';
            }
        });
    });
    
    // LOGO点击回到首页
    const logo = document.querySelector('.logo');
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function() {
        window.location.href = '/';
    });
    
    // 监听窗口大小变化，处理移动设备旋转屏幕的情况
    window.addEventListener('resize', function() {
        const isMobileNow = window.innerWidth <= 900;
        const hasMenuToggle = !!document.querySelector('.menu-toggle');
        const hasCloseMenu = !!document.querySelector('.close-menu');
        
        // 如果从电脑视图切换到移动视图，添加菜单按钮
        if (isMobileNow && !hasMenuToggle) {
            const menuToggle = document.createElement('div');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            nav.appendChild(menuToggle);
            
            menuToggle.addEventListener('click', function() {
                navLinks.classList.add('active');
            });
            
            // 如果没有关闭按钮，添加一个
            if (!hasCloseMenu) {
                const closeMenu = document.createElement('div');
                closeMenu.className = 'close-menu';
                closeMenu.innerHTML = '<i class="fas fa-times"></i>';
                navLinks.appendChild(closeMenu);
                
                closeMenu.addEventListener('click', function() {
                    navLinks.classList.remove('active');
                });
            }
        } 
        // 如果从移动视图切换到电脑视图，移除菜单按钮和关闭按钮
        else if (!isMobileNow) {
            if (hasMenuToggle) {
                const menuToggle = document.querySelector('.menu-toggle');
                menuToggle.parentNode.removeChild(menuToggle);
            }
            
            if (hasCloseMenu) {
                const closeMenu = document.querySelector('.close-menu');
                closeMenu.parentNode.removeChild(closeMenu);
            }
            
            // 确保导航栏在电脑视图中正常显示
            navLinks.classList.remove('active');
            navLinks.style.right = '';
        }
    });
}); 