import markdown
import json
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect,get_object_or_404
from django.shortcuts import render
from .forms import ArticlePostForm
from .models import Article, Collection
from user.models import BlogUser,Follow
from django.db.models import Q
from comment.models import Comment
from django.contrib.auth.models import User
from comment.forms import CommentForm
from django.views.decorators.http import require_POST
from django.db import transaction
from django.db import models

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
    return redirect('/article/list')

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
def likes_view(request, id):
    try:
        if request.session.get(f'liked_{id}', False):
            return HttpResponse(
                json.dumps({'status': 'fail', 'msg': '已点赞过'}),
                content_type='application/json',
                status=400
            )

        article = Article.objects.get(id=id)
        article.likes += 1
        article.save()
        request.session[f'liked_{id}'] = True
        return HttpResponse(
            json.dumps({'status': 'success', 'likes': article.likes}, ensure_ascii=False),
            content_type='application/json'
        )
    except Exception as e:
        return HttpResponse(
            json.dumps({'status': 'error', 'msg': str(e)}),
            content_type='application/json',
            status=500
        )

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

@login_required(login_url='/user/login/')
def collect_status_view(request, id):
    article = get_object_or_404(Article, id=id)
    is_collected = Collection.objects.filter(
        article=article,
        collector=request.user
    ).exists()
    return JsonResponse({
        'is_collected': is_collected,
        'collect': article.collect
    })