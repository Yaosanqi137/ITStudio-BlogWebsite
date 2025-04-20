from django.db import models
from django.contrib.auth.models import User
import time
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill
from PIL import Image
from io import BytesIO
import os
import random
from django.conf import settings

MEDIA_ADDR = "https://localhost:8000/images/"

sex = {
    "男": "男",
    "女": "女",
    "保密": "保密"
}

class BlogUser(User, models.Model):
    nickname = models.CharField("昵称", max_length=50, default=f"OUCer_{int(time.time())}", unique=True)
    avatar   = ProcessedImageField(verbose_name="头像", upload_to='avatars/%Y/%m/%d', default='avatars/default.png', processors=[ResizeToFill(160, 160)])
    info     = models.TextField("简介", blank=True, null=True)
    birthday = models.DateField("生日", null=True, blank=True)
    reg_time = models.DateField("注册时间", auto_now_add=True, editable=False)
    sex      = models.CharField("性别", default="保密", choices=sex, max_length=8)

    def get_avatar(self):
        return MEDIA_ADDR + str(self.avatar)


class Follow(models.Model):
    follower=models.ForeignKey(User,related_name='following',on_delete=models.CASCADE)
    followed=models.ForeignKey(User,related_name='followers',on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together=('follower','followed')

    def __str__(self):
        return f"{self.follower.username}follows{self.followed.username}"