document.addEventListener('DOMContentLoaded', function () {
    // 检查子菜单是否会超出右边界并适当调整
    function checkMenuBoundary() {
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            const subMenu = item.querySelector('.sub-category');
            if (subMenu) {
                const rect = item.getBoundingClientRect();
                const subMenuWidth = subMenu.offsetWidth;
                const viewportWidth = window.innerWidth;

                // 判断子菜单是否会超出右侧边界
                if (rect.right + subMenuWidth > viewportWidth) {
                    item.classList.add('boundary-right');
                } else {
                    item.classList.remove('boundary-right');
                }
            }
        });
    }

    // 页面加载和窗口大小变化时检查边界
    window.addEventListener('load', checkMenuBoundary);
    window.addEventListener('resize', checkMenuBoundary);

    // 分类按钮功能 - 仅处理点击分类进行筛选，不干扰悬停显示
    const categoryTitles = document.querySelectorAll('.category-title');
    categoryTitles.forEach(title => {
        title.addEventListener('click', function (e) {
            // 添加点击主分类进行筛选的功能
            const categoryName = this.getAttribute('data-category');
            if (categoryName) {
                window.location.href = `?category=${encodeURIComponent(categoryName)}`;
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    const categoryButtons = document.querySelectorAll('.sub-category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            const category = this.getAttribute('data-category');
            const subcategory = this.getAttribute('data-subcategory');

            // 重定向到分类过滤的URL
            window.location.href = `?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`;
        });
    });

    // 防止点击菜单内部关闭菜单
    document.querySelectorAll('.category-dropdown, .sub-category').forEach(menu => {
        menu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // 点击页面其他区域关闭所有菜单 - 不再需要，使用CSS hover控制
    /*
    document.addEventListener('click', function() {
        document.querySelectorAll('.sub-category').forEach(menu => {
            menu.style.display = 'none';
        });
        document.querySelectorAll('.category-title').forEach(title => {
            title.classList.remove('active');
        });
    });
    */

    // 高亮当前选中的分类
    function highlightCurrentCategory() {
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category');
        const currentSubcategory = urlParams.get('subcategory');

        if (currentCategory) {
            // 高亮显示主分类
            document.querySelectorAll('.category-title').forEach(title => {
                if (title.getAttribute('data-category') === currentCategory) {
                    title.classList.add('active');
                }
            });

            // 高亮显示子分类
            if (currentSubcategory) {
                document.querySelectorAll('.sub-category-btn').forEach(button => {
                    if (button.getAttribute('data-category') === currentCategory &&
                        button.getAttribute('data-subcategory') === currentSubcategory) {
                        button.style.backgroundColor = '#39c5bb';
                        button.style.color = 'white';
                    }
                });
            }
        }
    }

    // 清除筛选按钮功能
    const clearFilterBtn = document.querySelector('.clear-filter-btn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function () {
            window.location.href = window.location.pathname;
        });
    }

    // 页面加载时高亮当前分类
    highlightCurrentCategory();

    //搜索模式选择
    const modeTabs = document.querySelectorAll('.searchMode > div');
    const contentTabs = document.querySelectorAll('.tab-content');
    contentTabs.forEach(tab => tab.style.display = 'none');

    // 解析URL参数
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    //根据URL选择高亮模式并展示
    const URL = window.location.href;
    const parts = URL.split("/");
    let mode = parts[3]
    console.log("mode: " + mode);

    if (mode == 'user') {
        modeTabs[0].classList.add('activeMode')
        contentTabs[0].style.display = "block"
        mode = 0;
    }
    else if (mode == 'comment') {
        modeTabs[1].classList.add('activeMode')
        contentTabs[1].style.display = "block"
        mode = 1;
    }
    else if (mode == 'article') {
        modeTabs[2].classList.add('activeMode')
        contentTabs[2].style.display = "block"
        mode = 2;
    }
    else if (mode == 'search') {
        modeTabs[3].classList.add('activeMode')
        contentTabs.forEach(tab => tab.style.display = "block")
        mode = 3;
    }

    //获取搜索词
    let keyword = urlParams.get('search') || '';
    console.log("keyword: " + keyword);

    const urlList = ['/user/search', '/comment/search', '/article/list', '/search/']
    //添加点击事件
    modeTabs.forEach((tab, index) => {
        tab.addEventListener('click', function () {
            if (keyword != '') {
                console.log(urlList[index] + '?search=' + keyword)
                window.location.href = urlList[index] + '?search=' + keyword
            }
            else {
                window.location.href = urlList[index]
            }
        })
    })

    // 修改搜索框交互逻辑
    const searchContainer = document.querySelector('.search-container');
    const searchIcon = document.getElementById('searchIcon');
    const searchBox = document.getElementById('searchBox');

    // 搜索框获得焦点时颜色加深
    searchBox.addEventListener('focus', function () {
        searchBox.classList.add('active');
        console.log("focus!");
    });

    // 当搜索框失去焦点且没有内容时，颜色恢复
    searchBox.addEventListener('blur', function () {
        if (searchBox.value.trim() === '' && !searchContainer.matches(':hover')) {
            searchBox.classList.remove('active');
        }
    });

    // 搜索内容展示
    let title = document.querySelector('.search-title')
    let allOrSearch = document.querySelector('.allOrSearch')
    if (keyword != '') {
        title.innerHTML = '“' + keyword + '” 的搜索结果:'
        allOrSearch.innerHTML = '文章'
    }
    else {
        title.innerHTML = ''
        allOrSearch.innerHTML = '全部文章'
    }

    searchIcon.addEventListener('click', function (e) {
        console.log("search!");
        if (searchBox.value.trim() !== '') {
            keyword = searchBox.value.trim();
            window.location.href = urlList[mode] + `?search=${encodeURIComponent(keyword)}`;
        }
    });

    //取消搜索
    let cancelSearch = document.querySelector('.cancel-search')
    if (keyword == '') {
        cancelSearch.style.display = 'none';
    }

    cancelSearch.addEventListener('click', function () {
        keyword = '';
        window.location.href = urlList[mode];
    })

    //添加回车键触发搜索
    searchBox.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchIcon.click();
        }
    });


}); 