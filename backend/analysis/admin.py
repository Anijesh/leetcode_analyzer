from django.contrib import admin

# Register your models here.
from .models import Analysis

@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ['problem_name', 'language', 'cache_hit', 'created_at']
    list_filter = ['language', 'cache_hit']
    search_fields = ['problem_name']
    readonly_fields = ['created_at', 'cache_hit', 'result']
    verbose_name_plural = 'Analyses'