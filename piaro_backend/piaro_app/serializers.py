from rest_framework import serializers
from .models import Hashtag, Community, Publication, Comment, Subscription, User, Like, Collection
from django.contrib.auth import authenticate


#BLOCK OF USER SERIALIZERS
#=========================================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'contact_number', 'tg_contact', 'profile_photo')
        ref_name = 'Custom User'


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Hide password in responses

    class Meta:
        model = User
        fields = ('id', 'username', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(username=validated_data['username'])
        
        # Set the password for the user
        if password:
            user.set_password(password)
            user.save()

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not (username and password):
            raise serializers.ValidationError('Must include "username" and "password".')
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise serializers.ValidationError('Unable to log in with provided credentials.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        data['user'] = user
        return data
    
# END OF BLOCK OF USER SERIALIZERS
#=========================================================================

class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = ('id', 'name')


class CommunitySerializer(serializers.ModelSerializer):
    creator = serializers.ReadOnlyField(source='creator.username')

    class Meta:
        model = Community
        fields = ('id', 'creator', 'name', 'photo', 'description')


class PublicationSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_id = serializers.ReadOnlyField(source='author.id')  
    hashtags = HashtagSerializer(many=True, required=False)
    community = serializers.PrimaryKeyRelatedField(queryset=Community.objects.all())
    community_name = serializers.ReadOnlyField(source='community.name')
    content = serializers.JSONField() 

    class Meta:
        model = Publication
        fields = ('id', 'title', 'author', 'author_id', 'date_posted', 'content', 'hashtags', 'community', 'community_name', 'date_written')
    

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    publication = serializers.PrimaryKeyRelatedField(queryset=Publication.objects.all())
    #used to establish relation between a comment and it's parrent
    parent_comment = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), required=False, allow_null=True)
    #Used to serialize nested replies
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'text', 'author', 'publication', 'parent_comment', 'date_posted', 'replies')

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []


class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Subscription
        fields = ('id', 'user', 'content_type', 'object_id', 'send_notifications')

    def create(self, validated_data):
        content_type = validated_data.pop('content_type')
        object_id = validated_data.pop('object_id')
        content_object = content_type.get_object_for_this_type(id=object_id)
        subscription = Subscription.objects.create(content_object=content_object, **validated_data)
        return subscription
    
    
class LikeSerializer(serializers.ModelSerializer): 
    
    class Meta: 
        model = Like 
        fields = ('id', 'user', 'content_type', 'object_id', 'is_like', 'date_modified')
        
        
class CollectionSerializer(serializers.ModelSerializer): 
    user = serializers.ReadOnlyField(source='user.username')
    publications = PublicationSerializer(many=True, read_only=True)
    class Meta: 
        model = Collection 
        fields = ('id', 'user', 'name', 'publications', 'is_public')
