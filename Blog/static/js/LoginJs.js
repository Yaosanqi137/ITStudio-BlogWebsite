// LoginJs.js
// 前端验证码交互逻辑（适配外部JS文件）
"use strict";

// ======================
// 全局配置检查
// ======================
if (!window.DJANGO_URLS || !window.DJANGO_URLS.refresh_captcha) {
    console.error('[配置错误] 未找到Django URL配置，请确保模板中已注入window.DJANGO_URLS');
    throw new Error('Missing Django URL configuration');
}

// ======================
// 工具函数
// ======================
const Utils = {
    // 获取CSRF令牌
    getCSRFToken: () => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || null;
    },

    // 显示状态消息
    showStatus: (elementId, message, isSuccess) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.className = isSuccess ? 'status-success' : 'status-error';
        }
    },

    // 禁用按钮
    toggleButton: (btnId, disabled) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = disabled;
    }
};

// ======================
// 验证码核心逻辑
// ======================
const CaptchaManager = {
    // 初始化验证码模块
    init: function() {
        this.bindEvents();
        console.log('[初始化] 验证码模块已加载');
    },

    // 绑定事件监听
    bindEvents: function() {
        // 刷新按钮
        document.getElementById('refresh-captcha')?.addEventListener('click', () => this.refreshCaptcha());

        // 图片点击刷新
        document.querySelector('.captcha-wrapper')?.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') this.refreshCaptcha();
        });

        // 输入框失焦验证
        document.querySelector('.captcha-wrapper')?.addEventListener('blur', (e) => {
            if (e.target.matches('input[name="captcha_1"]')) {
                this.validateCaptcha(e.target);
            }
        }, true);
    },

    // 刷新验证码
    refreshCaptcha: async function() {
        const btnId = 'refresh-captcha';
        try {
            Utils.toggleButton(btnId, true);
            Utils.showStatus('captcha_status', '刷新中...', true);

            const response = await fetch(window.DJANGO_URLS.refresh_captcha, {
                headers: {
                    'X-CSRFToken': Utils.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) throw new Error(`HTTP错误 ${response.status}`);

            const data = await response.json();
            if (data.status !== 1) throw new Error(data.message || '未知错误');

            // 更新DOM元素
            const wrapper = document.querySelector('.captcha-wrapper');
            if (wrapper) {
                wrapper.querySelector('input[name="captcha_0"]').value = data.new_cptch_key;
                const img = wrapper.querySelector('img');
                img.src = data.new_cptch_image_url + '?t=' + Date.now();
                wrapper.querySelector('input[name="captcha_1"]').value = '';
            }

            Utils.showStatus('captcha_status', '验证码已刷新', true);
        } catch (error) {
            console.error('[刷新失败]', error);
            Utils.showStatus('captcha_status', `刷新失败: ${error.message}`, false);
        } finally {
            Utils.toggleButton(btnId, false);
        }
    },

    // 验证验证码
    validateCaptcha: async function(inputElement) {
        const hashkeyInput = inputElement.closest('.captcha-wrapper')?.querySelector('input[name="captcha_0"]');
        if (!hashkeyInput) {
            console.warn('[验证错误] 未找到关联的hashkey');
            return;
        }

        const params = new URLSearchParams({
            response: inputElement.value.trim(),
            hashkey: hashkeyInput.value
        });

        try {
            const response = await fetch(`${window.DJANGO_URLS.ajax_validate}?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (!response.ok) throw new Error(`HTTP错误 ${response.status}`);

            const data = await response.json();
            Utils.showStatus('captcha_status',
                data.message || (data.status ? '验证码有效' : '验证码错误'),
                data.status
            );
        } catch (error) {
            console.error('[验证失败]', error);
            Utils.showStatus('captcha_status', '验证服务不可用', false);
        }
    }
};

// ======================
// 登录/注册面板切换
// ======================
const PanelManager = {
    init: function() {
        const container = document.querySelector('.login-container');
        if (!container) return;

        // 注册按钮
        document.getElementById('sign-up-btn')?.addEventListener('click', () => {
            container.classList.add('sign-up-mode');
        });

        // 登录按钮
        document.getElementById('sign-in-btn')?.addEventListener('click', () => {
            container.classList.remove('sign-up-mode');
        });

        console.log('[初始化] 面板切换模块已加载');
    }
};

// ======================
// 文档加载初始化
// ======================
document.addEventListener('DOMContentLoaded', () => {
    CaptchaManager.init();
    PanelManager.init();
});