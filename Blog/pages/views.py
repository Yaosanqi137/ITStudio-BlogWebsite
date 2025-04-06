from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from user.models import *
from article.models import *


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
        context['user'] = user
        return render(request, "Hub.html", context)
    else:
        return render(request, "Hub.html", context)