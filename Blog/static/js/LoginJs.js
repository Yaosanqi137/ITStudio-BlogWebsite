document.addEventListener('DOMContentLoaded', function () {
    // --- Start of Captcha Logic (Copied from working Register.html) ---
    //--- 验证码逻辑开始（从能正常工作的 Register.html 文件复制而来） ---

    const captchaWrapper = document.querySelector('.captcha-wrapper');
    const captchaContainer = document.querySelector('.captcha-container'); // For status message // 用于状态消息

    // Function to perform the actual validation AJAX call
    // 执行实际验证 AJAX 请求的函数
    function performCaptchaValidation(captchaInput, hashkeyInput) {
        const response = captchaInput.value.trim();
        const hashkey = hashkeyInput.value;

        if (!response || !hashkey) {
            console.log("Validation skipped: Response or Hashkey missing.");
            return;
        }
        console.log('正在验证验证码:', response, '使用hashkey:', hashkey);
        if (captchaInput._validating) return;
        captchaInput._validating = true;

        fetch(`{% url 'user:ajax_val' %}?response=${response}&hashkey=${hashkey}`)
            .then(response => response.json())
            .then(data => {
                console.log('验证码验证结果:', data);
                let captchaStatus = document.getElementById('captcha_status');
                if (!captchaStatus && captchaContainer) {
                    captchaStatus = document.createElement('span');
                    captchaStatus.id = 'captcha_status';
                    captchaContainer.appendChild(captchaStatus);
                }
                if (captchaStatus) {
                    captchaStatus.textContent = data.status ? '验证码正确' : (data.message || '验证码错误'); // Use message if available  // 若有可用消息，则使用该消息
                    captchaStatus.className = data.status ? 'status-success' : 'status-error';
                }
            })
            .catch(error => {
                console.error('验证码验证错误:', error);
                let captchaStatus = document.getElementById('captcha_status');
                if (captchaStatus) {
                    captchaStatus.textContent = '验证出错';
                    captchaStatus.className = 'status-error';
                }
            })
            .finally(() => {
                captchaInput._validating = false;
            });
    }

    // Setup Event Delegation for Captcha Validation
    // 为验证码验证设置事件委托
    if (captchaWrapper) {
        captchaWrapper.addEventListener('blur', function (event) {
            if (event.target && event.target.id === 'id_captcha_1') {
                const captchaInput = event.target;
                let hashkeyInput = null;
                // Try finding hashkey within closest .captcha first
                // 首先尝试在最近的 .captcha 元素内查找哈希键
                const captchaDiv = captchaInput.closest('.captcha');
                if (captchaDiv) {
                    hashkeyInput = captchaDiv.querySelector('input[type="hidden"][name="captcha_0"]');
                }
                // Fallback: search within the wrapper
                // 备用方案：在包装容器内进行搜索
                if (!hashkeyInput) {
                    hashkeyInput = captchaWrapper.querySelector('input[type="hidden"][name="captcha_0"]');
                }

                if (captchaInput && hashkeyInput) {
                    performCaptchaValidation(captchaInput, hashkeyInput);
                } else {
                    console.error("无法在 'blur' 事件中找到 hashkey 输入。");
                }
            }
        }, true); // Use capture phase  // 使用捕获阶段
        console.log("验证码 'blur' 事件监听器已设置 (委托)。");
    } else {
        console.error("未能找到 '.captcha-wrapper' 元素来设置事件委托。");
    }


    // Refresh Captcha Function (Direct src/value update version)
    // 刷新验证码函数（直接更新 src 属性 / 值的版本）
    function refreshCaptcha() {
        const refreshButton = document.getElementById('refresh-captcha');
        const icon = refreshButton ? refreshButton.querySelector('i') : null;

        // Find Elements with Logging
        // 查找元素并记录日志
        console.log("Attempting to find elements for refresh...");
        const currentCaptchaWrapper = document.querySelector('.captcha-wrapper'); // Re-query in case it changed? Unlikely but safe.  // 重新查询以防元素发生了变化？虽然这种情况不太可能发生，但这样做更保险。
        console.log("captchaWrapper:", currentCaptchaWrapper);

        const captchaImage = currentCaptchaWrapper ? currentCaptchaWrapper.querySelector('img') : null;
        console.log("captchaImage:", captchaImage);

        const hashkeyInput = currentCaptchaWrapper ? currentCaptchaWrapper.querySelector('input[type="hidden"][name="captcha_0"]') : null;
        console.log("hashkeyInput:", hashkeyInput);

        const textInput = currentCaptchaWrapper ? currentCaptchaWrapper.querySelector('input[type="text"][id="id_captcha_1"]') : null;
        console.log("textInput:", textInput);

        // Ensure all necessary elements are found
        // 确保已找到所有必要的元素。
        if (!currentCaptchaWrapper || !captchaImage || !hashkeyInput || !textInput) {
            if (!currentCaptchaWrapper) console.error("刷新失败: 未找到 .captcha-wrapper");
            if (!captchaImage) console.error("刷新失败: 未找到 img 元素在 .captcha-wrapper 内");
            if (!hashkeyInput) console.error("刷新失败: 未找到 input[name='captcha_0']");
            if (!textInput) console.error("刷新失败: 未找到 input[id='id_captcha_1']");
            console.error("未能找到所有必要的验证码元素。请检查 HTML 结构和 JavaScript 选择器。");
            return Promise.reject("Missing captcha elements");
        }

        if (refreshButton) refreshButton.disabled = true;
        if (icon) icon.classList.add('fa-spin');

        const captchaStatus = document.getElementById('captcha_status');
        if (captchaStatus) {
            captchaStatus.textContent = '';
            captchaStatus.className = 'status-text';
        }

        return fetch("{% url 'user:refresh_captcha' %}")
            .then(response => response.json())
            .then(data => {
                if (data.status === 1 && data.new_cptch_key && data.new_cptch_image_url) {
                    hashkeyInput.value = data.new_cptch_key;
                    captchaImage.src = data.new_cptch_image_url;
                    textInput.value = '';
                    console.log("验证码已通过更新 src 和 value 刷新。 新 Key:", data.new_cptch_key);
                } else {
                    console.error("刷新请求失败或返回数据无效:", data.message || '未知错误');
                    if (captchaStatus) {
                        captchaStatus.textContent = '刷新失败';
                        captchaStatus.className = 'status-error';
                    }
                    throw new Error(data.message || '刷新失败');
                }
            })
            .catch(error => {
                console.error('刷新验证码 fetch 错误:', error);
                if (captchaStatus) {
                    captchaStatus.textContent = '刷新出错';
                    captchaStatus.className = 'status-error';
                }
            })
            .finally(() => {
                if (icon) {
                    setTimeout(() => {
                        icon.classList.remove('fa-spin');
                        if (refreshButton) refreshButton.disabled = false;
                    }, 300);
                } else {
                    if (refreshButton) refreshButton.disabled = false;
                }
            });
    } // --- End of refreshCaptcha function ---
    ////--- 刷新验证码函数结束 ---

    // Attach click listener to the refresh button
    // 为刷新按钮添加点击事件监听器
    const refreshCaptchaBtn = document.getElementById('refresh-captcha');
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', refreshCaptcha);
    }

    // Attach click listener for clicking the image itself to refresh
    // 为图像本身添加点击事件监听器，以便点击图像时进行刷新操作
    if (captchaWrapper) { // Use the initially found wrapper  // 使用最初找到的包装容器
        captchaWrapper.addEventListener('click', function (event) {
            // Make sure we are clicking the actual captcha image  // 确保我们点击的是实际的验证码图片。
            if (event.target && event.target.tagName === 'IMG' && (event.target.classList.contains('captcha-image') || event.target.closest('.captcha'))) {
                refreshCaptcha();
            }
        });
    }

    // --- End of Captcha Logic ---
    //--- 验证码逻辑结束 ---


    // --- Login/Register Panel Toggle Logic (Restored Animation) ---
    //--- 登录 / 注册面板切换逻辑（恢复动画效果） ---
    const signUpBtn = document.getElementById('sign-up-btn');
    const signInBtn = document.getElementById('sign-in-btn');
    const container = document.querySelector('.login-container');

    // Event listener for the "Register" button on the LEFT panel
    // 左侧面板上 “注册” 按钮的事件监听器
    if (signUpBtn && container) {
        signUpBtn.addEventListener('click', () => {
            // Add class to trigger the slide animation
            // 添加类以触发滑动动画
            container.classList.add('sign-up-mode');
            // DO NOT redirect here, let the user click the button on the right panel
            // 不要在此处进行重定向，让用户点击右侧面板上的按钮
        });
    }

    // Event listener for the "Login" button on the RIGHT panel
    // 右侧面板上 “登录” 按钮的事件监听器
    if (signInBtn && container) {
        signInBtn.addEventListener('click', () => {
            // Remove class to slide back to the login form
            // 移除类以滑回到登录表单
            container.classList.remove('sign-up-mode');
        });
    }
    // --- End of Panel Toggle Logic ---
    //--- 面板切换逻辑结束 ---


    // --- Form Submission Logic (Optional Enhancements) ---
    //--- 表单提交逻辑（可选增强功能） ---
    const loginForm = document.querySelector('.sign-in-form');
    if (loginForm) {
        console.log("--- 开始前端登录验证 ---");

        let hasErrors = false;
        let errorMessages = [];
        let firstErrorField = null;

        // 获取输入值
        const accountInput = loginForm.querySelector('input[name="account"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');
        const captchaInput = document.getElementById('id_captcha_1'); // 假设验证码输入框 ID 仍然是这个
        const captchaStatus = document.getElementById('captcha_status');

        const account = accountInput ? accountInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const captchaValue = captchaInput ? captchaInput.value.trim() : '';

        // 1. 验证账号
        if (!account) {
            hasErrors = true;
            errorMessages.push('请输入账号（用户名或邮箱）');
            if (!firstErrorField) firstErrorField = accountInput;
        }

        // 2. 验证密码
        if (!password) {
            hasErrors = true;
            errorMessages.push('请输入密码');
            if (!firstErrorField) firstErrorField = passwordInput;
        }

        // 3. 验证验证码 (基于前端状态)
        if (!captchaValue) {
            hasErrors = true;
            errorMessages.push('请输入验证码');
            if (captchaStatus) {
                captchaStatus.textContent = '请输入验证码';
                captchaStatus.className = 'status-error';
            }
            if (!firstErrorField) firstErrorField = captchaInput;
        } else if (captchaStatus && captchaStatus.classList.contains('status-error')) {
            const errorText = captchaStatus.textContent;
            if (errorText && !errorText.includes('请输入验证码')) { // 仅当不是"请输入"错误时
                hasErrors = true;
                errorMessages.push('验证码错误或无效');
                if (!firstErrorField) firstErrorField = captchaInput;
            }
        }
    }
    // --- End of Form Submission Logic ---
    //--- 表单提交逻辑结束 ---
});