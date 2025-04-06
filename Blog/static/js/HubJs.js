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

    // 修改搜索框交互逻辑
    const searchContainer = document.querySelector('.search-container');
    const searchIcon = document.getElementById('searchIcon');
    const searchBox = document.getElementById('searchBox');

    // 搜索框获得焦点时颜色加深
    searchBox.addEventListener('focus', function () {
        searchBox.classList.add('active');
    });

    // 当搜索框失去焦点且没有内容时，颜色恢复
    searchBox.addEventListener('blur', function () {
        if (searchBox.value.trim() === '' && !searchContainer.matches(':hover')) {
            searchBox.classList.remove('active');
        }
    });

    // 搜索框已有内容时点击图标执行搜索
    // <a href="{% url 'pages:search' keyword %}"></a>
    //等待后端同学的src
    const Localsrc = new Array(9).fill({ imgsrc: "", avatarsrc: "", title: "", description: "" })
    searchIcon.addEventListener('click', function () {
        if (searchBox.value.trim() !== '') {
            let keyword = searchBox.value.trim();

            fetch("{% url 'pages:search' keyword %}")
                .then(response => response.json())
                .then(data => {
                    //这里的变量名等待后端同学提供
                    for (let i = 0; i < Math.min(data.length, 9); i++) {
                        Localsrc[i] = data[i];
                        //目前没有办法通过渲染测试，只能选择控制台用于检测
                        console.log(Localsrc[i]);
                    }
                })
                .catch(error => console.error("error: ", error));
        }
    });
});