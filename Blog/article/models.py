from os import listdir
from tkinter import image_names
from django.db import models
from user.models import BlogUser
from django.utils import timezone
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill
from PIL import Image
from io import BytesIO
import os
import random
from django.conf import settings

class Article(models.Model):
    author       = models.ForeignKey(BlogUser, on_delete=models.CASCADE, verbose_name="文章作者")
    title        = models.CharField("标题", max_length=100)
    head_img     = ProcessedImageField(verbose_name="文章头图", upload_to='articles/%Y/%m/%d', default='articles/default.png', processors=[ResizeToFill(384, 216)])
    body         = models.TextField(verbose_name="文章正文")
    created_time = models.DateTimeField("发布时间", default=timezone.now)
    updated_time = models.DateTimeField("更新时间", auto_now=True)
    category     = models.CharField("文章类型", max_length=20)
    likes        = models.IntegerField(default=0)
    collect      = models.IntegerField(default=0)
    dislikes     = models.IntegerField(default=0)
    looks        = models.IntegerField(default=0)

    class Meta:
        ordering = ('-created_time',)

    def __str__(self):
        return self.title