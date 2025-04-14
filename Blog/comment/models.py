from django.db import models
from user.models import BlogUser
from article.models import Article
from django.urls import reverse
from ckeditor.fields import RichTextField
from mptt.models import MPTTModel, TreeForeignKey

class Comment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(BlogUser, on_delete=models.CASCADE, related_name='comments')
    body = RichTextField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return self.body[:20]

class Chat(MPTTModel):
    user = models.ForeignKey(BlogUser, on_delete=models.CASCADE, related_name='chats')
    body = RichTextField()
    created = models.DateTimeField(auto_now_add=True)
    parent = TreeForeignKey('self', on_delete=models.CASCADE, related_name='children', null=True, blank=True) # mptt 树状外键 指向父评论
    reply_to = models.ForeignKey(BlogUser, on_delete=models.CASCADE, related_name='replier', null=True, blank=True) # 指向被回复的人

    class MPTTMeta:
        ordering = ['created']