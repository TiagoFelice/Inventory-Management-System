from django.contrib.auth.models import User
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .serializers import CurrentUserSerializer, UserSerializer


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
    permission_classes = [IsAdminUser]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
