from django import forms
from .models import *
from captcha.fields import CaptchaField
from django.contrib.auth.forms import UserCreationForm

class UserLoginForm(forms.Form):
    account = forms.CharField(label="账号", error_messages={"required": "账号不能为空"})
    password = forms.CharField(widget=forms.PasswordInput, label="密码", error_messages={"required": "密码不能为空"})

class CaptchaForm(forms.Form):
    captcha = CaptchaField(error_messages={"invalid": "验证码错误", "required": "请输入验证码"})

class UserRegForm(UserCreationForm):
    email = forms.EmailField(required=True, label='邮箱', error_messages={"required": "邮箱不能为空", "invalid": "请输入有效的邮箱地址"})

    class Meta:
        model = BlogUser
        fields = ('username', 'email', 'password1', 'password2')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if BlogUser.objects.filter(email=email).exists():
            raise forms.ValidationError("该邮箱已被注册")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            self.add_error('password2', "两次密码输入不一致")

        return cleaned_data


class AvatarUploadForm(forms.ModelForm):
    avatar = forms.ImageField(
        label='上传头像',
        required=False,
        widget=forms.FileInput(attrs={'accept': 'image/*'}),
        error_messages={"invalid": "请上传正确的图片格式"}
    )

    class Meta:
        model = BlogUser
        fields = ('avatar',)
