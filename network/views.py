from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.core.paginator import Paginator
import json

from .models import User, Post


def index(request):
    posts = Post.objects.all().order_by('-created_at')
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        "page_obj": page_obj
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def post(request):
    if request.method == "POST":
        user = request.user

        # if user does not exist go to login page
        if not user.is_authenticated:
            return redirect('login')
        
        # save post to Post model
        post = request.POST["post"]
        add_post=Post(user=request.user, content=post)
        add_post.save()
    
        # go to posts page once post created
        return redirect('posts')
    else:
        return render(request, "network/post.html")
    

def posts(request):
    current_user=request.user

    # get posts and paginate
    posts = Post.objects.all().order_by('-created_at')
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/posts.html", {
        "page_obj": page_obj,
        "current_user": current_user
    })

def profile(request, username):
    current_user=request.user
    #check that profile is for an existing user
    try:
        profile_owner = User.objects.get(username=username)
    except User.DoesNotExist:
        return render(request, "network/profile.html", {
                "message": "Username does not exist"
            })
    user_posts = Post.objects.filter(user=profile_owner).order_by('-created_at')
    paginator = Paginator(user_posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/profile.html", {
        "user_posts": user_posts,
        "profile_owner": profile_owner,
        "page_obj": page_obj,
        "current_user": current_user
    })

def follow_toggle(request, user_id):
    if request.method == 'POST':
        current_user = request.user
        profile_owner = User.objects.get(pk=user_id)

        if not current_user.is_authenticated:
            return JsonResponse({"success": False, "error": "User not authenticated"})
        
        data = json.loads(request.body)
        action = data.get('action')

        #take appropriate follow or unfollow action
        if action == "follow":
            current_user.following.add(profile_owner)
            current_user.save()
        elif action =="unfollow":
            current_user.following.remove(profile_owner)
            current_user.save()
        else:
            return JsonResponse({"success": False, "error": "Invalid action"})
        
        return JsonResponse({"success": True, "new_follower_count": profile_owner.followers.count()})

def following(request):
    current_user=request.user

    if not current_user.is_authenticated:
        return redirect('login')
    
    following_users = current_user.following.all()
    print(following_users)
    posts = Post.objects.filter(user__in=following_users).order_by('-created_at')
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/following.html", {
        "posts": posts,
        "page_obj": page_obj,
        "current_user": current_user
    })

def like_button(request, post_id):
    if request.method == 'POST':
        current_user = request.user
        post = Post.objects.get(pk=post_id)

        if not current_user.is_authenticated:
            return JsonResponse({"success": False, "error": "User not authenticated"})
        
        data = json.loads(request.body)
        action = data.get('action')

        #take appropriate like or unlike
        if action == "like":
            current_user.liked_posts.add(post)
            current_user.save()
        elif action =="unlike":
            current_user.liked_posts.remove(post)
            current_user.save()
        else:
            return JsonResponse({"success": False, "error": "Invalid action"})
        
        return JsonResponse({"success": True, "Likes": post.users_who_liked.count()})
    

def edit_button (request, post_id):
    if request.method == 'POST':
        current_user = request.user
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"success": False, "error": "Post not found"})

        if not current_user.is_authenticated:
            return JsonResponse({"success": False, "error": "User not authenticated"})
        
        if not current_user.id == post.user.id:
            return JsonResponse({"success": False, "error": "Not post owner"})
        
        data = json.loads(request.body)
        content = data.get('content')

        post.content = content
        post.save()
        return JsonResponse({"success": True, "Content": post.content})
    
    else:
        return JsonResponse({"success": False, "error": "Invalid request method"})
        
            