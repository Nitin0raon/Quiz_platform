import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { analyticsService } from '../../services/analyticsService'
import { quizService } from '../../services/quizService'
import { documentService } from '../../services/documentService'
import {
  Zap, FileText, BarChart2, BookOpen, TrendingUp,
  Brain, Target, ChevronRight, ArrowRight, Clock, Flame
} from 'lucide-react'
import SkeletonCard from '../../components/common/SkeletonCard'
import { formatDate, formatTime, accuracyBg } from '../../utils/helpers'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-generated quizzes',
    desc: 'Upload any PDF and get a tailored quiz in seconds — multiple choice, short answer, or mixed.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Target,
    title: 'Adaptive difficulty',
    desc: 'Choose easy, medium, or hard — or let the system adapt based on your past performance.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    icon: TrendingUp,
    title: 'Progress analytics',
    desc: 'Track accuracy by topic, monitor streaks, and identify which areas need more attention.',
    color: 'bg-amber-50 text-amber-700',
  },
]

const QUICK_ACTIONS = [
  { icon: Zap,      title: 'Generate quiz',  desc: 'Pick a document, topic, and difficulty level', to: '/quizzes/generate', color: 'bg-indigo-50 text-indigo-600' },
  { icon: FileText, title: 'Upload PDF',      desc: 'Add study material to generate quizzes from',  to: '/documents',        color: 'bg-teal-50 text-teal-700' },
  { icon: BookOpen, title: 'My quizzes',      desc: 'Browse, retake, or review past quizzes',       to: '/quizzes',          color: 'bg-purple-50 text-purple-600' },
  { icon: BarChart2,title: 'Analytics',       desc: 'Charts, accuracy trends, and leaderboard',    to: '/analytics',        color: 'bg-amber-50 text-amber-700' },
]

function difficultyClass(d) {
  return d === 'easy' ? 'badge-easy' : d === 'medium' ? 'badge-medium' : 'badge-hard'
}

function accuracyColor(n) {
  if (n >= 80) return 'text-green-600'
  if (n >= 60) return 'text-amber-600'
  return 'text-red-500'
}

function barColor(n) {
  if (n >= 80) return 'bg-green-400'
  if (n >= 60) return 'bg-amber-400'
  return 'bg-red-400'
}

export default function HomePage() {
  const { user } = useAuth()

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsService.dashboard().then(r => r.data),
    staleTime: 60_000,
  })

  const { data: docsData } = useQuery({
    queryKey: ['documents', 'recent'],
    queryFn: () => documentService.list({ page_size: 3 }).then(r => r.data),
    staleTime: 60_000,
  })

  const name           = user?.first_name || user?.username
  const streak         = dashboard?.user?.streak_days    || 0
  const points         = dashboard?.user?.total_points   || 0
  const accuracy       = dashboard?.summary?.average_accuracy || 0
  const recentAttempts = dashboard?.recent_attempts || []
  const topicPerf      = dashboard?.topic_performance || []

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── HERO ── */}
      <div className="rounded-3xl bg-[#1a1f36] p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#8a93b8] mb-1">
              Dashboard
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
              Welcome back, {name}
            </h1>
            <p className="text-sm text-[#8a93b8] leading-relaxed max-w-sm">
              {streak >= 3
                ? `You're on a ${streak}-day streak. Keep up the momentum.`
                : 'Every quiz makes you sharper. Ready to continue?'}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              to="/quizzes/generate"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600
                         text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <Zap className="w-4 h-4" /> Generate quiz
            </Link>
            <Link
              to="/quizzes/attempts"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20
                         text-white/80 font-medium text-sm px-5 py-2.5 rounded-xl
                         border border-white/10 transition-colors"
            >
              View history
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-px bg-white/10 rounded-xl mt-8 overflow-hidden">
          {[
            { label: 'Total points',  value: points,       sub: '+124 this week' },
            { label: 'Avg accuracy',  value: `${accuracy}%`, sub: 'across all quizzes' },
            { label: 'Day streak',    value: streak,       sub: `Personal best: ${dashboard?.user?.best_streak || streak}` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white/5 px-5 py-4">
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="text-xs text-[#8a93b8] mt-0.5">{label}</p>
              <p className="text-xs text-indigo-300 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-slate-400 mb-4">
          Quick actions
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, title, desc, to, color }) => (
            <Link key={title} to={to}
              className="bg-white border border-slate-100 rounded-2xl p-5
                         hover:border-slate-200 hover:shadow-sm transition-all group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-medium text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                {title}
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent attempts */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-sm text-slate-800">Recent attempts</p>
            <Link to="/quizzes/attempts"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {dashLoading ? (
            <SkeletonCard lines={4} />
          ) : recentAttempts.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500 mb-1">No attempts yet</p>
              <p className="text-xs text-slate-400 mb-4">Generate a quiz to see your history here</p>
              <Link to="/quizzes/generate"
                className="text-xs text-indigo-600 font-medium hover:underline">
                Generate your first quiz
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentAttempts.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                   text-xs font-semibold flex-shrink-0 ${accuracyBg(a.accuracy)}`}>
                    {Math.round(a.accuracy)}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.quiz__title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge text-xs ${difficultyClass(a.quiz__difficulty)}`}>
                        {a.quiz__difficulty}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(a.time_taken_seconds)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-700">{a.score}/{a.total_questions}</p>
                    <p className="text-xs text-slate-400">{formatDate(a.started_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-6">

          {/* Topic performance */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-sm text-slate-800">Topic performance</p>
              <Link to="/analytics"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Full report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {dashLoading ? <SkeletonCard lines={4} /> : topicPerf.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Take more quizzes to see topic insights
              </p>
            ) : (
              <div className="space-y-3">
                {topicPerf.slice(0, 4).map((t) => (
                  <div key={t.quiz__topic}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 truncate pr-2">{t.quiz__topic}</span>
                      <span className={`font-medium flex-shrink-0 ${accuracyColor(t.avg_accuracy)}`}>
                        {Math.round(t.avg_accuracy)}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor(t.avg_accuracy)}`}
                        style={{ width: `${t.avg_accuracy}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform features */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="font-medium text-sm text-slate-800 mb-4">Platform features</p>
            <div className="divide-y divide-slate-50">
              {FEATURES.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}