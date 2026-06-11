from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "username", "password", "age", "fitness_goal")

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data.get("username", validated_data["email"]),
            password=validated_data["password"],
            age=validated_data.get("age"),
            fitness_goal=validated_data.get("fitness_goal", ""),
        )


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("age", "fitness_goal")


class UserSerializer(serializers.ModelSerializer):
    strava_connected = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "username", "age", "fitness_goal", "strava_connected")

    def get_strava_connected(self, obj):
        return hasattr(obj, "stravaprofile")
