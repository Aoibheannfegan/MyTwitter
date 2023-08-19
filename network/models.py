from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name="followers")
    liked_posts = models.ManyToManyField('Post', blank=True, related_name="users_who_liked")
    
    def __str__(self):
        return self.username

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.content[:50]