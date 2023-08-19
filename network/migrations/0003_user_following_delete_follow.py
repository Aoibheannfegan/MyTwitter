# Generated by Django 4.2.3 on 2023-08-12 18:56

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_post_like_follow'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='following',
            field=models.ManyToManyField(related_name='followers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.DeleteModel(
            name='Follow',
        ),
    ]
