from django.db import models
from user.models import BlogUser
from django.utils import timezone

class Article(models.Model):
    author       = models.ForeignKey(BlogUser, on_delete=models.CASCADE, verbose_name="文章作者")
    title        = models.CharField("标题", max_length=100)
    body         = models.TextField(verbose_name="文章正文")
    created_time = models.DateTimeField("发布时间", default=timezone.now)
    updated_time = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        ordering = ('-created_time',)

    def __str__(self):
        return self.title