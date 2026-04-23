from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AnalysisRequestSerializer, AnalysisResponseSerializer
from .models import Analysis
from .services import get_analysis


class AnalyzeView(APIView):

    def post(self, request):
        serializer = AnalysisRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        validated = serializer.validated_data
        problem_name = validated['problem_name']
        language = validated['language']
        code = validated['code']
        problem_description = validated.get('problem_description', '')

        try:
            result, cache_hit = get_analysis(
                problem_name=problem_name,
                language=language,
                code=code,
                problem_description=problem_description
            )

            analysis = Analysis.objects.create(
                problem_name=problem_name,
                language=language,
                code=code,
                problem_description=problem_description,
                result=result,
                cache_hit=cache_hit
            )

            response_data = AnalysisResponseSerializer(analysis).data
            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )