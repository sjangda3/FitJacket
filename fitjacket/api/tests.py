from django.test import TestCase
from django.utils import timezone
from django.contrib.auth.models import User  
from api.models import Message, Workout 

class MessageTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="test1", password="testpass123")
        self.user2 = User.objects.create_user(username="test2", password="testpass123")
        self.message = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Test message"
        )

    def test_message_default_not_viewed(self):
        """Test that new messages are unread by default"""
        self.assertFalse(self.message.viewed)

    def test_mark_as_viewed(self):
        """Test marking messages as viewed"""
        self.message.viewed = True
        self.message.save()
        self.assertTrue(Message.objects.get(pk=self.message.pk).viewed)

class WorkoutTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="workout_test", password="testpass123")
        self.workout = Workout.objects.create(
            user=self.user,
            description="Morning run",
            type="cardio",
            tp="5km",
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(hours=1)
        )

    def test_workout_times(self):
        """Test that end_time is after start_time"""
        self.assertLess(self.workout.start_time, self.workout.end_time)