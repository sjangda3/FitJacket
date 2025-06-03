from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import (
    Friend, Announcement, FriendRequest, Message,
    FitnessEvent, FitnessChallenge, FlaggedAIMessage, Workout, UserWorkout, UserProfile
)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['is_private']

class UserSerializer(serializers.ModelSerializer):
    token = serializers.CharField(read_only=True)
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'token', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # The profile will be created by the signal, now update it with data
        if profile_data:
            for attr, value in profile_data.items():
                setattr(user.profile, attr, value)
            user.profile.save()
        
        token = Token.objects.create(user=user)
        validated_data['token'] = token.key
        return user
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        if profile_data:
            profile_serializer = UserProfileSerializer(instance.profile, data=profile_data, partial=True)
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()
        return super().update(instance, validated_data)

class FriendSerializer(serializers.ModelSerializer):
    user_id1_details = UserSerializer(source='user_id1', read_only=True)
    user_id2_details = UserSerializer(source='user_id2', read_only=True)
    
    class Meta:
        model = Friend
        fields = ['id', 'user_id1', 'user_id2', 'created_at', 'updated_at', 'user_id1_details', 'user_id2_details']

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'text', 'created_at', 'updated_at']

class FriendRequestSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    receiver_details = UserSerializer(source='receiver', read_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'created_at', 'updated_at', 'sender_details', 'receiver_details']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'text','viewed','created_at', 'updated_at']

class FitnessEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FitnessEvent
        fields = ['id', 'start_time', 'end_time', 'description', 'title', 'user', 'participants', 'location', 'created_at', 'updated_at']

class FlaggedAIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlaggedAIMessage
        fields = ['id', 'text', 'user', 'created_at', 'updated_at']

class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'user', 'description', 'type', 'name', 'start_time', 'end_time', 'created_at', 'updated_at']

class UserWorkoutSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    workout_details = WorkoutSerializer(source='workout', read_only=True)
    
    class Meta:
        model = UserWorkout
        fields = ['id', 'user', 'workout', 'completed_at', 'user_details', 'workout_details']

class FitnessChallengeSerializer(serializers.ModelSerializer):
    workouts = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Workout.objects.all(),
        required=False
    )
    workout_details = WorkoutSerializer(source='workouts', many=True, read_only=True)
    
    class Meta:
        model = FitnessChallenge
        fields = ['id', 'start_time', 'end_time', 'description', 'title', 'user', 'participants', 'completed_by', 'workouts', 'workout_details', 'created_at', 'updated_at']
