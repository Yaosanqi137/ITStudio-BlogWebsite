from django.urls import path
from . import views

app_name = 'article'

urlpatterns = [
    path('list', views.list_view, name='list'),
    path('detail/<int:id>', views.detail_view, name='detail'),
]