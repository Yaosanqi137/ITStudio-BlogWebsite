import markdown
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.shortcuts import render
from .forms import ArticlePostForm
from .models import Article
from user.models import BlogUser
from django.db.models import Q
from article.models import get_random_image

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

    return render(request, 'ArticleList.html', {
        'articles': articles,
        'category': category,
    })

def detail_view(request, id):
    article = Article.objects.get(id=id)
    article.looks += 1
    article.save()
    article.body = markdown.markdown(article.body, extensions=[
        'markdown.extensions.extra',
        'markdown.extensions.codehilite'
        ])
    return render(request, 'Article.html', {'article': article})

@login_required(login_url='/user/login/')
def create_view(request):
    if request.method == 'POST':
        article_post_form = ArticlePostForm(request.POST, request.FILES)
        if article_post_form.is_valid():
            new_article = article_post_form.save(commit=False)
            new_article.author = BlogUser.objects.get(username=request.user.username)
            if not new_article.head_img:
                new_article.head_img = get_random_image()
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

    return render(request, 'MyArticle.html', {
        'articles': articles,
        'category': category,
    })