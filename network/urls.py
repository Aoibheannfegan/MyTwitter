
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("posts", views.posts, name="posts"),
    path("following", views.following, name="following"),
    path("<str:username>", views.profile, name="profile"),
    path("follow_toggle/<int:user_id>/", views.follow_toggle, name="follow_toggle"),
    path("like_button/<int:post_id>/", views.like_button, name="like_button"),
    path("edit/<int:post_id>/", views.edit_button, name="edit_button")
]
