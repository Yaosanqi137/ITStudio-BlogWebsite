from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
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


def get_random_avatars():
    pass


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
        followers = Follow.objects.filter(followed=user).select_related('follower')
        followed_users = Follow.objects.filter(follower=user).select_related('followed')
        collections = Collection.objects.filter(collector=user)

        context['user'] = user
        context['messages'] = messages
        context['followers_count'] = followers.count()
        context['followed_count'] = followed_users.count()
        context['collections'] = collections.count()
        return render(request, "Hub.html", context)
    else:
        return render(request, "Hub.html", context)

def search(request):
    search_query = request.GET.get('search', '').strip()

    # 文章搜索
    article_results = Article.objects.filter(
        Q(title__icontains=search_query) |
        Q(body__icontains=search_query)
    ).order_by('-created_time') if search_query else Article.objects.none()
    article_paginator = Paginator(article_results, 10)
    article_page = article_paginator.get_page(request.GET.get('article_page'))

    # 用户搜索
    user_results = BlogUser.objects.filter(
        Q(username__icontains=search_query) |
        Q(nickname__icontains=search_query)
    ).order_by('id') if search_query else BlogUser.objects.none()
    user_paginator = Paginator(user_results, 10)
    user_page = user_paginator.get_page(request.GET.get('user_page'))

    # 评论搜索
    comment_results = Comment.objects.filter(
        Q(content__icontains=search_query) |
        Q(user__username__icontains=search_query)
    ).order_by('-created') if search_query else Comment.objects.none()
    comment_paginator = Paginator(comment_results, 10)
    comment_page = comment_paginator.get_page(request.GET.get('comment_page'))

    return render(request, 'ArticleList.html', {
        'search_query': search_query,
        'articles': article_page,
        'users': user_page,
        'comments': comment_page,
    })
