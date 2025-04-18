from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from user.models import *
from article.models import *
from comment.models import *
from pages.models import *

@login_required(login_url='/user/login/')
def mark_message_read(request, message_id): # 标记已读信息
    user = BlogUser.objects.get(username=request.user.username)
    message = get_object_or_404(UserMessage, id=message_id, user=user)
    message.mark_as_read()
    return JsonResponse({'status': 'success'})

def homepage_view(request):
    context = {}
    all_articles = Article.objects.all()
    if all_articles.count() >= 6:
        articles_looks = all_articles.order_by('-looks')[:6]
        articles_likes = all_articles.order_by('-likes')[:6]
    else:
        articles_looks = all_articles.order_by('-looks')
        articles_likes = all_articles.order_by('-likes')
    context['articles_looks'] = articles_looks
    context['articles_likes'] = articles_likes

    if request.user.is_authenticated:
        user = BlogUser.objects.get(username=request.user.username)
        messages = UserMessage.objects.filter(user=user, is_read=False)
        if not user.avatar:
            user.avatar = get_random_avatars()
        context['user'] = user
        context['messages'] = messages
        return render(request, "Hub.html", context)
    else:
        return render(request, "Hub.html", context)