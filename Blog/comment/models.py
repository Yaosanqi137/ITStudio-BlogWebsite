from django.db import models
from user.models import BlogUser
from article.models import Article
from django.urls import reverse
from ckeditor.fields import RichTextField

class Comment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(BlogUser, on_delete=models.CASCADE, related_name='comments')
    body = RichTextField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return self.body[:20]