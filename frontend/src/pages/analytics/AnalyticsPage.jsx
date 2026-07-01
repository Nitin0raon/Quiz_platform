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

// Updated palette for dark mode (Lime / Green spectrum)
const COLORS = ['#a3e635', '#bef264', '#d9f99d', '#ecfccb', '#84cc16']

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#111111] border border-zinc-800 rounded-lg shadow-2xl p-4 text-xs font-sans min-w-[120px]">
        <p className="text-zinc-400 mb-3 font-semibold tracking-wide uppercase">{label}</p>
        {payload.map((p) => (
          <p
            key={p.name}
            className="font-bold flex items-center justify-between gap-4 text-sm"
            style={{ color: p.color }}
          >
            <span>{p.name}:</span>
            <span className="text-white">
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
      color: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
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
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in font-sans selection:bg-lime-400 selection:text-black text-zinc-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Analytics Overview</h1>
        <p className="text-zinc-400">Track your performance and progress over time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {dLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-zinc-800 p-6 rounded-2xl h-32 animate-pulse flex items-center gap-5">
                 <div className="w-14 h-14 bg-zinc-900 rounded-xl flex-shrink-0"></div>
                 <div className="flex-1 space-y-3">
                   <div className="h-6 bg-zinc-900 rounded w-1/2"></div>
                   <div className="h-4 bg-zinc-900 rounded w-3/4"></div>
                 </div>
              </div>
            ))
          : statCards.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="bg-[#111111] p-6 rounded-2xl border border-zinc-800 flex items-center gap-5 hover:border-lime-400/30 transition-all duration-300 shadow-lg group relative overflow-hidden"
              >
                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-lime-400/0 group-hover:bg-lime-400/[0.02] transition-colors pointer-events-none" />
                
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="min-w-0 relative z-10">
                  <h3 className="text-3xl font-display font-bold text-white leading-none mb-1.5">
                    {value}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {label}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-8">
        
        {/* Accuracy Trend */}
        <div className="bg-[#111111] border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-display font-semibold text-lg text-white">Accuracy Trend</h2>
              <p className="text-xs text-zinc-500 mt-1">Your performance over selected days</p>
            </div>

            <div className="flex gap-2 p-1 bg-[#0a0a0a] border border-zinc-800 rounded-lg self-start">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    days === d
                      ? 'bg-lime-400 text-[#0a0a0a] shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            {aLoading ? (
              <div className="w-full h-full animate-pulse bg-zinc-900/50 rounded-xl" />
            ) : accuracyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm border border-zinc-800 border-dashed rounded-xl">
                No data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />

                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy"
                    stroke="#a3e635"
                    strokeWidth={3}
                    fill="url(#accGrad)"
                    activeDot={{ r: 6, fill: '#a3e635', stroke: '#111111', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Topic Performance */}
        <div className="bg-[#111111] border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col">
          <div className="mb-8">
            <h2 className="font-display font-semibold text-lg text-white">Topic Performance</h2>
            <p className="text-xs text-zinc-500 mt-1">Accuracy breakdown by subject</p>
          </div>

          <div className="flex-1 min-h-[300px]">
            {dLoading ? (
              <div className="w-full h-full animate-pulse bg-zinc-900/50 rounded-xl" />
            ) : topicData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm border border-zinc-800 border-dashed rounded-xl">
                Take quizzes to view topic-wise performance.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />

                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12, fill: '#a1a1aa', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />

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