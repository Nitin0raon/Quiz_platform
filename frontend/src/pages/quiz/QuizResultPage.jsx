import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { quizService } from '../../services/quizService'
import { CheckCircle, XCircle, Trophy, Clock, Zap, RotateCcw, BarChart2, Loader2 } from 'lucide-react'
import { formatTime } from '../../utils/helpers'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

function ScoreRing({ pct }) {
  const r = 52, c = 2 * Math.PI * r
  const dash = (pct / 100) * c

  // Map to Tailwind 400 shades: emerald-400, amber-400, rose-400
  const color = pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#fb7185'
  const label = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good job!' : '📚 Keep studying!'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#24272E" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(currentColor,0.5)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="f-display text-4xl font-semibold text-[#ECEAE6]">{pct}%</span>
          <span className="text-[10px] uppercase tracking-widest text-[#8B8F97] f-mono mt-1">accuracy</span>
        </div>
      </div>
      <p className="text-[#ECEAE6] f-body text-sm font-medium mt-6">{label}</p>
    </div>
  )
}

function getDifficultyStyles(difficulty) {
  if (difficulty === 'easy') return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  if (difficulty === 'medium') return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
  return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

export default function QuizResultPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['attempt', id],
    queryFn: () => quizService.getAttempt(id).then(r => r.data.attempt),
    staleTime: Infinity,
  })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
      <Loader2 className="w-8 h-8 text-[#F5B942] animate-spin" />
      <p className="text-[#8B8F97] f-mono text-sm uppercase tracking-wider">Loading Results</p>
    </div>
  )
  if (!data) return (
    <div className="text-center py-20 animate-fade-in text-[#8B8F97] f-display text-lg">
      Result not found.
    </div>
  )

  const pct = Math.round(data.accuracy)

  const btnPrimary = "inline-flex items-center justify-center gap-2 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold text-sm px-4 py-3 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] flex-1"
  const btnSecondary = "inline-flex items-center justify-center gap-2 bg-[#14161B] hover:bg-[#181B21] border border-[#24272E] hover:border-[#F5B942]/40 text-[#ECEAE6] f-body font-medium text-sm px-4 py-3 rounded-xl transition-colors flex-1"
  const btnGhost = "inline-flex items-center justify-center gap-2 bg-transparent hover:bg-[#24272E]/50 text-[#8B8F97] hover:text-[#ECEAE6] border border-transparent f-body font-medium text-sm px-4 py-3 rounded-xl transition-colors flex-1"

  return (
    <div className="max-w-3xl mx-auto animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D] pb-20 space-y-8">
      {FONTS}

      {/* Result summary card */}
      <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-8 md:p-10 text-center shadow-xl shadow-black/20">
        <h1 className="f-display text-2xl md:text-3xl font-semibold text-[#ECEAE6] mb-3">{data.quiz_title}</h1>
        
        <div className="flex justify-center mb-10">
          <span className={`px-3 py-1 rounded-md text-xs f-mono uppercase tracking-wider border ${getDifficultyStyles(data.quiz_difficulty)}`}>
            {data.quiz_difficulty}
          </span>
        </div>

        <ScoreRing pct={pct} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-[#24272E]/70">
          <div className="bg-[#0A0B0D] border border-[#24272E] rounded-xl py-4">
            <p className="f-mono text-2xl font-semibold text-[#ECEAE6]">{data.score} <span className="text-[#4A4E56] text-lg">/ {data.total_questions}</span></p>
            <p className="text-xs text-[#8B8F97] mt-1 f-display tracking-wide uppercase">Score</p>
          </div>
          <div className="bg-[#0A0B0D] border border-[#24272E] rounded-xl py-4">
            <p className="f-mono text-2xl font-semibold text-[#F5B942] flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" /> {data.points_earned}
            </p>
            <p className="text-xs text-[#8B8F97] mt-1 f-display tracking-wide uppercase">Points earned</p>
          </div>
          <div className="bg-[#0A0B0D] border border-[#24272E] rounded-xl py-4">
            <p className="f-mono text-2xl font-semibold text-[#ECEAE6] flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-[#8B8F97]" /> {formatTime(data.time_taken_seconds)}
            </p>
            <p className="text-xs text-[#8B8F97] mt-1 f-display tracking-wide uppercase">Time taken</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/quizzes/generate" className={btnPrimary}>
          <Zap className="w-4 h-4" /> New Quiz
        </Link>
        <Link to="/analytics" className={btnSecondary}>
          <BarChart2 className="w-4 h-4" /> Analytics
        </Link>
        <Link to="/quizzes" className={btnGhost}>
          <RotateCcw className="w-4 h-4" /> All Quizzes
        </Link>
      </div>

      {/* Answer review */}
      <div>
        <h2 className="f-display font-semibold text-xl text-[#ECEAE6] mb-6">Answer Review</h2>
        <div className="space-y-5">
          {(data.answers || []).map((a, i) => {
            const isQCorrect = a.is_correct;
            
            return (
              <div 
                key={i} 
                className={`bg-[#14161B] border-y border-r border-[#24272E] rounded-2xl p-5 md:p-6 border-l-4 ${
                  isQCorrect ? 'border-l-emerald-400' : 'border-l-rose-400'
                }`}
              >
                <div className="flex items-start gap-4 mb-5">
                  {isQCorrect
                    ? <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]" />
                    : <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(251,113,133,0.4)]" />
                  }
                  <p className="text-[#ECEAE6] font-medium text-base leading-relaxed f-display mt-0.5">
                    <span className="text-[#8B8F97] f-mono text-sm mr-2">{String(i + 1).padStart(2, '0')}.</span>
                    {a.question_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-0 md:ml-10 mb-2">
                  {['a', 'b', 'c', 'd'].map((opt) => {
                    const letter = opt.toUpperCase()
                    const isCorrectOpt = letter === a.correct_answer
                    const isSelectedOpt = letter === a.selected_option
                    const text = a[`option_${opt}`]
                    
                    return (
                      <div
                        key={opt}
                        className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm transition-colors border ${
                          isCorrectOpt 
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' 
                            : isSelectedOpt && !isCorrectOpt 
                              ? 'bg-rose-400/10 text-rose-400 border-rose-400/30' 
                              : 'bg-[#0A0B0D] text-[#8B8F97] border-[#24272E]'
                        }`}
                      >
                        <span className="font-bold f-mono">{letter}.</span>
                        <span className="flex-1 f-body leading-relaxed pt-0.5">{text}</span>
                        {isCorrectOpt && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />}
                        {isSelectedOpt && !isCorrectOpt && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-1" />}
                      </div>
                    )
                  })}
                </div>

                {a.explanation && (
                  <div className="ml-0 md:ml-10 mt-5 p-4 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/20">
                    <p className="text-[11px] f-mono font-semibold text-[#F5B942] mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> AI Explanation
                    </p>
                    <p className="text-sm text-[#ECEAE6]/90 f-body leading-relaxed">{a.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}