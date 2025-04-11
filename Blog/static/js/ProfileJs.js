// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 头像预览功能
    const avatarInput = document.getElementById('id_avatar');
    const avatarPreview = document.querySelector('.profile-preview');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                    // 添加一个小动画效果
                    avatarPreview.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        avatarPreview.style.transform = 'scale(1)';
                    }, 300);
                }
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 表单验证
    const profileForm = document.querySelector('form');
    const nicknameInput = document.getElementById('id_nickname');
    const infoInput = document.getElementById('id_info');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            // 昵称验证
            if (nicknameInput && nicknameInput.value.trim() === '') {
                showError(nicknameInput, '昵称不能为空');
                isValid = false;
            } else if (nicknameInput && nicknameInput.value.length > 20) {
                showError(nicknameInput, '昵称不能超过20个字符');
                isValid = false;
            } else if (nicknameInput) {
                removeError(nicknameInput);
            }
            
            // 个人简介验证
            if (infoInput && infoInput.value.length > 200) {
                showError(infoInput, '个人简介不能超过200个字符');
                isValid = false;
            } else if (infoInput) {
                removeError(infoInput);
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // 显示错误信息
    function showError(input, message) {
        // 移除已有的错误信息
        removeError(input);
        
        // 创建错误信息元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.style.display = 'block';
        errorDiv.textContent = message;
        
        // 将错误信息插入到输入框后面
        input.parentNode.appendChild(errorDiv);
        
        // 给输入框添加错误样式
        input.classList.add('is-invalid');
    }
    
    // 移除错误信息
    function removeError(input) {
        const parent = input.parentNode;
        const errorDiv = parent.querySelector('.invalid-feedback');
        
        if (errorDiv) {
            parent.removeChild(errorDiv);
        }
        
        input.classList.remove('is-invalid');
    }
    
    // 添加输入框焦点效果
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.addEventListener('focus', function() {
            this.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.3)';
        });
        
        control.addEventListener('blur', function() {
            this.style.boxShadow = 'none';
        });
    });
    
    // 添加表单提交成功的动画效果
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            if (profileForm.checkValidity()) {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
            }
        });
    }
    
    // 平滑滚动效果
    const scrollLinks = document.querySelectorAll('.bottom-buttons a');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 添加点击时的动画效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-3px)';
            }, 150);
        });
    });
}); 