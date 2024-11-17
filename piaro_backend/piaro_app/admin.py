from django.contrib import admin
from .models import Hashtag, Community, Publication, Comment, Subscription, User

admin.site.register(User)
admin.site.register(Hashtag)
admin.site.register(Community)
admin.site.register(Publication)
admin.site.register(Comment)
admin.site.register(Subscription)

# Register your models here.
