from django.urls import path
from .views import AnalyzeView,HistoryView,AnalysisDetailView

urlpatterns = [
    path('analyze/', AnalyzeView.as_view(), name='analyze'),
    path('history/', HistoryView.as_view(), name='history'),
    path('analyze/<int:pk>/', AnalysisDetailView.as_view(), name='analyze-detail'),
]