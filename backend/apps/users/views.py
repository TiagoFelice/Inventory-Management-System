from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


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