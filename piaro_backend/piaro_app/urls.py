from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HashtagViewSet, CommunityViewSet, PublicationViewSet, CommentViewSet, SubscriptionViewSet, UserRegistrationViewSet, LoginViewSet, UserViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = DefaultRouter()
router.register(r'hashtags', HashtagViewSet)
router.register(r'communities', CommunityViewSet)
router.register(r'publications', PublicationViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'register', UserRegistrationViewSet, basename='user-registration')
router.register(r'login', LoginViewSet, basename='user-login')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('utils/', include('utils.urls')),
]