import markdown
import json
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect,get_object_or_404
from django.shortcuts import render
from .forms import ArticlePostForm
from .models import Article, Collection, Like
from user.models import BlogUser,Follow
from django.db.models import Q
from comment.models import Comment
from django.contrib.auth.models import User
from comment.forms import CommentForm
from django.views.decorators.http import require_POST
from django.db import transaction
from django.db import models
from pages.models import UserMessage

# 分类选项
category = {
    "生活": "生活",
    "闲谈": "闲谈",
    "软件": "软件",
    "硬件": "硬件",
    "知识": "知识",
    "美食": "美食",
    "其他": "其他",
}

def send_message(user, content, url):
    message = UserMessage.objects.create(user=user)
    message.content = content
    message.redirect_url = url
    message.save()

def list_view(request):
    search_query = request.GET.get('search', '') # 获取搜索词
    selected_category = request.GET.get('category', '') # 获取分类

    articles = Article.objects.all()

    # 由搜索词筛选
    if search_query:
        articles = articles.filter(Q(title__icontains=search_query) | Q(body__icontains=search_query))

    # 由分类筛选
    if selected_category:
        articles = articles.filter(category=selected_category)

    # 分页
    articles = Paginator(articles, 10)
    page = request.GET.get('page')
    articles = articles.get_page(page)

    return render(request, 'ArticleList.html', {
        'articles': articles,
        'category': category,
    })

def detail_view(request, id):
    article = Article.objects.get(id=id)
    comments = Comment.objects.filter(article=id)
    comment_form = CommentForm()
    article.looks += 1
    article.save()

    # 是否收藏了这篇文章
    is_collected = False
    collect = Collection.objects.filter(collector=request.user.id, article=id).exists()
    if collect:
        is_collected = True

    is_liked = False
    like = Like.objects.filter(user=request.user.id, article=id).exists()
    if like:
        is_liked = True

    # 判断是否关注了作者
    is_following_author = False
    if request.user.is_authenticated and request.user.username != article.author.username:
        user = get_object_or_404(BlogUser, pk=request.user.pk)
        is_following_author = Follow.objects.filter(
            follower=user,
            followed=article.author
        ).exists()

    article.body = markdown.markdown(article.body, extensions=[
        'markdown.extensions.extra',  # 表格、缩写等扩展
        'markdown.extensions.codehilite',  # 代码高亮
        'markdown.extensions.toc',  # 目录生成
        'markdown.extensions.fenced_code',  # 隔离代码块
        'markdown.extensions.admonition',  # 提示块
    ])
    context = {'article': article,
               'comments': comments,
               'comment_form': comment_form,
               'is_collected': is_collected,
               'is_liked': is_liked,
               'is_following_author': is_following_author
               }
    return render(request, 'Article.html', context)

@login_required(login_url='/user/login/')
def create_view(request):
    if request.method == 'POST':
        article_post_form = ArticlePostForm(request.POST, request.FILES)
        if article_post_form.is_valid():
            new_article = article_post_form.save(commit=False)
            new_article.author = BlogUser.objects.get(pk=request.user.pk)
            new_article.save()
            id = new_article.id

            followers = Follow.objects.filter(followed=request.user.id)

            host = request.build_absolute_uri('/')[:-1]
            url = f"{host}/article/detail/{id}"
            for follow in followers:
                send_message(follow.follower, f"{request.user.username} 更新了新文章！", url)
            return redirect(f'/article/detail/{id}')
        else:
            return render(request, 'ArticlePost.html', {'article_post_form': article_post_form})
    else:
        article_post_form = ArticlePostForm()
        return render(request, 'ArticlePost.html', {'article_post_form': article_post_form})

@login_required(login_url='/user/login/')
def delete_view(request, id):
    article = Article.objects.get(id=id)
    if request.user.username != article.author.username:
        return redirect('/')
    article.delete()
    return redirect('/article/my')

@login_required(login_url='/user/login/')
def edit_view(request, id):
    article = Article.objects.get(id=id)
    if request.user.username != article.author.username:
        return redirect('/')
    if request.method == 'POST':
        article_post_form = ArticlePostForm(request.POST, request.FILES, instance=article)
        if article_post_form.is_valid():
            article_post_form.save()
            return redirect('/article/list')
        else:
            return render(request, 'ArticlePost.html', {'article_post_form': article_post_form})
    else:
        article_post_form = ArticlePostForm(instance=article)
        return render(request, 'ArticlePost.html', {'article_post_form': article_post_form})

@login_required(login_url='/user/login/')
def my_view(request):
    search_query = request.GET.get('search', '') # 获取搜索词
    selected_category = request.GET.get('category', '') # 获取分类

    articles = Article.objects.filter(author=request.user.id)

    # 由搜索词筛选
    if search_query:
        articles = articles.filter(Q(title__icontains=search_query) | Q(body__icontains=search_query))

    # 由分类筛选
    if selected_category:
        articles = articles.filter(category=selected_category)

    # 分页
    articles = Paginator(articles, 10)
    page = request.GET.get('page')
    articles = articles.get_page(page)

    return render(request, 'MyArticle.html', {
        'articles': articles,
        'category': category,
    })

@require_POST
@login_required(login_url='/user/login/')
def like_view(request, id):
    try:
        with transaction.atomic():
            article = get_object_or_404(Article, id=id)
            user = get_object_or_404(BlogUser, pk=request.user.pk)

            # 检查是否已点赞
            like, created = Like.objects.get_or_create(
                user=user,
                article=article
            )

            if created:
                # 新点赞
                article.likes = models.F('likes') + 1
                article.save()
                article.refresh_from_db()
                is_liked = True
                message = '点赞成功'
            else:
                # 取消点赞
                like.delete()
                article.likes = models.F('likes') - 1
                article.save()
                article.refresh_from_db()
                is_liked = False
                message = '已取消点赞'

            return JsonResponse({
                'status': 'success',
                'is_liked': is_liked,
                'likes': article.likes,
                'message': message
            })

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@require_POST
@login_required(login_url='/user/login/')
def collect_view(request, id):
    try:
        with transaction.atomic():
            article = get_object_or_404(Article, id=id)
            user = get_object_or_404(BlogUser, pk=request.user.pk)
            collection, created = Collection.objects.get_or_create(
                article=article,
                collector=user
            )

            if created:
                Article.objects.filter(id=id).update(
                    collect=models.F('collect') + 1
                )
                article.refresh_from_db()
                is_collected = True
            else:
                collection.delete()
                Article.objects.filter(id=id).update(
                    collect=models.F('collect') - 1
                )
                article.refresh_from_db()
                is_collected = False

            return JsonResponse({
                'status': 'success',
                'is_collected': is_collected,
                'collect': article.collect,
                'message': '操作成功'
            })

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
