from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.http import JsonResponse, HttpResponseRedirect
from .forms import *
from .models import *
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.contrib import messages
from django.template.loader import render_to_string

def ajax_validate_captcha(request):
    from captcha.models import CaptchaStore
    if request.GET:
        captcha_response = request.GET.get('response', '')
        captcha_hashkey = request.GET.get('hashkey', '')
        try:
            captcha = CaptchaStore.objects.get(hashkey=captcha_hashkey)
            if captcha.response == captcha_response.lower():
                captcha.delete()  # 验证成功后删除记录
                return JsonResponse({'status': 1})
            return JsonResponse({'status': 0})
        except:
            return JsonResponse({'status': 0})
    return JsonResponse({'status': 0})

def refresh_captcha(request):
    new_captcha = CaptchaForm()
    return JsonResponse({
        'new_captcha_html': new_captcha['captcha'].as_widget()
    })

def activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = BlogUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, BlogUser.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        login(request, user)

        return redirect('/')  # 成功
    else:
        return redirect('/register')  # 失败

def register_view(request):
    if request.method == "POST":
        # 验证表单和验证码
        reg_form = UserRegForm(request.POST)
        captcha = CaptchaForm(request.POST)
        new_captcha = CaptchaForm()

        if not captcha.is_valid():
            return render(request, "Register.html", {
                "error": "请填写正确的验证码!",
                "captcha": new_captcha,
                'reg_form': reg_form,
                "refresh_captcha": True,
            })

        if reg_form.is_valid():
            user = reg_form.save(commit=False)
            user.is_active = False
            user.save()

            # 发送激活邮件
            subject = '邮箱验证'
            message = render_to_string('RegMail.html', {
                'user': user,
                'domain': '127.0.0.1:8000',  # 你的域名
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            email = EmailMessage(subject, message, 'm17866819721@163.com', [user.email])
            email.content_subtype = "html"
            try:
                email.send(fail_silently=False)
            except Exception as e:
                messages.error(request, f'验证邮件发送失败! {e} 请重新注册！')
                user.delete()
                return redirect('/user/login', {})

            messages.success(request, '验证邮件发送成功！已将您重定向回登录页面!')
            return redirect('/user/login')
        else:
            return render(request, 'Register.html',{
                'reg_form': reg_form,
                'captcha': captcha,
            })
    else:
        reg_form = UserRegForm(request.POST)
        captcha = CaptchaForm(request.POST)

        # 渲染页面
        return render(request, 'Register.html', {
            'reg_form': reg_form,
            'captcha': captcha,
        })


def login_view(request):
    if request.method == "POST":
        user_login = UserLoginForm(request.POST)
        captcha = CaptchaForm(request.POST)
        new_captcha = CaptchaForm()

        user_login.account = request.POST['account']
        user_login.password = request.POST['password']
        if not captcha.is_valid():
            return render(request, "Login.html", {
                "error": "请填写正确的验证码!",
                "captcha": new_captcha,
                "refresh_captcha": True,
            })

        if '@' in user_login.account:
            try:
                user = BlogUser.objects.get(email=user_login.account)
                user_login.account = user.username
            except BlogUser.DoesNotExist:
                return render(request, "Login.html", {
                    "error": "邮箱未注册，请先注册账号!",
                    "captcha": new_captcha,
                    "refresh_captcha": True,
                })

        user = authenticate(username=user_login.account, password=user_login.password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect("/")
        else:
            user = BlogUser.objects.get(username=user_login.account)
            if user is None or not user.check_password(user_login.password):
                return render(request, "Login.html", {
                    "error": "账户或密码错误，请重试！",
                    "captcha": new_captcha,
                    "refresh_captcha": True,
                })
            else:
                return render(request, "Login.html", {
                    "error": "此账户还未激活，请使用激活邮件激活！",
                    "captcha": new_captcha,
                    "refresh_captcha": True,
                })
    else:
        user_login = UserLoginForm()
        captcha = CaptchaForm()
        return render(request, "Login.html", {
            "user_login": user_login, "captcha": captcha})