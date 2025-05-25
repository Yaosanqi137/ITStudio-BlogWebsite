from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render, get_object_or_404, redirect
from article.models import Article
from .forms import CommentForm, ChatForm
from user.models import BlogUser
from .models import Chat, Comment
from pages.models import UserMessage

def send_message(user, content, url):
    message = UserMessage.objects.create(user=user)
    message.content = content
    message.redirect_url = url
    message.save()

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

            # 发信给文章作者
            host = request.build_absolute_uri('/')[:-1]
            url = f"{host}/article/detail/{article.id}#comment-{new_comment.id}"
            send_message(article.author, "有人给你的文章评论啦！", url)

            return redirect(f"/article/detail/{article.id}#comment-{new_comment.id}")

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

                # 发信给被回复人
                host = request.build_absolute_uri('/')[:-1]
                url = f"{host}/comment/cafe#chat-{chat.id}"
                send_message(chat.reply_to, "你在咖啡馆收到了一条新的回复！", url)

                return redirect(f"/comment/cafe#chat-{chat.id}")

            chat.save()
            return redirect(f"/comment/cafe#chat-{chat.id}")
    else:
        chat_form = ChatForm()
        chats = Chat.objects.all()
        context = {'chat_form': chat_form,
                   'chats': chats,
                   }
        return render(request, 'Cafe.html', context)


def search_view(request):
    search_query = request.GET.get('search', '')
    comments = Comment.objects.all()

    if search_query:
        comments = comments.filter(
            Q(body__icontains=search_query) | Q(user__username__icontains=search_query)
        )

    paginator = Paginator(comments, 10)
    page = request.GET.get('page')
    comments = paginator.get_page(page)

    return render(request, 'ArticleList.html', {  # 可根据你前端页面实际情况替换模板名
        'comments': comments,
    })