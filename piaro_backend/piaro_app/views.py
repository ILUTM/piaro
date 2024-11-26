#allow me to create complex queries to ORM
from django.db.models import Q
import requests
from django.contrib.auth import authenticate, login
from django.contrib.auth.hashers import make_password, check_password
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.core.cache import cache
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from .utils import HandleImagesInContent
from .models import Hashtag, Community, Publication, Comment, Subscription, User
from .serializers import HashtagSerializer, CommunitySerializer, PublicationSerializer, CommentSerializer, SubscriptionSerializer, UserRegistrationSerializer, UserSerializer, LoginSerializer


# BLOCK OF USER VIEWSETS
#=====================================================================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        userData = request.data

        if 'password' in userData:
            userData['password'] = make_password(userData['password'])

        return super(UserViewSet, self).update(request, *args, **kwargs)

    @action(detail=False, methods=['get','put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_field(self, request):
        user = request.user
        field = request.data.get('field')
        value = request.data.get('value')
        
        if field in ['email', 'contact_number'] and value:
            setattr(user, field, value)
            user.save()
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        return Response({"detail": "field not provided."}, status=400)
    
    @action(detail=False, methods=['post'])
    def store_verification_code(self, request):
        username = request.data.get('user')
        confirmation_code = request.data.get('confirmation_code')
        chat_id = request.data.get('chat_id')
        if username and confirmation_code and chat_id:
            cache.set(username, username, timeout=120)
            cache.set(f"{username}_confirmation_code", confirmation_code, timeout=120)
            cache.set(f"{username}_chat_id", chat_id, timeout=120)
            return Response({"status": "success", "detail": "Verification code stored successfully"})
        return Response({"status": "failed", "detail": "Missing 'user' or 'confirmation_code'"}, status=400)
        
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def verify_tg(self,request):
        user = request.user
        code = request.data.get('code')
        cached_code = cache.get(f"{user.username}_confirmation_code")
        cached_chat_id = cache.get(f"{user.username}_chat_id")
        if cached_code and cached_code ==code:
            user.tg_contact = cached_chat_id
            user.save()
            cache.delete(user.username)
            return Response({"status": "success", "detail": "Telegram contact verified"})
        return Response({"status": "failed", "detail": "Invalid or expired code"}, status=400)
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_profile_photo(self, request):
        user = request.user
        if 'profile_photo' in request.FILES:
            # Delete the old profile photo
            if user.profile_photo:
                default_storage.delete(user.profile_photo.path)

            user.profile_photo = request.FILES['profile_photo']
            user.save()
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        return Response({"detail": "Profile photo not provided."}, status=400)
            
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_new_password = request.data.get('confirm_new_password')
        if not old_password or not new_password or not confirm_new_password:
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(old_password, user.password):
            return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_new_password:
            return Response({'error': 'New passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.password = make_password(new_password)
        user.save()
        return Response({'status': 'Password changed successfully'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def get_user(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    
class UserRegistrationViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        user = User.objects.get(username=serializer.data['username'])
        refresh = RefreshToken.for_user(user)
        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED, headers=headers)


class VerifyRefreshToken(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = {
            'email': user.email,
            'username': user.username,
            'id': user.id,
            'contact_number': user.contact_number,
            'tg_contact': user.tg_contact,
            'profile_photo': user.profile_photo.url if user.profile_photo else None,
            'community_status': user.community_status,
        }
        return Response(data, status=status.HTTP_200_OK)


class LoginViewSet(viewsets.ViewSet):
    def create(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        refresh = RefreshToken.for_user(user)
        response = Response({
            'access': str(refresh.access_token),
            'email': user.email,
            'username': user.username,
            'id': user.id,
            'contact_number': user.contact_number,
            'tg_contact': user.tg_contact,
            'profile_photo': user.profile_photo.url if user.profile_photo else None,
            'community_status': user.community_status,
        }, status=status.HTTP_200_OK)
        response.set_cookie(
            'refresh_token', 
            str(refresh), 
            httponly=True, 
            secure=True, 
            samesite='None', 
            max_age=1209600,
            domain='127.0.0.1'
            )
        return response
# END OF BLOCK OF USER VIEWSETS
#=====================================================================

class HashtagViewSet(viewsets.ModelViewSet):
    queryset = Hashtag.objects.all()
    serializer_class = HashtagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_communities(self, request):
        communities = Community.objects.filter(creator=request.user)
        serializer = self.get_serializer(communities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_community(self, request):
        serializer = CommunitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'])
    def search_by_name(self, request):
        query = request.query_params.get('query', None)
        if query:
            communities = Community.objects.filter(name__icontains=query)
            serializer = self.get_serializer(communities, many=True)
            return Response(serializer.data)
        return Response({"detail": "No query provided."}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        community = get_object_or_404(Community, pk=pk)
        serializer = self.get_serializer(community)
        return Response(serializer.data)
    

class PublicationPaginator(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 200 


class PublicationViewSet(viewsets.ModelViewSet):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = PublicationPaginator

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        
    def notify_subscribers(self, publication):
        community = publication.community
        content_type = ContentType.objects.get_for_model(community)
        subscriptions = Subscription.objects.filter(
            content_type=content_type,
            object_id=community.id,
            send_notifications=True
        )
        chat_ids = [subscription.user.tg_contact for subscription in subscriptions if subscription.user.tg_contact]
        message = f"new publication in {community} already available on http://localhost:3000/Publication/{publication.id}"
        payload = { "chat_ids": chat_ids, "message": message }
        
        try: 
            response = requests.post('http://localhost:8002/send_notifications', json=payload) 
            response.raise_for_status() 
        except requests.exceptions.RequestException as e: 
            print(f"Failed to send notifications: {str(e)}")
        

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_publications(self, request):
        publications = Publication.objects.filter(author=request.user)
        page = self.paginate_queryset(publications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def post_publication(self, request):
        data = request.data
        #handle images in publication
        handler = HandleImagesInContent(data, request)
        updated_content = handler.run()
        data['content'] = updated_content
        hashtags_data = data.pop('hashtags', [])  # Extract hashtags from data
        # Create or get existing hashtags
        hashtags = []
        for tag in hashtags_data:
            tag = tag.lower()
            hashtag, created = Hashtag.objects.get_or_create(name=tag)
            hashtags.append(hashtag)

        # Get existing community
       
        serializer = PublicationSerializer(data=data)
        if serializer.is_valid():
            publication = serializer.save(author=request.user, date_written=now().date())
            publication.hashtags.set(hashtags)  
            publication.save()
            self.notify_subscribers(publication)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def get_publication(self, request, pk=None):
        publication = get_object_or_404(Publication, pk=pk)
        serializer = self.get_serializer(publication)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        title = request.query_params.get('title', None)
        hashtags = request.query_params.get('hashtags', None)
        print(f"Title: {title}")
        print(f"Hashtags: {hashtags}")

        filters = Q()
        if title:
            filters &= Q(title__icontains=title)
        if hashtags and hashtags != 'undefined':
            hashtag_list = hashtags.split(',')
            filters &= Q(hashtags__name__in=hashtag_list)

        if filters:
            publications = Publication.objects.filter(filters).distinct()
            page = self.paginate_queryset(publications)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(publications, many=True)
            return Response(serializer.data)

        return Response({"detail": "No query or hashtags provided."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='by-community/(?P<pk>[^/.]+)')
    def publications_by_community(self, request, pk=None):
        community = get_object_or_404(Community, pk=pk)
        publications = Publication.objects.filter(community=community)
        page = self.paginate_queryset(publications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all_publications(self, request):
        publications = Publication.objects.all()
        page = self.paginate_queryset(publications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(publications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-user/(?P<pk>[^/.]+)')
    def publications_by_user(self, request, pk=None):
        publications = Publication.objects.filter(author=pk)
        page = self.paginate_queryset(publications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_comments(self, request):
        comments = Comment.objects.filter(author=request.user)
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)  

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_comment(self, request, pk=None):
        publication = get_object_or_404(Publication, pk=pk)
        data = request.data
        data['publication'] = publication.id
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            publication = serializer.save(author=request.user, date_posted=now().date())
            publication.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_reply(self, request, pk=None):
        parent_comment = get_object_or_404(Comment, pk=pk)
        data = request.data
        data['parent_comment'] = parent_comment.id
        data['publication'] = parent_comment.publication.id
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def get_comments_by_publication(self, request, pk=None):
        publication = get_object_or_404(Publication, pk=pk)
        #parent_comment__isnull=True make func to fetch only top-level comment
        #.prefetch_related('replies') caches all replies. reduces the number of queries
        comments = Comment.objects.filter(publication=publication, parent_comment__isnull=True).prefetch_related('replies')
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
   
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_subscriptions(self, request):
        subscriptions = Subscription.objects.filter(user=request.user)
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['POST'], permission_classes=[IsAuthenticated])
    def subscribe(self, request):
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def unsubscribe(self, request):
        content_type_id = request.data.get('content_type')
        content_type = ContentType.objects.get(id=content_type_id)
        object_id = request.data.get('object_id')
        
        subscription = Subscription.objects.get(user=request.user, content_type=content_type, object_id=object_id)
        subscription.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
               
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def check_subscription(self, request):
        content_type_id = request.query_params.get('content_type')
        content_type = ContentType.objects.get(id=content_type_id)
        object_id = request.query_params.get('object_id')
        subscription_exists = Subscription.objects.filter(user=request.user, content_type=content_type, object_id=object_id).exists() 
        return Response({'subscribed': subscription_exists}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated]) 
    def toggle_notifications(self, request):
        content_type_id = request.data.get('content_type')
        content_type = ContentType.objects.get(id=content_type_id)
        object_id = request.data.get('object_id')
        subscription = Subscription.objects.get(user=request.user, content_type=content_type, object_id=object_id) 
        subscription.send_notifications = not subscription.send_notifications 
        subscription.save()
        return Response({'send_notifications': subscription.send_notifications}, status=status.HTTP_200_OK)
    