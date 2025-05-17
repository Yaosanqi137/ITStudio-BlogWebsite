from os import listdir
from tkinter import image_names
from django.db import models
from django.utils import timezone
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill
from PIL import Image
from io import BytesIO
import os
import random
from django.conf import settings

class Article(models.Model):
    author       = models.ForeignKey('user.BlogUser', on_delete=models.CASCADE, verbose_name="文章作者")
    title        = models.CharField("标题", max_length=100)
    head_img     = ProcessedImageField(verbose_name="文章头图", upload_to='articles/%Y/%m/%d', default='articles/default.png', processors=[ResizeToFill(384, 216)])
    body         = models.TextField(verbose_name="文章正文")
    created_time = models.DateTimeField("发布时间", default=timezone.now)
    updated_time = models.DateTimeField("更新时间", auto_now=True)
    category     = models.CharField("文章类型", max_length=20)
    likes        = models.PositiveIntegerField(default=0)
    collect      = models.PositiveIntegerField(default=0)
    looks        = models.PositiveIntegerField(default=0)
    collectors = models.ManyToManyField('user.BlogUser', through='Collection', related_name='collected_articles')

    class Meta:
        ordering = ('-created_time',)

    def __str__(self):
        return self.title

class Collection(models.Model):
    collector = models.ForeignKey('user.BlogUser', on_delete=models.CASCADE)
    article   = models.ForeignKey(Article, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('collector', 'article')  # 确保唯一性

class Like(models.Model):
    user = models.ForeignKey(BlogUser, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')  # 确保一人一篇文章只能点赞一次

    def __str__(self):
        return f"{self.user.username}like{self.article.title}"