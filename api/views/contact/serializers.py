from rest_framework import serializers

from .models import Contact as ContactModel


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactModel
        fields = "__all__"
