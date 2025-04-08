from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from article.models import Article
from .forms import CommentForm
from user.models import BlogUser


@login_required(login_url='/user/login/')
def article_post_view(request, article_id):
    article = get_object_or_404(Article, id=article_id)

    if request.method == 'POST':
        comment_form = CommentForm(data=request.POST)
        if comment_form.is_valid():
            new_comment = comment_form.save(commit=False)
            new_comment.article = article
            new_comment.user = BlogUser.objects.get(id=request.user.id)
            new_comment.save()
            return redirect(f"/article/detail/{article.id}")