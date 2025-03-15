from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager, PermissionsMixin
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db.models import JSONField
from django.utils.deconstruct import deconstructible
from slugify import slugify 
import os


# BLOCK OF USER MODELS
#===========================================================================
@deconstructible
class UploadToUserDirectory:
    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f'{instance.id}.{ext}'
        return os.path.join('ProfilePhoto', filename)
    
    
class CustomUserManager(UserManager):
    def _create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('You have not provided a username')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(self, username=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(username, password, **extra_fields)

    def create_superuser(self, username=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(username, password, **extra_fields)


class User(AbstractUser, PermissionsMixin):
    email = models.EmailField(unique=True, blank=True, null=True, verbose_name="Email")
    contact_number = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="Contact Number")
    tg_contact = models.CharField(max_length=50, unique=True, blank=True, null=True, verbose_name="Telegram Contact")
    profile_photo = models.ImageField(upload_to=UploadToUserDirectory(), blank=True, null=True, verbose_name="Profile Photo")
    community_status = models.JSONField(default=list, blank=True, null=True, verbose_name="Community Status")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        
# END OF BLOCK
#===========================================================================


@deconstructible
class UploadToCommunityDirectory:
    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f'{instance.id}.{ext}'
        return os.path.join('community', str(instance.id), filename)
    
    
class UploadPath:
    def upload_to_publication(instance, filename):
        return f'publication_images/{instance.publication.id}/{filename}'


class Hashtag(models.Model):
    name = models.CharField(max_length=15, unique=True)

    class Meta:
        verbose_name = 'Hashtag'
        verbose_name_plural = 'Hashtags'


class Community(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    name = models.CharField(max_length=50, unique=True)
    photo = models.ImageField(upload_to=UploadToCommunityDirectory(), null=True, blank=True)
    description = models.TextField()
    slug = models.SlugField(max_length=50, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            # Ensure the slug is unique
            original_slug = self.slug
            counter = 1
            while Community.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Community'
        verbose_name_plural = 'Communities'


class Publication(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    date_posted = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    hashtags = models.ManyToManyField(Hashtag, blank=True)
    date_written = models.DateField(null=True, blank=True)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='publications', null=False)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    likes = GenericRelation('Like', related_query_name='publication')
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure the slug is unique
            original_slug = self.slug
            counter = 1
            while Publication.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
    class Meta:
        ordering = ['-date_posted']
        verbose_name = 'Publication'
        verbose_name_plural = 'Publications'
        

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name='comments')
    parent_comment = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    text = models.TextField()
    date_posted = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)  

    def __str__(self):
        return f"Comment by {self.author.username} on {self.publication.title}"


class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    #stores data about and object user subscribed on. If user subscribed on community {'content_type':'community'}, if on user {'content_type':'user'}
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    send_notifications = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')

        
class Like(models.Model):
    LIKE = 1
    DISLIKE = -1
    VOTES = [
        (LIKE, 'Like'),
        (DISLIKE, 'Dislike'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    is_like = models.IntegerField(choices=VOTES)
    date_modified = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'content_type', 'object_id')


class Collection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collections', null=False)
    name = models.CharField(max_length=200)
    publications = models.ManyToManyField(Publication, related_name='collections', blank=True)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-name']
