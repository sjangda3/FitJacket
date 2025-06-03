from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Friend, Announcement, FriendRequest, Message,
    FitnessEvent, FitnessChallenge, FlaggedAIMessage, Workout, UserWorkout, UserProfile, User
)

# Define an inline admin descriptor for UserProfile model
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profile'

# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Register your models here.
@admin.register(Friend)
class FriendAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id1', 'user_id2', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user_id1__username', 'user_id2__username')

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('text',)

@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('sender__username', 'receiver__username')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'viewed', 'created_at', 'updated_at')
    list_filter = ('viewed', 'created_at', 'updated_at')
    search_fields = ('sender__username', 'receiver__username', 'text')

@admin.register(FitnessEvent)
class FitnessEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'start_time', 'end_time', 'location', 'created_at', 'updated_at')
    list_filter = ('start_time', 'end_time', 'created_at', 'updated_at')
    search_fields = ('title', 'description', 'user__username', 'location')
    filter_horizontal = ('participants',)

@admin.register(FitnessChallenge)
class FitnessChallengeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'start_time', 'end_time', 'created_at', 'updated_at')
    list_filter = ('start_time', 'end_time', 'created_at', 'updated_at')
    search_fields = ('title', 'description', 'user__username')
    filter_horizontal = ('participants', 'workouts', 'completed_by')

@admin.register(FlaggedAIMessage)
class FlaggedAIMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'text')

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'start_time', 'end_time', 'created_at', 'updated_at')
    list_filter = ('type', 'start_time', 'end_time', 'created_at', 'updated_at')
    search_fields = ('user__username', 'description', 'type')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_private')
    list_filter = ('is_private',)
    search_fields = ('user__username',)

@admin.register(UserWorkout)
class UserWorkoutAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'workout', 'completed_at')
    list_filter = ('completed_at',)
    search_fields = ('user__username', 'workout__name')