from django.db import models
from django.contrib.auth.models import User
import time
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill
from PIL import Image
from io import BytesIO
import os

MEDIA_ADDR = "https://localhost:8000/images/"

sex = {
    "male": "男",
    "female": "女",
    "unknown": "保密"
}

class BlogUser(User, models.Model):
    nickname = models.CharField("昵称", max_length=50, default=f"OUCer_{int(time.time())}", unique=True)
    avatar   = ProcessedImageField(verbose_name="头像", upload_to='avatars/%Y/%m/%d', default='avatars/default.png', processors=[ResizeToFill(160, 160)])
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True)
    info     = models.TextField("简介", blank=True, null=True)
    birthday = models.DateField("生日", null=True, blank=True)
    reg_time = models.DateField("注册时间", auto_now_add=True, editable=False)
    sex      = models.CharField("性别", default="unknown", choices=sex, max_length=8)

    def get_avatar(self):
        return MEDIA_ADDR + str(self.avatar)


    #重定义save方法来实现自动剪裁图片
    def save(self, *args, **kwargs):
        if self.avatar and not self.thumbnail:
            img = Image.open(self.avatar)

            #裁剪
            width, height = img.size
            left = (width - 160) / 2
            upper = (height - 160) / 2
            right = (width + 160) / 2
            lower = (height + 160) / 2

            # 裁剪并转换为RGB模式
            cropped_img = img.crop((left, upper, right, lower)).convert('RGB')

            # 保存
            buffer = BytesIO()
            cropped_img.save(buffer, format='JPEG')

            # 赋值给thumbnail字段
            self.thumbnail.save(
                os.path.basename(self.avatar.name),
                content=buffer,
                save=False  # 保存到数据库
            )

        super().save(*args, **kwargs)