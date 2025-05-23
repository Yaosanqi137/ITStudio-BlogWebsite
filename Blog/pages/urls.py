from django.urls import path
from . import views
from .views import search_view

app_name = 'pages'

urlpatterns = [
    path('', views.homepage_view, name='homepage'),
    path('messages/<int:message_id>/mark_read/', views.mark_message_read),
    path('search/', search_view, name='search'),
]
