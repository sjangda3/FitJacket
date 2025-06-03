from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Friend, Announcement, FriendRequest, Message, FitnessEvent, FitnessChallenge, FlaggedAIMessage, Workout, UserWorkout
from .serializers import (
    UserSerializer, FriendSerializer, AnnouncementSerializer, FriendRequestSerializer,
    MessageSerializer, FitnessEventSerializer, FitnessChallengeSerializer,
    FlaggedAIMessageSerializer, WorkoutSerializer, UserWorkoutSerializer
)
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
import requests
from django.conf import settings
from django.shortcuts import redirect
from django.http import JsonResponse
from django.utils import timezone

    
class BatchUserLookupView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_ids = self.request.query_params.get('ids', '').split(',')
        
        if not user_ids or not user_ids[0]:  
            return User.objects.none()
        try:
            user_ids = [int(id) for id in user_ids]
            return User.objects.filter(id__in=user_ids)
        except ValueError:
            return User.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        user = serializer.instance
        token, created = Token.objects.get_or_create(user=user)
        
        response_data = serializer.data
        response_data['token'] = token.key
        
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def get_serializer(self, *args, **kwargs):
        kwargs['partial'] = True
        return super().get_serializer(*args, **kwargs)
    
class ChangePasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        user_id = self.kwargs.get('pk')
        user = get_object_or_404(User, id=user_id)
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(current_password):
            return Response({'detail': 'Current password is incorrect'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully'})

class FriendListView(generics.ListAPIView):
    serializer_class = FriendSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Friend.objects.filter(user_id1=user_id) | Friend.objects.filter(user_id2=user_id)
    
class FriendDeleteView(generics.DestroyAPIView):
    serializer_class = FriendSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        friend_id = self.kwargs['friend_id']
        return Friend.objects.get(id=friend_id)

class FriendCreateView(generics.CreateAPIView):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer

class AnnouncementListView(generics.ListAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [AllowAny]

class AnnouncementCreateView(generics.CreateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer


class FriendRequestListView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return FriendRequest.objects.filter(receiver=user_id)

class FriendRequestCreateView(generics.CreateAPIView):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [AllowAny]

class FriendRequestAcceptView(generics.UpdateAPIView):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [AllowAny]
    
    def update(self, request, *args, **kwargs):
        friend_request = self.get_object()
        
        friendship = Friend.objects.create(
            user_id1=friend_request.sender,
            user_id2=friend_request.receiver
        )
        
        friend_request.delete()
        
        friend_serializer = FriendSerializer(friendship)
        return Response(friend_serializer.data, status=status.HTTP_200_OK)


class FriendRequestDeclineView(generics.UpdateAPIView):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [AllowAny]
    
    def update(self, request, *args, **kwargs):
        friend_request = self.get_object()
        
        friend_request.delete()
        
        return Response(
            {"detail": "Friend request declined successfully."},
            status=status.HTTP_200_OK
        )


class MessageReceivedListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Message.objects.filter(receiver=user_id)

class MessageSentListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Message.objects.filter(sender=user_id)

class MessageCreateView(generics.CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]


class FitnessEventListView(generics.ListAPIView):
    queryset = FitnessEvent.objects.all().order_by('end_time')
    serializer_class = FitnessEventSerializer
    permission_classes = [AllowAny]

class FitnessEventDetailView(generics.RetrieveAPIView):
    queryset = FitnessEvent.objects.all()
    serializer_class = FitnessEventSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'event_id'
    permission_classes = [AllowAny]

class FitnessEventUserListView(generics.ListAPIView):
    serializer_class = FitnessEventSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return FitnessEvent.objects.filter(user=user_id) | FitnessEvent.objects.filter(participants=user_id).order_by('end_time')

class FitnessEventCreateView(generics.CreateAPIView):
    queryset = FitnessEvent.objects.all()
    serializer_class = FitnessEventSerializer
    permission_classes = [AllowAny]

class FitnessEventUpdateView(generics.UpdateAPIView):
    queryset = FitnessEvent.objects.all()
    serializer_class = FitnessEventSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'event_id'

class FitnessEventDeleteView(generics.DestroyAPIView):
    queryset = FitnessEvent.objects.all()
    serializer_class = FitnessEventSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'event_id'

class FitnessChallengeUpdateView(generics.UpdateAPIView):
    queryset = FitnessChallenge.objects.all()
    serializer_class = FitnessChallengeSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'challenge_id'

class FitnessChallengeDeleteView(generics.DestroyAPIView):
    queryset = FitnessChallenge.objects.all()
    serializer_class = FitnessChallengeSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'challenge_id'

class FitnessChallengeListView(generics.ListAPIView):
    queryset = FitnessChallenge.objects.all().order_by('end_time')
    serializer_class = FitnessChallengeSerializer
    permission_classes = [AllowAny]

class FitnessChallengeDetailView(generics.RetrieveAPIView):
    queryset = FitnessChallenge.objects.all()
    serializer_class = FitnessChallengeSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'challenge_id'
    permission_classes = [AllowAny]

class FitnessChallengeUserListView(generics.ListAPIView):
    serializer_class = FitnessChallengeSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return (FitnessChallenge.objects.filter(user=user_id) | 
                FitnessChallenge.objects.filter(participants=user_id)).order_by('end_time')

class FitnessChallengeCreateView(generics.CreateAPIView):
    queryset = FitnessChallenge.objects.all()
    serializer_class = FitnessChallengeSerializer
    permission_classes = [AllowAny]

class FlaggedAIMessageListView(generics.ListAPIView):
    serializer_class = FlaggedAIMessageSerializer
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return FlaggedAIMessage.objects.filter(user=user_id)

class FlaggedAIMessageCreateView(generics.CreateAPIView):
    queryset = FlaggedAIMessage.objects.all()
    serializer_class = FlaggedAIMessageSerializer

class WorkoutListView(generics.ListAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Workout.objects.filter(user=user_id)
    
class BatchWorkoutLookupView(generics.ListAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        workout_ids = self.request.query_params.get('ids', '').split(',')
        
        if not workout_ids or not workout_ids[0]:  
            return Workout.objects.none()
        try:
            workout_ids = [int(id) for id in workout_ids]
            return Workout.objects.filter(id__in=workout_ids)
        except ValueError:
            return Workout.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class WorkoutCreateView(generics.CreateAPIView):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [AllowAny]

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username
        })
    
class MessageMarkAsViewedView(generics.UpdateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]
    
    def update(self, request, *args, **kwargs):
        message = self.get_object()
        message.viewed = True
        message.save()
        return Response(self.get_serializer(message).data)

class UserWorkoutListView(generics.ListAPIView):
    serializer_class = UserWorkoutSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return UserWorkout.objects.filter(user=user_id)
    
class UserWorkoutCreateView(generics.CreateAPIView):
    queryset = UserWorkout.objects.all()
    serializer_class = UserWorkoutSerializer
    permission_classes = [AllowAny]


STRAVA_CLIENT_ID = '156568'
STRAVA_CLIENT_SECRET = settings.STRAVA_CLIENT_SECRET  # pull from env or settings.py
REDIRECT_URI = 'http://127.0.0.1:8000/api/strava/callback/'  # Make sure it matches Strava config


def strava_login(request):
    auth_url = (
        f"https://www.strava.com/oauth/authorize"
        f"?client_id={STRAVA_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={REDIRECT_URI}"
        f"&approval_prompt=auto"
        f"&scope=read,activity:read"
    )
    return redirect(auth_url)


def strava_callback(request):
    code = request.GET.get('code')

    token_response = requests.post(
        'https://www.strava.com/oauth/token',
        data={
            'client_id': '156568',
            'client_secret': 'fd86fc31b5880bdce098b94e0a2bc703819693ed',
            'code': code,
            'grant_type': 'authorization_code'
        }
    )

    token_data = token_response.json()
    access_token = token_data.get('access_token')
    
    request.session['strava_token'] = access_token

    data_to_send = {
        'activities': [],
        'athlete': {}
    }
    
    if access_token:
        headers = {'Authorization': f'Bearer {access_token}'}
        athlete_response = requests.get('https://www.strava.com/api/v3/athlete', headers=headers)
        
        if athlete_response.status_code == 200:
            data_to_send['athlete'] = athlete_response.json()
        
        activities_response = requests.get('https://www.strava.com/api/v3/athlete/activities?per_page=10', headers=headers)

        if activities_response.status_code == 200:
            data_to_send['activities'] = activities_response.json()
    
    import urllib.parse
    import json
    encoded_data = urllib.parse.quote(json.dumps(data_to_send))
    
    frontend_url = "http://localhost:5173/dashboard/settings"
    redirect_url = f"{frontend_url}?data={encoded_data}&connected=true"
    
    return redirect(redirect_url)

@api_view(['GET'])
def strava_latest_activity(request):
    access_token = request.session.get('strava_token')
    
    if not access_token:
        return JsonResponse({'error': 'Not connected to Strava'}, status=400)
    
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(
        'https://www.strava.com/api/v3/athlete/activities?per_page=1',
        headers=headers
    )
    
    if response.status_code == 200:
        activities = response.json()
        if activities:
            return JsonResponse(activities[0])
        return JsonResponse({'message': 'No activities found'})
    else:
        return JsonResponse({'error': 'Failed to fetch activity'}, status=400)