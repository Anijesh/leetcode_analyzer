from django.db import models

# Create your models here.
class Analysis(models.Model):
    LANGUAGE_CHOICE =[
        ('Python3', 'Python3'),
        ('Python', 'Python'),
        ('JavaScript', 'JavaScript'),
        ('TypeScript', 'TypeScript'),
        ('Java', 'Java'),
        ('C++', 'C++'),
        ('C', 'C'),
        ('C#', 'C#'),
        ('Go', 'Go'),
        ('Rust', 'Rust'),
        ('Kotlin', 'Kotlin'),
        ('Swift', 'Swift'),
        ('Ruby', 'Ruby'),
        ('Scala', 'Scala'),
        ('PHP', 'PHP'),
        ('Dart', 'Dart'),
        ('Elixir', 'Elixir'),
        ('Erlang','Erlang'),
        ('Racket', 'Racket')
    ]
    problem_name = models.CharField(max_length = 500)
    language = models.CharField(max_length=30, choices=LANGUAGE_CHOICE)
    problem_description = models.TextField(blank=True, null=True)
    code = models.TextField(blank = False, null = False)
    result = models.JSONField(null=True, blank=True)
    cache_hit = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.problem_name} ({self.language})"
