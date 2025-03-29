from django.shortcuts import render
from .models import Article


def list_view(request):
    articles = Article.objects.all()
    return render(request, 'ArticleList.html', {'articles': articles})

def detail_view(request, id):
    article = Article.objects.get(id=id)
    return render(request, 'Article.html', {'article': article})
