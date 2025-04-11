document.addEventListener('DOMContentLoaded', function () {
    // ================== 验证码模块 ==================
    const captchaWrapper = document.querySelector('.captcha-wrapper');

    // 验证码实时验证函数
    function performCaptchaValidation(captchaInput, hashkeyInput) {
        const response = captchaInput.value.trim();
        const hashkey = hashkeyInput.value.trim();

        if (!response || !hashkey) {
            const statusEl = document.getElementById('captcha_status');
            if (statusEl) {
                statusEl.textContent = '请输入验证码';
                statusEl.className = 'status-error';
            }
            return;
        }

        if (captchaInput._validating) return;
        captchaInput._validating = true;

        // 使用正确URL
        fetch(`${window.DJANGO_URLS.ajax_validate}?response=${encodeURIComponent(response)}&hashkey=${encodeURIComponent(hashkey)}`)
            .then(res => res.json())
            .then(data => {
                const statusEl = document.getElementById('captcha_status');
                if (!statusEl) return;

                statusEl.textContent = data.message || (data.status ? '验证码正确' : '验证码错误');
                statusEl.className = data.status ? 'status-success' : 'status-error';
            })
            .catch(err => {
                console.error('验证码验证错误:', err);
                const statusEl = document.getElementById('captcha_status');
                if (statusEl) {
                    statusEl.textContent = '验证服务异常';
                    statusEl.className = 'status-error';
                }
            })
            .finally(() => { captchaInput._validating = false; });
    }

    // 实时输入验证
    if (captchaWrapper) {
        captchaWrapper.addEventListener('input', function(e) {
            if (e.target.id === 'id_captcha_1') {
                const hashkeyInput = captchaWrapper.querySelector('input[name="captcha_0"]');
                performCaptchaValidation(e.target, hashkeyInput);
            }
        });
    }

    // 刷新验证码函数
    function refreshCaptcha() {
        const wrapper = document.querySelector('.captcha-wrapper');
        if (!wrapper) return;

        const captchaImg = wrapper.querySelector('img');
        const hashkeyInput = wrapper.querySelector('input[name="captcha_0"]');
        const textInput = wrapper.querySelector('#id_captcha_1');
        const refreshBtn = document.getElementById('refresh-captcha');
        const icon = refreshBtn?.querySelector('i');

        if (icon) icon.classList.add('fa-spin');
        if (refreshBtn) refreshBtn.disabled = true;

        fetch(window.DJANGO_URLS.refresh_captcha)
            .then(res => res.json())
            .then(data => {
                if (data.status === 1) {
                    hashkeyInput.value = data.new_cptch_key;
                    captchaImg.src = data.new_cptch_image_url;
                    textInput.value = '';
                    const statusEl = document.getElementById('captcha_status');
                    if (statusEl) {
                        statusEl.textContent = '';
                        statusEl.className = '';
                    }
                } else {
                    throw new Error(data.message || '刷新失败');
                }
            })
            .catch(err => {
                console.error('验证码刷新错误:', err);
                const statusEl = document.getElementById('captcha_status');
                if (statusEl) {
                    statusEl.textContent = '刷新失败，点击重试';
                    statusEl.className = 'status-error';
                }
            })
            .finally(() => {
                if (icon) icon.classList.remove('fa-spin');
                if (refreshBtn) refreshBtn.disabled = false;
            });
    }

    // 绑定刷新事件
    document.getElementById('refresh-captcha')?.addEventListener('click', refreshCaptcha);
    captchaWrapper?.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG') refreshCaptcha();
    });


    // --- Start of Password Strength Logic (Re-integrated and Checked) ---
    const passwordInput = document.querySelector('input[name="password1"]');
    const confirmPasswordInput = document.querySelector('input[name="password2"]');
    const strengthBar = document.querySelector('.strength-bar');
    const passwordTips = document.querySelector('.password-tips');
    const passwordMessage = document.getElementById('password-message');

    // Tip elements
    const lengthTip = document.getElementById('length-tip');
    const uppercaseTip = document.getElementById('uppercase-tip');
    const lowercaseTip = document.getElementById('lowercase-tip');
    const numberTip = document.getElementById('number-tip');
    const specialTip = document.getElementById('special-tip');

    // Function to update tip item UI
    function updateTipItem(tipElement, isValid) {
        if (!tipElement) return;
        const icon = tipElement.querySelector('i');
        if (isValid) {
            tipElement.classList.add('valid');
            tipElement.classList.remove('invalid');
            icon.className = 'fas fa-check';
        } else {
            tipElement.classList.add('invalid');
            tipElement.classList.remove('valid');
            icon.className = 'fas fa-times';
        }
    }

    // Function to check password criteria and update UI
    function checkPasswordStrength() {
        if (!passwordInput || !strengthBar || !passwordTips) {
            console.warn("Password strength elements not found.");
            return;
        }

        const password = passwordInput.value;
        let score = 0;
        let criteriaMet = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)
        };

        // 更新提示项 UI
        updateTipItem(lengthTip, criteriaMet.length);
        updateTipItem(uppercaseTip, criteriaMet.uppercase);
        updateTipItem(lowercaseTip, criteriaMet.lowercase);
        updateTipItem(numberTip, criteriaMet.number);
        updateTipItem(specialTip, criteriaMet.special);

        // 计算分数
        if (criteriaMet.length) score++;
        if (criteriaMet.uppercase) score++;
        if (criteriaMet.lowercase) score++;
        if (criteriaMet.number) score++;
        if (criteriaMet.special) score++;

        // 更新强度条
        const strengthPercentage = (score / 5) * 100;
        strengthBar.style.width = strengthPercentage + '%';

        if (score <= 1) {
            strengthBar.style.backgroundColor = '#ff4d4d'; // 弱 (红色)
        } else if (score <= 3) {
            strengthBar.style.backgroundColor = '#ffa500'; // 中 (橙色)
        } else if (score === 4) {
            strengthBar.style.backgroundColor = '#ffd700'; // 良好 (黄色)
        } else {
            strengthBar.style.backgroundColor = '#4caf50'; // 强 (绿色)
        }

        // 显示/隐藏提示
        if (password.length > 0) {
            passwordTips.style.display = 'block';
        } else {
            passwordTips.style.display = 'none';
        }
    }

    // Function to check if passwords match
    function checkPasswordMatch() {
        if (!passwordInput || !confirmPasswordInput || !passwordMessage) {
            console.warn("Password confirmation elements not found.");
            return; // Exit if elements are missing
        }
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword.length === 0) {
            passwordMessage.textContent = '';
            passwordMessage.className = 'password-message'; // Reset class
            confirmPasswordInput.style.borderColor = ''; // Reset border
        } else if (password === confirmPassword) {
            passwordMessage.textContent = '密码匹配';
            passwordMessage.className = 'password-message success';
            confirmInput.style.borderColor = '#4caf50'; // Green border
        } else {
            passwordMessage.textContent = '密码不匹配';
            passwordMessage.className = 'password-message error';
            confirmPasswordInput.style.borderColor = '#ff4d4d'; // Red border
        }
    }

    // Add event listeners if elements exist
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
        passwordInput.addEventListener('input', checkPasswordMatch);
        passwordInput.addEventListener('focus', () => {
            if (passwordInput.value.length > 0) {
                passwordTips.style.display = 'block';
            }
        });
        passwordInput.addEventListener('blur', () => {
            if (passwordInput.value.length === 0) {
                passwordTips.style.display = 'none';
            }
        });
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    // --- End of Password Strength Logic ---


    // --- Other JS (Username/Email validation, Form submission prevention) ---
    // Username validation (Example - keep if needed)
    const usernameInput = document.querySelector('input[name="username"]');
    const usernameTips = document.getElementById('username-tips');
    const usernameLengthTip = document.getElementById('username-length-tip');
    const usernameCharsTip = document.getElementById('username-chars-tip');
    const usernameEmptyTip = document.getElementById('username-empty-tip'); // 新增空值提示元素

    if (usernameInput && usernameTips && usernameLengthTip && usernameCharsTip && usernameEmptyTip) {
        usernameInput.addEventListener('input', function () {
            const username = this.value;
            let showTips = false;

            // 空值检查
            if (!username || username.trim() === '') {
                usernameEmptyTip.style.display = 'flex';
                showTips = true;
            } else {
                usernameEmptyTip.style.display = 'none';

                // 长度检查 - 2-150字符
                if (username.length < 2 || username.length > 150) {
                    usernameLengthTip.textContent = username.length < 2 ?
                        '用户名长度不能少于2个字符' : '用户名长度不能超过150个字符';
                    usernameLengthTip.style.display = 'flex';
                    showTips = true;
                } else {
                    usernameLengthTip.style.display = 'none';
                }

                // 字符检查 - 只允许字母、数字和下划线
                if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                    usernameCharsTip.style.display = 'flex';
                    showTips = true;
                } else {
                    usernameCharsTip.style.display = 'none';
                }
            }

            usernameTips.style.display = showTips ? 'block' : 'none';
        });

        // 失去焦点时检查空值
        usernameInput.addEventListener('blur', function () {
            if (!this.value || this.value.trim() === '') {
                usernameEmptyTip.style.display = 'flex';
                usernameTips.style.display = 'block';
            }
        });
    }

    // Email validation (Example - keep if needed)
    const emailInput = document.querySelector('input[name="email"]');
    const emailTips = document.getElementById('email-tips');
    const emailFormatTip = document.getElementById('email-format-tip');
    const emailEmptyTip = document.getElementById('email-empty-tip'); // 新增空值提示元素

    if (emailInput && emailTips && emailFormatTip && emailEmptyTip) {
        emailInput.addEventListener('input', function () {
            const email = this.value;
            let showTips = false;

            // 空值检查
            if (!email || email.trim() === '') {
                emailEmptyTip.style.display = 'flex';
                showTips = true;
            } else {
                emailEmptyTip.style.display = 'none';

                // 格式检查
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    emailFormatTip.style.display = 'flex';
                    showTips = true;
                } else {
                    emailFormatTip.style.display = 'none';
                }
            }

            emailTips.style.display = showTips ? 'block' : 'none';
        });

        // 失去焦点时检查空值
        emailInput.addEventListener('blur', function () {
            if (!this.value || this.value.trim() === '') {
                emailEmptyTip.style.display = 'flex';
                emailTips.style.display = 'block';
            }
        });
    }

    // 修改表单提交验证逻辑
    const registerForm = document.querySelector('.sign-up-form');
    if (registerForm) {
        console.log("--- 开始前端注册验证 ---"); // 添加日志

        let hasErrors = false;
        let errorMessages = [];
        let firstErrorField = null; // 用于聚焦

        // --- 清除之前的提示状态 ---
        document.querySelectorAll('.field-tips').forEach(tip => tip.style.display = 'none');
        document.querySelectorAll('.field-tip-item').forEach(item => item.style.display = 'none');
        if (passwordMessage) passwordMessage.textContent = '';

        // 1. 验证用户名
        const username = usernameInput ? usernameInput.value.trim() : '';
        if (!username) {
            hasErrors = true; errorMessages.push('请输入用户名');
            if (usernameEmptyTip) usernameEmptyTip.style.display = 'flex';
            if (!firstErrorField) firstErrorField = usernameInput;
        } else if (username.length < 2 || username.length > 150) {
            hasErrors = true; errorMessages.push('用户名长度应为2-150个字符');
            if (usernameLengthTip) usernameLengthTip.style.display = 'flex';
            if (!firstErrorField) firstErrorField = usernameInput;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            hasErrors = true; errorMessages.push('用户名只能包含字母、数字和下划线');
            if (usernameCharsTip) usernameCharsTip.style.display = 'flex';
            if (!firstErrorField) firstErrorField = usernameInput;
        }
        if (hasErrors && usernameTips) usernameTips.style.display = 'block'; // 显示用户名提示容器

        // 2. 验证邮箱
        const email = emailInput ? emailInput.value.trim() : '';
        let emailHasError = false;
        if (!email) {
            hasErrors = true; emailHasError = true; errorMessages.push('请输入电子邮箱');
            if (emailEmptyTip) emailEmptyTip.style.display = 'flex';
            if (!firstErrorField) firstErrorField = emailInput;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            hasErrors = true; emailHasError = true; errorMessages.push('请输入有效的电子邮箱地址');
            if (emailFormatTip) emailFormatTip.style.display = 'flex';
            if (!firstErrorField) firstErrorField = emailInput;
        }
        if (emailHasError && emailTips) emailTips.style.display = 'block'; // 显示邮箱提示容器


        // 3. 验证密码
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        let passwordHasError = false;
        let strengthIssues = []; // 重置

        if (!password) {
            hasErrors = true; passwordHasError = true; errorMessages.push('请输入密码');
            if (!firstErrorField) firstErrorField = passwordInput;
        } else {
            // 检查密码强度
            if (password.length < 8) strengthIssues.push('密码长度至少为8个字符');
            if (!/[A-Z]/.test(password)) strengthIssues.push('密码需包含大写字母');
            if (!/[a-z]/.test(password)) strengthIssues.push('密码需包含小写字母');
            if (!/[0-9]/.test(password)) strengthIssues.push('密码需包含数字');
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) strengthIssues.push('密码需包含特殊字符');

            if (strengthIssues.length > 0) {
                hasErrors = true; passwordHasError = true;
                errorMessages.push('密码强度不足: ' + strengthIssues.join(', '));
                if (!firstErrorField) firstErrorField = passwordInput;
            }
        }
        if (passwordHasError && passwordTips) passwordTips.style.display = 'block'; // 显示密码提示容器


        // 检查密码匹配
        let confirmPasswordHasError = false;
        if (password !== confirmPassword) {
            hasErrors = true; confirmPasswordHasError = true;
            errorMessages.push('两次输入的密码不匹配');
            if (passwordMessage) {
                passwordMessage.textContent = '密码不匹配';
                passwordMessage.className = 'password-message error';
            }
            if (!firstErrorField) firstErrorField = confirmPasswordInput;
        } else if (confirmPassword && password) { // 只有在两个都有值且匹配时才显示成功
            if (passwordMessage) {
                passwordMessage.textContent = '密码匹配';
                passwordMessage.className = 'password-message success';
            }
        }

        document.querySelector('.sign-up-form')?.addEventListener('submit', function(e) {
            e.preventDefault();

            // 强制触发验证码验证
            const captchaInput = document.getElementById('id_captcha_1');
            const hashkeyInput = document.querySelector('input[name="captcha_0"]');
            if (captchaInput && hashkeyInput) {
                performCaptchaValidation(captchaInput, hashkeyInput);
            }

            // 检查所有验证状态
            const isValid = Array.from(document.querySelectorAll('.status-error')).every(el =>
                !el.textContent.includes('验证码')
            );

            if (isValid) {
                this.submit(); // 实际提交表单
            } else {
                alert('请正确填写所有字段后再提交');
            }
        });

        // --- 输出结果到控制台 ---
        if (hasErrors) {
            // e.preventDefault(); // 已在开头阻止
            console.error("--- 注册前端验证失败 ---");
            console.warn("错误详情:", errorMessages);

            // 创建错误提示 (可选，可以用 console 替代 alert)
            // let errorSummary = '注册信息有误，请检查以下问题：\n• ' + errorMessages.join('\n• ');
            // alert(errorSummary); // --- 移除 alert ---

            // 聚焦到第一个有问题的输入框
            if (firstErrorField) {
                firstErrorField.focus();
            }
        } else {
            // --- 模拟注册成功 ---
            console.log("--- 注册前端验证通过 ---");
            console.log("模拟注册成功！");
            // 可以选择性地输出表单数据
            const formData = new FormData(registerForm);
            const data = {};
            formData.forEach((value, key) => {
                // 不记录密码和验证码到日志
                if (key !== 'password' && key !== 'confirm_password' && key !== 'captcha_1') {
                    data[key] = value;
                }
            });
            console.log("模拟提交的数据 (部分):", data);
            // alert("模拟注册成功！请查看控制台获取详情。"); // --- 移除 alert ---
        }
    }
    // --- End of Other JS ---

});