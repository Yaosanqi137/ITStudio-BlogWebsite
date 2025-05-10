from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponseRedirect
from .forms import *
from .models import *
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.contrib import messages
from django.template.loader import render_to_string
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from article.models import Article, Collection
from django.core.paginator import Paginator
from pages.models import UserMessage

def send_message(user, content, url):
    message = UserMessage.objects.create(user=user)
    message.content = content
    message.redirect_url = url
    message.save()


def ajax_validate_captcha(request):
    if request.method == 'GET':
        captcha_response = request.GET.get('response', '').strip()
        captcha_hashkey = request.GET.get('hashkey', '').strip()
        if captcha_response and captcha_hashkey:
            try:
                captcha = CaptchaStore.objects.get(hashkey=captcha_hashkey)
                if captcha.response == captcha_response.lower():
                    # captcha.delete() # <--- 注释掉或删除这一行
                    return JsonResponse({'status': 1}) # 只返回成功状态，不删除记录
                else:
                    # 验证失败时，可以考虑删除，防止暴力破解同一个key，但非必须
                    # captcha.delete()
                    return JsonResponse({'status': 0, 'message': '错误的验证码'})
            except CaptchaStore.DoesNotExist:
                return JsonResponse({'status': 0, 'message': '验证码不存在或过期'})
            except Exception as e:
                print(f"Error during captcha validation: {e}")
                return JsonResponse({'status': 0, 'message': '服务器出现了错误'})
        else:
            return JsonResponse({'status': 0, 'message': '验证码丢失'})
    return JsonResponse({'status': 0, 'message': '未知的请求'})

def refresh_captcha(request):
    if request.method == 'GET':
        try:
            new_key = CaptchaStore.generate_key()
            new_image_url = captcha_image_url(new_key)
            return JsonResponse({
                'status': 1,
                'new_cptch_key': new_key,
                'new_cptch_image_url': new_image_url
            })
        except Exception as e:
            print(f"Error during captcha refresh: {e}")
            return JsonResponse({'status': 0, 'message': 'Server error during refresh'})
    return JsonResponse({'status': 0, 'message': 'Invalid request method'})

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
                # user.delete()
                return redirect('/user/login', {})

            messages.success(request, '验证邮件发送成功！已将您重定向回登录页面!')
            return redirect('/user/login')
        else:
            return render(request, 'Register.html',{
                'error': '用户名或者邮箱已存在，请选择其他用户名',
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

        if user_login.is_valid():
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
                try:
                    user = BlogUser.objects.get(username=user_login.account)
                except BlogUser.DoesNotExist:
                    return render(request, "Login.html", {
                        "error": "账户或密码错误，请重试！",
                        "captcha": new_captcha,
                        "refresh_captcha": True,
                    })
                if not user.check_password(user_login.password):
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

@login_required(login_url="/user/login")
def logout_view(request):
    """
    处理用户登出请求
    """
    logout(request) # 调用 Django 内置的 logout 函数，清除 session
    # 可以重定向到首页或登录页
    return redirect('/') # 或者 redirect('/user/login/')

@login_required(login_url="/user/login")
def profile_view(request):
    user = BlogUser.objects.get(username=request.user.username)
    if request.method == "POST":
        profile_form = ProfileForm(request.POST, request.FILES, instance=user)
        if profile_form.is_valid():
            profile_form.save()
        if (BlogUser.objects.filter(nickname=profile_form.data['nickname'])
                    .exclude(pk=request.user.pk).exists()):
            return render(request, "Profile.html", {
                "profile_form": profile_form,
                "error": "已经有人叫这个名字了！"
            })
        return redirect('/user/profile')
    else:
        profile_form = ProfileForm(instance=user)
        return render(request, "Profile.html", {"profile_form": profile_form})

def profile_prev_view(request, username):
    user = get_object_or_404(BlogUser, username=username)
    current_tab = request.GET.get('tab', 'articles')  # 获取当前选中的标签

    # 获取四个板块数据
    articles = Article.objects.filter(author=user).order_by('-created_time')
    followers = user.followers.all().select_related('follower')
    following = user.following.all().select_related('followed')
    collection = Collection.objects.filter(collector=user)

    # 分页处理（保持原有分页逻辑）
    paginator = Paginator(articles, 10)
    page_number = request.GET.get('page')
    articles_page = paginator.get_page(page_number)

    # 添加关注状态判断
    is_following = False
    if request.user.is_authenticated and request.user.pk != user.pk:
        is_following = Follow.objects.filter(
            follower=request.user,
            followed=user
        ).exists()

    context = {
        'user': user,
        'articles': articles_page,
        'followers': followers,
        'following': following,
        'current_tab': current_tab,
        'is_following': is_following,
        'background_url': user.backimg.url,
        'collection': collection,
    }
    return render(request, 'Space.html', context)

@login_required(login_url="/user/login")
def follow_user(request, user_id):
    user_to_follow = get_object_or_404(BlogUser, id=user_id)
    follower_user = get_object_or_404(BlogUser, pk=request.user.pk)  # 因为 request.user 本身也是 BlogUser

    if follower_user != user_to_follow:
        Follow.objects.get_or_create(follower=follower_user, followed=user_to_follow)
        # send_follow_message(user_to_follow, follower_user)
    host = request.build_absolute_uri('/')[:-1]
    url = f"{host}/user/profile/{request.user.username}"
    send_message(user_to_follow, f"{request.user.username} 关注你啦!", url)
    return redirect(request.META.get('HTTP_REFERER', '/'))

@login_required(login_url="/user/login")
def unfollow_user(request, user_id):
    user_to_unfollow = get_object_or_404(BlogUser, id=user_id)
    follower_user = get_object_or_404(BlogUser, id=request.user.id)
    Follow.objects.filter(follower=follower_user, followed=user_to_unfollow).delete()
    # send_unfollow_message(user_to_unfollow, follower_user)
    return redirect(request.META.get('HTTP_REFERER', '/'))
