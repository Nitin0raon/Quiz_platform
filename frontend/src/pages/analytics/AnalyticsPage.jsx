import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../../services/analyticsService'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingUp, Award, Users, Target } from 'lucide-react'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

// Updated palette for golden/amber spectrum to match the theme
const COLORS = ['#F5B942', '#fbbf24', '#fcd34d', '#fde68a', '#fef08a']

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#14161B] border border-[#24272E] rounded-xl shadow-2xl p-4 min-w-[140px]">
        <p className="text-[#8B8F97] mb-3 f-mono text-[10px] font-semibold tracking-wider uppercase">{label}</p>
        {payload.map((p) => (
          <p
            key={p.name}
            className="font-bold flex items-center justify-between gap-4 text-sm f-body"
            style={{ color: p.color }}
          >
            <span>{p.name}:</span>
            <span className="text-[#ECEAE6]">
              {typeof p.value === 'number'
                ? `${Math.round(p.value)}${
                    p.name.toLowerCase().includes('accuracy') ? '%' : ''
                  }`
                : p.value}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)

  const { data: dashboard, isLoading: dLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsService.dashboard().then((r) => r.data),
    staleTime: 60000,
  })

  const { data: accuracy, isLoading: aLoading } = useQuery({
    queryKey: ['accuracy', days],
    queryFn: () => analyticsService.accuracy(days).then((r) => r.data),
    staleTime: 60000,
  })

  const summary = dashboard?.summary || {}

  const topicData = (dashboard?.topic_performance || [])
    .slice(0, 8)
    .map((t) => ({
      name:
        t.quiz__topic?.length > 16
          ? `${t.quiz__topic.slice(0, 16)}…`
          : t.quiz__topic,
      accuracy: Math.round(t.avg_accuracy),
      attempts: t.attempts,
    }))

  const accuracyData = (accuracy?.data || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    accuracy: Math.round(d.avg_accuracy),
    attempts: d.attempts,
  }))

  const statCards = [
    {
      icon: Target,
      label: 'Avg. Accuracy',
      value: `${summary.average_accuracy || 0}%`,
      color: 'text-[#F5B942] bg-[#F5B942]/10 border-[#F5B942]/20',
    },
    {
      icon: TrendingUp,
      label: 'Best Accuracy',
      value: `${summary.best_accuracy || 0}%`,
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    },
    {
      icon: Award,
      label: 'Total Points',
      value: summary.total_points_earned || 0,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
    {
      icon: Users,
      label: 'Quizzes Taken',
      value: summary.total_quizzes_taken || 0,
      color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D]">
      {FONTS}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl f-display font-semibold text-[#ECEAE6] mb-2">Analytics Overview</h1>
        <p className="text-[#8B8F97] f-body">Track your performance and progress over time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {dLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#14161B] border border-[#24272E] p-6 rounded-2xl h-32 animate-pulse flex items-center gap-5">
                 <div className="w-14 h-14 bg-[#24272E] rounded-xl flex-shrink-0"></div>
                 <div className="flex-1 space-y-3">
                   <div className="h-6 bg-[#24272E] rounded w-1/2"></div>
                   <div className="h-4 bg-[#24272E] rounded w-3/4"></div>
                 </div>
              </div>
            ))
          : statCards.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="bg-[#14161B] p-6 rounded-2xl border border-[#24272E] flex items-center gap-5 hover:border-[#F5B942]/30 transition-all duration-300 shadow-lg shadow-black/10 group relative overflow-hidden"
              >
                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-[#F5B942]/0 group-hover:bg-[#F5B942]/[0.03] transition-colors pointer-events-none" />
                
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="min-w-0 relative z-10">
                  <h3 className="text-3xl f-display font-bold text-[#ECEAE6] leading-none mb-1.5">
                    {value}
                  </h3>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B8F97] f-mono">
                    {label}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-8">
        
        {/* Accuracy Trend */}
        <div className="bg-[#14161B] border border-[#24272E] p-6 sm:p-8 rounded-2xl shadow-lg shadow-black/10 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="f-display font-semibold text-lg text-[#ECEAE6]">Accuracy Trend</h2>
              <p className="text-[11px] text-[#8B8F97] f-mono uppercase tracking-wider mt-1">Your performance over selected days</p>
            </div>

            <div className="flex gap-2 p-1 bg-[#0A0B0D] border border-[#24272E] rounded-lg self-start">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors f-mono ${
                    days === d
                      ? 'bg-[#24272E] text-[#ECEAE6] shadow-sm shadow-black/20'
                      : 'text-[#8B8F97] hover:text-[#ECEAE6] hover:bg-[#24272E]/50'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            {aLoading ? (
              <div className="w-full h-full animate-pulse bg-[#24272E]/30 rounded-xl" />
            ) : accuracyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#4A4E56] f-mono text-sm border border-[#24272E] border-dashed rounded-xl">
                No data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5B942" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F5B942" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#24272E" vertical={false} />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#8B8F97', fontFamily: "'JetBrains Mono', monospace" }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#8B8F97', fontFamily: "'JetBrains Mono', monospace" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4A4E56', strokeWidth: 1, strokeDasharray: '4 4' }} />

                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy"
                    stroke="#F5B942"
                    strokeWidth={3}
                    fill="url(#accGrad)"
                    activeDot={{ r: 6, fill: '#F5B942', stroke: '#0A0B0D', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Topic Performance */}
        <div className="bg-[#14161B] border border-[#24272E] p-6 sm:p-8 rounded-2xl shadow-lg shadow-black/10 flex flex-col">
          <div className="mb-8">
            <h2 className="f-display font-semibold text-lg text-[#ECEAE6]">Topic Performance</h2>
            <p className="text-[11px] text-[#8B8F97] f-mono uppercase tracking-wider mt-1">Accuracy breakdown by subject</p>
          </div>

          <div className="flex-1 min-h-[300px]">
            {dLoading ? (
              <div className="w-full h-full animate-pulse bg-[#24272E]/30 rounded-xl" />
            ) : topicData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#4A4E56] f-mono text-sm border border-[#24272E] border-dashed rounded-xl">
                Take quizzes to view topic-wise performance.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24272E" horizontal={false} />

                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#8B8F97', fontFamily: "'JetBrains Mono', monospace" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11, fill: '#ECEAE6', fontFamily: "'JetBrains Mono', monospace" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#24272E', opacity: 0.4 }} />

                  <Bar dataKey="accuracy" name="Accuracy" radius={[0, 6, 6, 0]} barSize={24}>
                    {topicData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}