from rest_framework import serializers
from .models import Hashtag, Community, Publication, Comment, Subscription, User
from django.contrib.auth import authenticate


#BLOCK OF USER SERIALIZERS
#=========================================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('__all__')
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
        fields = '__all__'


class CommunitySerializer(serializers.ModelSerializer):
    creator = serializers.ReadOnlyField(source='creator.username')

    class Meta:
        model = Community
        fields = '__all__'


class PublicationSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_id = serializers.ReadOnlyField(source='author.id')  
    hashtags = HashtagSerializer(many=True, required=False)
    community = serializers.PrimaryKeyRelatedField(queryset=Community.objects.all())
    community_name = serializers.ReadOnlyField(source='community.name')
    content = serializers.JSONField() 

    class Meta:
        model = Publication
        fields = '__all__'
    

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    publication = serializers.PrimaryKeyRelatedField(queryset=Publication.objects.all())
    #used to establish relation between a comment and it's parrent
    parent_comment = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), required=False, allow_null=True)
    #Used to serialize nested replies
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []


class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Subscription
        fields = '__all__'

    def create(self, validated_data):
        content_type = validated_data.pop('content_type')
        object_id = validated_data.pop('object_id')
        content_object = content_type.get_object_for_this_type(id=object_id)
        subscription = Subscription.objects.create(content_object=content_object, **validated_data)
        return subscription
