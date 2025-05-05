from django import forms
from .models import BlogUser
from captcha.fields import CaptchaField
from django.contrib.auth.forms import UserCreationForm

class UserLoginForm(forms.Form):
    account = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

class CaptchaForm(forms.Form):
    captcha = CaptchaField(error_messages={"invalid":"验证码错误"})

class UserRegForm(UserCreationForm):
    email = forms.EmailField(required=True, label='邮箱')

    class Meta:
        model = BlogUser
        fields = ('username', 'email', 'password1', 'password2', 'avatar')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if BlogUser.objects.filter(email=email).exists():
            raise forms.ValidationError("该邮箱已被注册")
        return email


class ProfileForm(forms.ModelForm):
    class Meta:
        model = BlogUser
        fields = ('avatar', 'nickname', 'intro', 'birthday', 'sex', 'backimg')


