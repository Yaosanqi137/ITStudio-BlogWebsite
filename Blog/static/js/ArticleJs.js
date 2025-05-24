// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 文章内容图片点击放大效果
    const articleImages = document.querySelectorAll('.article-body img');
    articleImages.forEach(img => {
        img.addEventListener('click', function () {
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '9999';
            overlay.style.cursor = 'zoom-out';

            const imgClone = document.createElement('img');
            imgClone.src = this.src;
            imgClone.style.maxWidth = '90%';
            imgClone.style.maxHeight = '90%';
            imgClone.style.objectFit = 'contain';
            imgClone.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            imgClone.style.transition = 'transform 0.3s ease';
            imgClone.style.transform = 'scale(0.9)';

            overlay.appendChild(imgClone);
            document.body.appendChild(overlay);

            // 添加进入动画
            setTimeout(() => {
                imgClone.style.transform = 'scale(1)';
            }, 10);

            // 点击关闭大图
            overlay.addEventListener('click', function () {
                imgClone.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
            });
        });
    });

    // 滚动阅读进度条
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '4px';
    progressBar.style.background = '#ff6b6b';
    progressBar.style.zIndex = '1001';
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 0.2s ease';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function () {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = progress + '%';
    });

    // 评论区表单处理
    const commentForm = document.querySelector('.comment-form');
    const commentTextarea = document.querySelector('.comment-form textarea');

    if (commentForm && commentTextarea) {
        // 自动调整文本域高度
        commentTextarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // 添加表单提交效果
        commentForm.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('button[type="submit"]');

            if (commentTextarea.value.trim() === '') {
                e.preventDefault();

                // 显示错误提示
                commentTextarea.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.3)';
                commentTextarea.style.animation = 'shake 0.5s ease';

                setTimeout(() => {
                    commentTextarea.style.boxShadow = '';
                    commentTextarea.style.animation = '';
                }, 500);

                return;
            }

            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';
                submitBtn.disabled = true;
            }
        });
    }

    // 删除文章确认
    const deleteBtn = document.querySelector('.article-action-btn.delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function (e) {
            if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
                e.preventDefault();
            }
        });
    }

    // 添加代码高亮效果
    const codeBlocks = document.querySelectorAll('pre code');
    if (window.hljs && codeBlocks.length > 0) {
        codeBlocks.forEach(block => {
            hljs.highlightBlock(block);
        });
    }

    // 添加平滑滚动到评论区的功能
    const commentLinks = document.querySelectorAll('a[href="#comments"]');
    commentLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const commentsSection = document.querySelector('.comments-section');
            if (commentsSection) {
                window.scrollTo({
                    top: commentsSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 为长文章添加返回顶部按钮
    const articleContent = document.querySelector('.article-body');
    if (articleContent && articleContent.offsetHeight > window.innerHeight) {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.style.position = 'fixed';
        backToTopBtn.style.bottom = '20px';
        backToTopBtn.style.right = '20px';
        backToTopBtn.style.width = '50px';
        backToTopBtn.style.height = '50px';
        backToTopBtn.style.borderRadius = '50%';
        backToTopBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        backToTopBtn.style.backdropFilter = 'blur(10px)';
        backToTopBtn.style.border = 'none';
        backToTopBtn.style.color = '#fff';
        backToTopBtn.style.fontSize = '18px';
        backToTopBtn.style.cursor = 'pointer';
        backToTopBtn.style.display = 'none';
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.transition = 'opacity 0.3s ease';

        document.body.appendChild(backToTopBtn);

        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
                setTimeout(() => {
                    backToTopBtn.style.opacity = '1';
                }, 10);
            } else {
                backToTopBtn.style.opacity = '0';
                setTimeout(() => {
                    backToTopBtn.style.display = 'none';
                }, 300);
            }
        });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}); 