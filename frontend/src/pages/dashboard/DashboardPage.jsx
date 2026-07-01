import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { analyticsService } from '../../services/analyticsService'
import {
  Zap, FileText, Trophy, TrendingUp, ArrowRight,
  Clock, Target, Flame, Plus, BookOpen
} from 'lucide-react'
import SkeletonCard from '../../components/common/SkeletonCard'
import { formatDate, formatTime } from '../../utils/helpers'

// Local helpers for dark mode specific colors
const getDifficultyColor = (d) => {
  if (d === 'easy') return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  if (d === 'medium') return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
  return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

const getAccuracyColor = (n) => {
  if (n >= 80) return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  if (n >= 60) return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
  return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

const getBarColor = (n) => {
  if (n >= 80) return 'bg-emerald-400'
  if (n >= 60) return 'bg-amber-400'
  return 'bg-rose-400'
}

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'bg-lime-400/10 text-lime-400 border-lime-400/20',
    orange: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    green:  'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    purple: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  }
  
  return (
    <div className="bg-[#111111] border border-zinc-800 p-6 rounded-2xl flex items-center gap-5 hover:border-lime-400/30 transition-all duration-300 shadow-lg group relative overflow-hidden">
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-lime-400/0 group-hover:bg-lime-400/[0.02] transition-colors pointer-events-none" />
      
      <div className={`p-3.5 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 relative z-10">
        <p className="text-3xl font-display font-bold text-white mb-1 leading-none">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
        {sub && <p className="text-[10px] text-zinc-600 mt-1 uppercase font-medium">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsService.dashboard().then(r => r.data),
    staleTime: 60_000,
  })

  const summary = data?.summary || {}
  const recent  = data?.recent_attempts || []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in font-sans selection:bg-lime-400 selection:text-black text-zinc-300">
      
      {/* Header & Quick Actions Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            {greeting}, <span className="text-lime-400">{user?.first_name || user?.username}</span> 👋
          </h1>
          <p className="text-zinc-400 text-base">
            Here's your study progress at a glance.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Link 
            to="/quizzes/generate" 
            className="flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-500 text-[#0a0a0a] font-bold text-sm px-6 py-3.5 rounded-lg transition-colors shadow-[0_0_15px_-3px_rgba(163,230,53,0.3)]"
          >
            <Plus className="w-4.5 h-4.5" /> Generate Quiz
          </Link>
          <Link 
            to="/documents/upload" 
            className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-zinc-900 text-white font-semibold text-sm px-6 py-3.5 rounded-lg border border-zinc-800 hover:border-lime-400/50 transition-colors"
          >
            <FileText className="w-4.5 h-4.5 text-zinc-400" /> Upload PDF
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-zinc-800 p-6 rounded-2xl h-28 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Zap}       label="Quizzes Taken"   value={summary.total_quizzes_taken || 0}    color="brand"  />
          <StatCard icon={Target}    label="Avg. Accuracy"   value={`${summary.average_accuracy || 0}%`} color="green"  sub="across all quizzes" />
          <StatCard icon={Trophy}    label="Total Points"    value={data?.user?.total_points || 0}        color="orange" />
          <StatCard icon={Flame}     label="Day Streak"      value={`${data?.user?.streak_days || 0}`}  color="purple" sub="keep it up!" />
        </div>
      )}

      {/* Recent attempts + topic performance */}
      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Recent attempts */}
        <div className="lg:col-span-3 bg-[#111111] border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-xl text-white">Recent Attempts</h2>
            <Link to="/quizzes/attempts" className="text-xs font-semibold text-lime-400 hover:text-lime-300 flex items-center gap-1.5 transition-colors uppercase tracking-wider">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
          ) : recent.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="font-semibold text-white mb-1">No attempts yet</p>
              <p className="text-sm text-zinc-500 mb-6">Generate and take your first quiz!</p>
              <Link to="/quizzes/generate" className="text-sm bg-lime-400 text-[#0a0a0a] font-bold px-6 py-2.5 rounded-lg hover:bg-lime-500 transition-colors">
                Start Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((a) => (
                <div key={a.id} className="group p-4 bg-[#0a0a0a] border border-zinc-800 rounded-xl hover:border-lime-400/30 transition-all flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${getAccuracyColor(a.accuracy)}`}>
                    <span className="font-display font-bold text-base">{Math.round(a.accuracy)}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-base truncate mb-1 group-hover:text-lime-400 transition-colors">{a.quiz__title}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(a.quiz__difficulty)}`}>
                        {a.quiz__difficulty}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(a.time_taken_seconds)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-white mb-0.5">{a.score} <span className="text-zinc-600 text-sm">/ {a.total_questions}</span></p>
                    <p className="text-xs text-zinc-500">{formatDate(a.started_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic performance */}
        <div className="lg:col-span-2 bg-[#111111] border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col">
          <h2 className="font-display font-semibold text-xl text-white mb-6">Topic Performance</h2>
          
          {isLoading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-900 animate-pulse rounded-lg"></div>)}</div>
          ) : (data?.topic_performance || []).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed text-center">
              <TrendingUp className="w-10 h-10 mb-3 text-zinc-700" />
              <p className="text-sm font-medium text-zinc-400">Take more quizzes to see<br/>topic insights here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(data.topic_performance || []).slice(0, 6).map((t) => (
                <div key={t.quiz__topic}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-zinc-300 truncate pr-3">{t.quiz__topic}</span>
                    <span className="text-sm font-bold text-white flex-shrink-0">{Math.round(t.avg_accuracy)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getBarColor(t.avg_accuracy)}`}
                      style={{ width: `${t.avg_accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}