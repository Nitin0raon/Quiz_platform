"""
Analytics App - Views
======================
Provides dashboard analytics and leaderboard data.
"""

import logging
from django.db.models import Avg, Count, Max, Min, Sum, F, Q
from django.db.models.functions import TruncDate
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.users.models import User
from apps.quizzes.models import QuizAttempt, Quiz

logger = logging.getLogger('apps.analytics')


class UserDashboardView(APIView):
    """
    GET /api/v1/analytics/dashboard/
    Returns comprehensive analytics for the current user.
    Cached for 5 minutes to avoid repeated heavy DB queries.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cache_key = f'user_dashboard_{user.id}'

        # Try to get from cache first
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        # Get all completed attempts
        attempts = QuizAttempt.objects.filter(
            user=user,
            status=QuizAttempt.AttemptStatus.COMPLETED
        ).select_related('quiz')

        total_attempts = attempts.count()

        if total_attempts == 0:
            data = self._empty_dashboard(user)
        else:
            # Aggregate stats
            stats = attempts.aggregate(
                avg_accuracy=Avg('accuracy'),
                total_score=Sum('score'),
                total_points=Sum('points_earned'),
                best_accuracy=Max('accuracy'),
                total_time=Sum('time_taken_seconds'),
            )

            # Difficulty breakdown
            difficulty_breakdown = {}
            for difficulty in ['easy', 'medium', 'hard']:
                diff_attempts = attempts.filter(quiz__difficulty=difficulty)
                diff_count = diff_attempts.count()
                if diff_count > 0:
                    diff_avg = diff_attempts.aggregate(avg=Avg('accuracy'))['avg']
                    difficulty_breakdown[difficulty] = {
                        'attempts': diff_count,
                        'avg_accuracy': round(diff_avg or 0, 2),
                    }

            # Topic performance (group by quiz topic)
            topic_performance = (
                attempts
                .values('quiz__topic')
                .annotate(
                    attempts=Count('id'),
                    avg_accuracy=Avg('accuracy'),
                    best_accuracy=Max('accuracy'),
                )
                .order_by('-attempts')[:10]  # Top 10 topics
            )

            # Recent activity (last 7 days)
            from django.utils import timezone
            from datetime import timedelta
            week_ago = timezone.now() - timedelta(days=7)

            recent_activity = (
                attempts
                .filter(started_at__gte=week_ago)
                .annotate(date=TruncDate('started_at'))
                .values('date')
                .annotate(count=Count('id'), avg_acc=Avg('accuracy'))
                .order_by('date')
            )

            # Recent attempts
            recent_attempts = attempts.order_by('-started_at')[:5].values(
                'id', 'quiz__title', 'quiz__difficulty',
                'score', 'total_questions', 'accuracy',
                'points_earned', 'started_at'
            )

            data = {
                'success': True,
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'total_points': user.total_points,
                    'streak_days': user.streak_days,
                },
                'summary': {
                    'total_quizzes_taken': total_attempts,
                    'total_questions_answered': stats['total_score'] or 0,
                    'average_accuracy': round(stats['avg_accuracy'] or 0, 2),
                    'best_accuracy': round(stats['best_accuracy'] or 0, 2),
                    'total_points_earned': stats['total_points'] or 0,
                    'total_time_minutes': round((stats['total_time'] or 0) / 60, 1),
                },
                'difficulty_breakdown': difficulty_breakdown,
                'topic_performance': list(topic_performance),
                'recent_activity': list(recent_activity),
                'recent_attempts': list(recent_attempts),
            }

        # Cache for 5 minutes
        cache.set(cache_key, data, 300)

        return Response(data)

    def _empty_dashboard(self, user):
        return {
            'success': True,
            'user': {
                'username': user.username,
                'email': user.email,
                'total_points': 0,
                'streak_days': 0,
            },
            'summary': {
                'total_quizzes_taken': 0,
                'total_questions_answered': 0,
                'average_accuracy': 0,
                'best_accuracy': 0,
                'total_points_earned': 0,
                'total_time_minutes': 0,
            },
            'difficulty_breakdown': {},
            'topic_performance': [],
            'recent_activity': [],
            'recent_attempts': [],
            'message': 'No quiz attempts yet. Generate and take a quiz to see your analytics!',
        }
class AccuracyAnalyticsView(APIView):
    """
    GET /api/v1/analytics/accuracy/
    Returns accuracy trends over time for the current user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta

        # Get query params for date range
        days = int(request.query_params.get('days', 30))
        days = min(days, 365)  # Max 1 year

        start_date = timezone.now() - timedelta(days=days)

        attempts = QuizAttempt.objects.filter(
            user=request.user,
            status=QuizAttempt.AttemptStatus.COMPLETED,
            started_at__gte=start_date,
        ).annotate(
            date=TruncDate('started_at')
        ).values('date').annotate(
            attempts=Count('id'),
            avg_accuracy=Avg('accuracy'),
            total_points=Sum('points_earned'),
        ).order_by('date')

        return Response({
            'success': True,
            'period_days': days,
            'data': list(attempts),
        })
