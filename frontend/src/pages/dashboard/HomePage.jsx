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
  },
  {
    icon: Target,
    title: 'Adaptive difficulty',
    desc: 'Choose easy, medium, or hard — or let the system adapt based on your past performance.',
  },
  {
    icon: TrendingUp,
    title: 'Progress analytics',
    desc: 'Track accuracy by topic, monitor streaks, and identify which areas need more attention.',
  },
]

const QUICK_ACTIONS = [
  { icon: Zap,      title: 'Generate quiz',  desc: 'Pick a document, topic, and difficulty level', to: '/quizzes/generate' },
  { icon: FileText, title: 'Upload PDF',      desc: 'Add study material to generate quizzes from',  to: '/documents' },
  { icon: BookOpen, title: 'My quizzes',      desc: 'Browse, retake, or review past quizzes',       to: '/quizzes' },
  { icon: BarChart2,title: 'Analytics',       desc: 'Charts, accuracy trends, and leaderboard',    to: '/analytics' },
]

// Updated for Dark Mode Context
function difficultyClass(d) {
  return d === 'easy' 
    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
    : d === 'medium' 
    ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' 
    : 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

function accuracyColor(n) {
  if (n >= 80) return 'text-emerald-400'
  if (n >= 60) return 'text-amber-400'
  return 'text-rose-400'
}

function barColor(n) {
  if (n >= 80) return 'bg-emerald-400'
  if (n >= 60) return 'bg-amber-400'
  return 'bg-rose-400'
}

// Ensure accuracyBg from helpers is updated in your actual code, 
// or override it here for dark mode compatibility.
function customAccuracyBg(n) {
  if (n >= 80) return 'bg-emerald-400/10 text-emerald-400'
  if (n >= 60) return 'bg-amber-400/10 text-amber-400'
  return 'bg-rose-400/10 text-rose-400'
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
    <div className="space-y-10 animate-fade-in text-zinc-300 font-sans selection:bg-lime-400 selection:text-black pb-10">

      {/* ── HERO ── */}
      <div className="rounded-2xl bg-[#111111] border border-zinc-800 p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-lime-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              Welcome back, {name}
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed max-w-md">
              {streak >= 3
                ? `You're on a ${streak}-day streak. Keep up the momentum.`
                : 'Every quiz makes you sharper. Ready to continue?'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/quizzes/generate"
              className="inline-flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-500
                         text-[#0a0a0a] font-bold text-sm px-6 py-3 rounded-lg transition-colors shadow-[0_0_15px_-3px_rgba(163,230,53,0.3)]"
            >
               Generate Quiz <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/quizzes/attempts"
              className="inline-flex items-center justify-center gap-2 bg-[#0a0a0a] hover:bg-zinc-900
                         text-white font-medium text-sm px-6 py-3 rounded-lg
                         border border-zinc-800 hover:border-lime-400/50 transition-colors"
            >
              View History
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800/50 rounded-xl mt-10 overflow-hidden border border-zinc-800">
          {[
            { label: 'Total points',  value: points,       sub: '+124 this week' },
            { label: 'Avg accuracy',  value: `${accuracy}%`, sub: 'across all quizzes' },
            { label: 'Day streak',    value: streak,       sub: `Personal best: ${dashboard?.user?.best_streak || streak}` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-[#0a0a0a] px-6 py-5">
              <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
              <p className="text-sm text-zinc-400 font-medium mb-2">{label}</p>
              <p className="text-xs text-lime-400 flex items-center gap-1.5 opacity-80">
                <TrendingUp className="w-3.5 h-3.5" /> {sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <p className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
          Quick Actions
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, title, desc, to }) => (
            <Link key={title} to={to}
              className="bg-[#111111] border border-zinc-800 rounded-xl p-6
                         hover:border-lime-400/50 hover:bg-[#151515] transition-all group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-zinc-900 group-hover:bg-lime-400/10 transition-colors">
                <Icon className="w-5 h-5 text-lime-400" />
              </div>
              <p className="font-semibold text-base text-white group-hover:text-lime-400 transition-colors mb-1.5">
                {title}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Recent attempts (Takes up more space) */}
        <div className="lg:col-span-3 bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <p className="font-semibold text-base text-white">Recent Attempts</p>
            <Link to="/quizzes/attempts"
              className="text-xs text-lime-400 hover:text-lime-300 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {dashLoading ? (
            <SkeletonCard lines={4} />
          ) : recentAttempts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                 <BookOpen className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-base font-medium text-white mb-2">No attempts yet</p>
              <p className="text-sm text-zinc-500 mb-6 max-w-xs">Generate a quiz to see your history and performance here.</p>
              <Link to="/quizzes/generate"
                className="text-sm bg-lime-400 text-[#0a0a0a] font-semibold px-5 py-2.5 rounded-lg hover:bg-lime-500 transition-colors">
                Generate your first quiz
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800 flex-1">
              {recentAttempts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:bg-zinc-900/30 rounded-lg px-2 -mx-2 transition-colors">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center
                                   text-sm font-bold flex-shrink-0 ${customAccuracyBg(a.accuracy)} border ${customAccuracyBg(a.accuracy).replace('bg-', 'border-').replace('/10', '/20')}`}>
                    {Math.round(a.accuracy)}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white truncate mb-1">{a.quiz__title}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${difficultyClass(a.quiz__difficulty)}`}>
                        {a.quiz__difficulty}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(a.time_taken_seconds)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white mb-1">{a.score} <span className="text-zinc-500">/ {a.total_questions}</span></p>
                    <p className="text-xs text-zinc-500">{formatDate(a.started_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col (Takes up less space) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">

          {/* Topic performance */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-base text-white">Topic Performance</p>
              <Link to="/analytics"
                className="text-xs text-lime-400 hover:text-lime-300 font-medium flex items-center gap-1 transition-colors">
                Full report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {dashLoading ? <SkeletonCard lines={4} /> : topicPerf.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6 bg-zinc-900 rounded-lg border border-zinc-800 border-dashed">
                Take more quizzes to see topic insights
              </p>
            ) : (
              <div className="space-y-5">
                {topicPerf.slice(0, 4).map((t) => (
                  <div key={t.quiz__topic}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-zinc-300 truncate pr-2 font-medium">{t.quiz__topic}</span>
                      <span className={`text-sm font-bold flex-shrink-0 ${accuracyColor(t.avg_accuracy)}`}>
                        {Math.round(t.avg_accuracy)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${barColor(t.avg_accuracy)}`}
                        style={{ width: `${t.avg_accuracy}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform features */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex-1">
            <p className="font-semibold text-base text-white mb-6">Platform Features</p>
            <div className="divide-y divide-zinc-800/50">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{title}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
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