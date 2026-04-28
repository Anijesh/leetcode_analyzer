from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AnalysisRequestSerializer, AnalysisResponseSerializer
from .models import Analysis
from .services import get_analysis
import traceback


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
        api_key = validated.get('api_key', '')

        try:
            result, cache_hit = get_analysis(
                problem_name=problem_name,
                language=language,
                code=code,
                problem_description=problem_description,
                api_key=api_key
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
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HistoryView(APIView):

    def get(self, request):
        try:
            analyses = Analysis.objects.all()[:20]  # latest 20
            serializer = AnalysisResponseSerializer(analyses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalysisDetailView(APIView):

    def get(self, request, pk):
        try:
            analysis = Analysis.objects.get(pk=pk)
            serializer = AnalysisResponseSerializer(analysis)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Analysis.DoesNotExist:
            return Response(
                {'error': 'Analysis not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )