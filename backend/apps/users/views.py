from django.contrib.auth.models import User
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from .serializers import CurrentUserSerializer, UserSerializer


class IsSuperuser(BasePermission):
    """Allow access only to authenticated superusers."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class UserFilteredViewSet(viewsets.ModelViewSet):
    """Base viewset that filters by authenticated user."""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter results by current authenticated user."""
        queryset = super().get_queryset()
        return queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Automatically set user to current authenticated user."""
        serializer.save(user=self.request.user)


class UserManagementViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = User.objects.all().order_by('username', 'id')
    serializer_class = UserSerializer
    permission_classes = [IsSuperuser]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
