import markdown
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.shortcuts import render
from .forms import ArticlePostForm
from .models import Article
from user.models import BlogUser

def list_view(request):
    articles = Article.objects.all()
    return render(request, 'ArticleList.html', {'articles': articles})

def detail_view(request, id):
    article = Article.objects.get(id=id)
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
            new_article.save()
            id = new_article.id
            return redirect(f'/article/detail/{id}')
    else:
        article_post_form = ArticlePostForm()
        context = {'article_post_form': article_post_form}
        return render(request, 'ArticlePost.html', context)

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