from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from user.models import BlogUser

def homepage_view(request):
    if request.user.is_authenticated:
        user = get_object_or_404(BlogUser, username=request.user.username)
        context = {
            'user': user,
        }
        return render(request, "Hub.html", context)
    else:
        return render(request, "Hub.html")