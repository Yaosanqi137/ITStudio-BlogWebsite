from django.urls import path, include
from . import views

app_name = 'user'

urlpatterns = [
    path('ajax_val/', views.ajax_validate_captcha, name='ajax_val'),
    path('refresh_captcha/', views.refresh_captcha, name='refresh_captcha'),
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/<str:username>/', views.profile_prew_view, name='profile_prew'),
    path('follow/<int:user_id>/',views.follow_user,name='follow_user'),
    path('unfollow/<int:user_id>/',views.unfollow_user,name='unfollow_user'),
]