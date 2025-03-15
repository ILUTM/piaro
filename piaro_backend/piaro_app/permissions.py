from rest_framework import permissions


class IsAdminOrCommunityCreator(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow admins or the community creator to perform actions
        return request.user.is_staff or obj.community.creator == request.user