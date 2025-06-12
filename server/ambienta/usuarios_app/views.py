
from rest_framework import viewsets
from django.contrib.auth.models import Group, Permission, User
from .serializers import GroupSerializer, PermissionSerializer, UserGroupSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserLogInSerializer, AdminPasswordResetSerializer
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404

#imports de autenticacion 
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import AllowAny


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    
class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    

class UserGroupViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserGroupSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({'detail': 'Usuario desactivado'}, status=status.HTTP_204_NO_CONTENT)
    


#para este caso solo necesito algunos campos
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login(request):
    user = get_object_or_404( User, username= request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({"detail": "Not Found"}, status=status.HTTP_404_NOT_FOUND)
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserLogInSerializer(instance=user)
    return Response({"token": token.key, "user":serializer.data}, status=status.HTTP_200_OK)


#para este caso el grupo seria null
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def signup(request):
    serializer = UserGroupSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username = request.data['username'])
        user.set_password(request.data['password']) #la contraseña se crea de esta forma para encriptarse
        user.save()
        token = Token.objects.create(user=user)
        return Response({"token": token.key, "user": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def test_token(request):
    if(not request.user):
        return Response({"is_valid": False, "user": None }, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    serializer = UserGroupSerializer(instance=user)
    return Response({"is_valid": True, "user": serializer.data }, status=status.HTTP_200_OK)

@api_view(['POST'])
def logout(request):
    request.user.auth_token.delete()
    return Response({"message": "Logout exitoso"}, status=status.HTTP_200_OK)
    

class AdminPasswordResetView(APIView):
    def post(self, request):
        serializer = AdminPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(id=serializer.validated_data['user_id'])
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)