from rest_framework import serializers
from .models import Analysis

class AnalysisRequestSerializer(serializers.Serializer):
    problem_name = serializers.CharField(max_length=255)
    language = serializers.CharField(max_length=50)
    problem_description = serializers.CharField(required=False, allow_blank=True)
    code = serializers.CharField()
    api_key = serializers.CharField(required=False, allow_blank=True)

    
class AnalysisResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analysis
        fields = [
            'id',
            'problem_name',
            'language',
            'code',
            'result',
            'cache_hit',
            'created_at',
        ]