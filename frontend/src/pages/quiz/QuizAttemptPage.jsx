import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { quizService } from '../../services/quizService'
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

function Timer({ totalSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (totalSeconds <= 0) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(id); onExpire(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [totalSeconds, onExpire])

  if (totalSeconds <= 0) return null

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const pct = (remaining / totalSeconds) * 100
  const urgent = pct < 25

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg f-mono text-sm font-semibold border transition-colors ${
      urgent 
        ? 'bg-rose-400/10 text-rose-400 border-rose-400/20' 
        : 'bg-[#0A0B0D] text-[#ECEAE6] border-[#24272E]'
    }`}>
      <Clock className={`w-4 h-4 ${urgent ? 'text-rose-400 animate-pulse' : 'text-[#8B8F97]'}`} />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  )
}

function getDifficultyStyles(difficulty) {
  if (difficulty === 'easy') return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  if (difficulty === 'medium') return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
  return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
}

export default function QuizAttemptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const startTime = useState(() => Date.now())[0]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizService.get(id).then(r => r.data.quiz),
    staleTime: Infinity,
  })

  const submitMut = useMutation({
    mutationFn: (payload) => quizService.submit(id, payload),
    onSuccess: (res) => {
      navigate(`/quizzes/result/${res.data.result.id}`)
    },
    onError: () => toast.error('Submission failed. Try again.'),
  })

  const handleSubmit = useCallback(() => {
    if (submitted) return
    setSubmitted(true)
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const answersArr = Object.entries(answers).map(([question_id, selected_option]) => ({
      question_id, selected_option,
    }))
    submitMut.mutate({ answers: answersArr, time_taken_seconds: timeTaken })
  }, [submitted, answers, startTime, submitMut])

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
      <Loader2 className="w-8 h-8 text-[#F5B942] animate-spin" />
      <p className="text-[#8B8F97] f-mono text-sm uppercase tracking-wider">Loading Quiz</p>
    </div>
  )
  
  if (error || !data) return (
    <div className="text-center py-20 animate-fade-in">
      <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4 opacity-80" />
      <p className="text-[#ECEAE6] f-display text-lg">Quiz not found or inaccessible.</p>
    </div>
  )

  const questions = data.questions || []
  const q = questions[current]
  const answered = Object.keys(answers).length
  const total = questions.length
  const OPTIONS = ['A', 'B', 'C', 'D']

  const btnPrimary = "inline-flex items-center justify-center gap-2 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
  const btnSecondary = "inline-flex items-center justify-center gap-2 bg-[#14161B] hover:bg-[#181B21] border border-[#24272E] hover:border-[#F5B942]/40 text-[#ECEAE6] f-body font-medium text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D] pb-20">
      {FONTS}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] p-5 rounded-2xl border border-[#24272E]">
        <div className="min-w-0">
          <h1 className="f-display text-xl font-semibold text-[#ECEAE6] truncate mb-2">{data.title}</h1>
          <p className="text-xs text-[#8B8F97] f-mono flex items-center gap-3">
            <span>{answered} / {total} answered</span>
            <span className={`px-2 py-0.5 rounded border uppercase tracking-wider text-[10px] ${getDifficultyStyles(data.difficulty)}`}>
              {data.difficulty}
            </span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <Timer
            totalSeconds={data.time_limit_minutes ? data.time_limit_minutes * 60 : 0}
            onExpire={handleSubmit}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#0A0B0D] border border-[#24272E] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F5B942] rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,185,66,0.5)]"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-8">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0A0B0D] border border-[#24272E] text-[#F5B942] 
                           f-mono text-sm font-semibold flex items-center justify-center">
            {current + 1}
          </span>
          <p className="text-[#ECEAE6] font-medium text-lg leading-relaxed f-display mt-0.5">
            {q?.question_text}
          </p>
        </div>

        <div className="space-y-3">
          {OPTIONS.map((opt) => {
            const optText = q?.[`option_${opt.toLowerCase()}`]
            const selected = answers[q?.id] === opt
            return (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                className={`w-full text-left flex items-start gap-4 px-5 py-4 rounded-xl border-2
                  transition-all duration-200 group ${
                  selected
                    ? 'border-[#F5B942] bg-[#F5B942]/10 text-[#ECEAE6]'
                    : 'border-[#24272E] bg-[#0A0B0D] hover:border-[#F5B942]/40 hover:bg-[#181B21] text-[#8B8F97] hover:text-[#ECEAE6]'
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center
                  f-mono text-xs font-bold transition-colors mt-0.5 ${
                  selected
                    ? 'border-[#F5B942] bg-[#F5B942] text-[#0A0B0D]'
                    : 'border-[#24272E] text-[#4A4E56] group-hover:border-[#F5B942]/40 group-hover:text-[#F5B942]'
                }`}>
                  {opt}
                </span>
                <span className="text-sm leading-relaxed f-body">{optText}</span>
                {selected && <CheckCircle className="w-5 h-5 text-[#F5B942] ml-auto flex-shrink-0 mt-0.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className={btnSecondary}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex gap-2 flex-wrap justify-center">
          {questions.map((q, i) => {
            const isCurrent = i === current;
            const isAnswered = answers[q.id];
            
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg f-mono text-xs font-semibold transition-all border flex items-center justify-center ${
                  isCurrent 
                    ? 'bg-[#ECEAE6] text-[#0A0B0D] border-[#ECEAE6] scale-110 shadow-md' 
                    : isAnswered 
                      ? 'bg-[#F5B942]/20 text-[#F5B942] border-[#F5B942]/30 hover:border-[#F5B942]' 
                      : 'bg-[#0A0B0D] text-[#8B8F97] border-[#24272E] hover:border-[#F5B942]/40 hover:text-[#ECEAE6]'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {current < total - 1 ? (
          <button onClick={() => setCurrent(current + 1)} className={btnSecondary}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMut.isPending}
            className={btnPrimary}
          >
            {submitMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Submit button (bottom fixed area for visibility when mostly answered) */}
      {answered > 0 && (
        <div className="pt-8 text-center border-t border-[#24272E] mt-12">
          <button
            onClick={handleSubmit}
            disabled={submitMut.isPending}
            className={`${btnPrimary} px-8 py-4 text-base`}
          >
            {submitMut.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
            ) : (
              `Complete & Submit (${answered}/${total})`
            )}
          </button>
          {answered < total && (
            <p className="text-xs text-[#8B8F97] mt-3 f-mono opacity-70">
              {total - answered} question{total - answered !== 1 ? 's' : ''} unanswered — they'll be marked incorrect
            </p>
          )}
        </div>
      )}
    </div>
  )
}