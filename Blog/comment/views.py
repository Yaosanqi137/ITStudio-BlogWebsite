from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from article.models import Article
from .forms import CommentForm, ChatForm
from user.models import BlogUser

from .models import Chat


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

@login_required(login_url='/user/login/')
def cafe_view(request):
    if request.method == 'POST':
        chat_form = ChatForm(request.POST)
        if chat_form.is_valid():
            chat = chat_form.save(commit=False)
            chat.user = BlogUser.objects.get(id=request.user.id)
            parent_chat_id = request.POST.get('parent_chat_id')

            if parent_chat_id:
                parent_chat = Chat.objects.get(id=parent_chat_id)
                # 若回复层级超过二级，则转换为二级
                chat.parent_id = parent_chat.get_root().id
                # 被回复人
                chat.reply_to = parent_chat.user
                chat.save()
                return redirect("/comment/cafe")

            chat.save()
            return redirect("/comment/cafe")
    else:
        chat_form = ChatForm()
        chats = Chat.objects.all()
        context = {'chat_form': chat_form,
                   'chats': chats,
                   }
        return render(request, 'Cafe.html', context)
