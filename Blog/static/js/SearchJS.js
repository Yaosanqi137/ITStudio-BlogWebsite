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
searchIcon.addEventListener('click', function (e) {
    e.preventDefault();

    if (searchBox.value.trim() !== '') {
        let keyword = searchBox.value.trim();
        window.location.href = `/article/list?search=${encodeURIComponent(keyword)}`;
    }
});

//添加回车键触发搜索
searchBox.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchIcon.click();
    }
});