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

    //默认展示文章部分
    contentTabs.forEach(tab => tab.style.display = 'none');
    contentTabs[2].style.display = 'block';

    modeTabs.forEach((modeTab, index) => {
        modeTab.addEventListener('click', () => {
            modeTabs.forEach(tab => tab.classList.remove('activeMode'));
            modeTab.classList.add('activeMode');

            if (index != 3) {
                contentTabs.forEach(tab => tab.style.display = 'none');
                contentTabs[index].style.display = 'block';
            }
            else {
                contentTabs.forEach(tab => tab.style.display = 'block');
            }

        });
    });

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

    // 解析URL参数
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let keyword = urlParams.get('search') || '';
    console.log("keyword: " + keyword);

    // 搜索框已有内容时点击图标执行搜索
    if (keyword != '') {
        let title = document.querySelector('.search-title')
        let allOrSearch = document.querySelector('.allOrSearch')
        title.innerHTML = '“' + keyword + '” 的搜索结果:'
        allOrSearch.innerHTML = '文章'
    }

    searchIcon.addEventListener('click', function (e) {
        console.log("search!");
        if (searchBox.value.trim() !== '') {
            keyword = searchBox.value.trim();
            window.location.href = `/article/list?search=${encodeURIComponent(keyword)}`;
        }
    });

    //取消搜索
    let cancelSearch = document.querySelector('.cancel-search')
    if (keyword == '') {
        cancelSearch.style.display = 'none';
    }

    cancelSearch.addEventListener('click', function () {
        keyword = '';
        window.location.href = `/article/list`;
    })

    //添加回车键触发搜索
    searchBox.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchIcon.click();
        }
    });


}); 