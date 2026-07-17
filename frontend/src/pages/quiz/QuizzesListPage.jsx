import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { quizService } from '../../services/quizService'
import { Zap, Plus, Clock, ChevronRight, BookOpen } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

const TABS = {
  QUIZZES: 'quizzes',
  ATTEMPTS: 'attempts',
}

function getDifficultyStyles(difficulty) {
  if (difficulty === 'easy') return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  if (difficulty === 'medium') return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
  return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

const btnPrimary = "inline-flex items-center justify-center gap-2 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)]"

export default function QuizzesListPage() {
  const [tab, setTab] = useState(TABS.QUIZZES)

  const { data: quizzesData, isLoading: qLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizService.list().then(r => r.data),
    enabled: tab === TABS.QUIZZES,
  })

  const { data: attemptsData, isLoading: aLoading } = useQuery({
    queryKey: ['attempts'],
    queryFn: () => quizService.attempts().then(r => r.data),
    enabled: tab === TABS.ATTEMPTS,
  })

  const quizzes = quizzesData?.results || []
  const attempts = attemptsData?.results || []

  return (
    <div className="max-w-4xl mx-auto animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D] pb-20">
      {FONTS}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="f-display text-2xl md:text-3xl font-semibold text-[#ECEAE6]">Quizzes</h1>
          <p className="text-[#8B8F97] f-body mt-1">Manage your quizzes and view attempt history</p>
        </div>
        <Link to="/quizzes/generate" className={btnPrimary}>
          <Plus className="w-4 h-4" /> New Quiz
        </Link>
      </div>

      {/* Accessible Tabs */}
      <div 
        role="tablist"
        aria-label="Quiz management tabs"
        className="flex gap-1 bg-[#14161B] border border-[#24272E] rounded-xl p-1 w-fit mb-8 shadow-md"
      >
        {[
          [TABS.QUIZZES, 'My Quizzes'], 
          [TABS.ATTEMPTS, 'Attempt History']
        ].map(([val, label]) => (
          <button
            key={val}
            role="tab"
            aria-selected={tab === val}
            onClick={() => setTab(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all f-body ${
              tab === val 
                ? 'bg-[#24272E] text-[#ECEAE6] shadow-sm' 
                : 'text-[#8B8F97] hover:text-[#ECEAE6] hover:bg-[#24272E]/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Quizzes list */}
      {tab === TABS.QUIZZES && (
        qLoading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No quizzes yet"
            description="Generate your first AI quiz from an uploaded PDF."
            action={<Link to="/quizzes/generate" className={btnPrimary}><Plus className="w-3.5 h-3.5" /> Generate Quiz</Link>}
          />
        ) : (
          <div className="space-y-4">
            {quizzes.map((q) => <QuizCard key={q.id} quiz={q} />)}
          </div>
        )
      )}

      {/* Attempts list */}
      {tab === TABS.ATTEMPTS && (
        aLoading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : attempts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No attempts yet"
            description="Take a quiz to start building your history."
          />
        ) : (
          <div className="space-y-4">
            {attempts.map((a) => <AttemptCard key={a.id} attempt={a} />)}
          </div>
        )
      )}
    </div>
  )
}

// --- Sub-components ---

function QuizCard({ quiz }) {
  return (
    <div className="bg-[#14161B] border border-[#24272E] hover:border-[#F5B942]/40 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 transition-colors shadow-lg shadow-black/10">
      <div className="w-12 h-12 bg-[#0A0B0D] border border-[#24272E] rounded-xl flex items-center justify-center flex-shrink-0 hidden sm:flex">
        <Zap className="w-5 h-5 text-[#F5B942]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#ECEAE6] f-display text-lg truncate mb-1">{quiz.title}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-[10px] f-mono uppercase tracking-wider border ${getDifficultyStyles(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
          <span className="text-xs text-[#8B8F97] f-mono">{quiz.total_questions} questions</span>
          {quiz.time_limit_minutes > 0 && (
            <span className="text-xs text-[#8B8F97] f-mono flex items-center gap-1">
              <Clock className="w-3 h-3" /> {quiz.time_limit_minutes}m
            </span>
          )}
          <span className="text-xs text-[#4A4E56] f-mono ml-auto sm:ml-0">{formatDate(quiz.created_at)}</span>
        </div>
      </div>
      <Link to={`/quizzes/${quiz.id}`} className={`${btnPrimary} w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0`}>
        Take Quiz <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

function AttemptCard({ attempt }) {
  const pct = Math.round(attempt.accuracy)
  const isExcellent = pct >= 80
  const isGood = pct >= 60
  const scoreStyles = isExcellent
    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
    : isGood
    ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    : 'bg-rose-400/10 text-rose-400 border-rose-400/20'

  return (
    <Link 
      to={`/quizzes/result/${attempt.id}`}
      className="bg-[#14161B] border border-[#24272E] hover:border-[#F5B942]/40 p-5 rounded-2xl flex items-center gap-4 transition-colors group shadow-lg shadow-black/10"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${scoreStyles}`}>
        <span className="f-display font-bold text-lg">{pct}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#ECEAE6] f-display text-lg truncate mb-1 group-hover:text-[#F5B942] transition-colors">{attempt.quiz_title}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-[10px] f-mono uppercase tracking-wider border ${getDifficultyStyles(attempt.quiz_difficulty)}`}>
            {attempt.quiz_difficulty}
          </span>
          <span className="text-xs text-[#8B8F97] f-mono">{attempt.score}/{attempt.total_questions} correct</span>
          <span className="text-xs text-[#4A4E56] f-mono ml-auto sm:ml-0">{formatDate(attempt.started_at)}</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-[#4A4E56] group-hover:text-[#F5B942] flex-shrink-0 transition-colors" />
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-5 flex items-center gap-4 animate-pulse">
       <div className="w-12 h-12 bg-[#24272E] rounded-xl flex-shrink-0 hidden sm:block"></div>
       <div className="flex-1 space-y-3">
         <div className="h-5 bg-[#24272E] rounded-md w-1/2 sm:w-1/3"></div>
         <div className="flex gap-2">
            <div className="h-4 bg-[#24272E] rounded w-16"></div>
            <div className="h-4 bg-[#24272E] rounded w-24"></div>
         </div>
       </div>
       <div className="h-10 bg-[#24272E] rounded-xl w-full sm:w-32 mt-4 sm:mt-0"></div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-12 text-center flex flex-col items-center justify-center border-dashed">
      <div className="w-16 h-16 bg-[#0A0B0D] border border-[#24272E] rounded-full flex items-center justify-center mb-5 shadow-inner">
        <Icon className="w-7 h-7 text-[#4A4E56]" />
      </div>
      <h3 className="f-display text-xl font-semibold text-[#ECEAE6] mb-2">{title}</h3>
      <p className="text-[#8B8F97] f-body max-w-sm mb-8">{description}</p>
      {action}
    </div>
  )
}