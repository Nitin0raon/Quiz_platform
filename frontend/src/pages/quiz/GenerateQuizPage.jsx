import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { documentService } from '../../services/documentService'
import { quizService } from '../../services/quizService'
import { Zap, ChevronDown, Brain, FileText, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   desc: 'Factual recall',          activeClass: 'border-emerald-400 bg-emerald-400/10 text-emerald-400' },
  { value: 'medium', label: 'Medium', desc: 'Application & reasoning', activeClass: 'border-amber-400 bg-amber-400/10 text-amber-400' },
  { value: 'hard',   label: 'Hard',   desc: 'Analysis & synthesis',    activeClass: 'border-rose-400 bg-rose-400/10 text-rose-400' },
]

export default function GenerateQuizPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectedDoc = params.get('doc') || ''

  const [form, setForm] = useState({
    document_id: preselectedDoc,
    topic: '',
    difficulty: 'medium',
    num_questions: 10,
    title: '',
    time_limit_minutes: 0,
  })

  const { data: docsData } = useQuery({
    queryKey: ['documents', 'processed'],
    queryFn: () => documentService.list({ status: 'processed' }).then(r => r.data),
  })

  const generateMut = useMutation({
    mutationFn: quizService.generate,
    onSuccess: (res) => {
      toast.success(`Quiz generated with ${res.data.quiz.total_questions} questions!`)
      navigate(`/quizzes/${res.data.quiz.id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Generation failed. Try again.')
    },
  })

  const docs = docsData?.results || []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.document_id) { toast.error('Please select a document.'); return }
    if (!form.topic.trim()) { toast.error('Please enter a topic.'); return }
    generateMut.mutate(form)
  }

  // Fixed placeholder arbitrary value syntax to standard placeholder:text-[color]
  const inputClass = "w-full bg-[#0A0B0D] border border-[#24272E] rounded-lg px-4 py-3 text-sm text-[#ECEAE6] focus:outline-none focus:border-[#F5B942]/50 focus:ring-1 focus:ring-[#F5B942]/50 transition-all f-body placeholder:text-[#4A4E56]"
  const labelClass = "text-[11px] f-mono text-[#8B8F97] uppercase tracking-wider mb-3 flex items-center gap-2 block"

  return (
    <div className="space-y-10 animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D] pb-10">
      {FONTS}

      {/* ── HEADER ── */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl f-display font-semibold text-[#ECEAE6] mb-3">
          Generate Quiz
        </h1>
        <p className="text-base text-[#8B8F97] leading-relaxed max-w-md f-body">
          Let AI create a targeted quiz from your study material. Customize the focus, length, and difficulty below.
        </p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Document select */}
          <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6 md:p-8">
            <label className={labelClass}>
              <FileText className="w-4 h-4 text-[#F5B942]" /> Select Document
            </label>
            {docs.length === 0 ? (
              <div className="bg-[#0A0B0D] border border-[#24272E] border-dashed rounded-lg p-6 text-center">
                <p className="text-sm text-[#8B8F97] f-body mb-3">
                  No processed documents available.
                </p>
                <a href="/documents/upload" className="inline-flex items-center gap-1.5 text-sm f-mono text-[#F5B942] hover:text-[#f0aa26] transition-colors">
                  Upload a PDF first <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={form.document_id}
                  onChange={(e) => setForm({ ...form, document_id: e.target.value })}
                  className={`${inputClass} appearance-none pr-10 cursor-pointer ${!form.document_id ? 'text-[#4A4E56]' : 'text-[#ECEAE6]'}`}
                >
                  <option value="" disabled className="text-[#4A4E56]">— Choose a document —</option>
                  {docs.map((d) => (
                    <option key={d.id} value={d.id} className="text-[#ECEAE6]">{d.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8F97] pointer-events-none" />
              </div>
            )}
          </div>

          {/* Topic & title */}
          <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <label className={labelClass}>
                <Brain className="w-4 h-4 text-[#F5B942]" /> Quiz Topic
              </label>
              <input
                type="text" value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. Machine Learning algorithms, World War 2, Python OOP…"
                className={inputClass}
                required
              />
              <p className="text-xs text-[#8B8F97] mt-2 f-body opacity-80">
                Be specific — the AI retrieves relevant sections from your document based on this prompt.
              </p>
            </div>

            <div>
              <label className={labelClass}>Quiz Title (optional)</label>
              <input
                type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Leave blank to auto-generate"
                className={inputClass}
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6 md:p-8">
            <label className={labelClass}>Difficulty Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {DIFFICULTIES.map((d) => {
                const isSelected = form.difficulty === d.value;
                return (
                  <button
                    key={d.value} type="button"
                    onClick={() => setForm({ ...form, difficulty: d.value })}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 group ${
                      isSelected 
                        ? `${d.activeClass} border-opacity-100 shadow-sm` 
                        : 'border-[#24272E] bg-[#0A0B0D] hover:border-[#F5B942]/40 hover:bg-[#181B21]'
                    }`}
                  >
                    <p className={`font-semibold text-base f-display mb-1 ${isSelected ? '' : 'text-[#ECEAE6] group-hover:text-[#F5B942] transition-colors'}`}>
                      {d.label}
                    </p>
                    <p className={`text-xs f-body ${isSelected ? 'opacity-90' : 'text-[#8B8F97]'}`}>
                      {d.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Settings row */}
          {/* Settings row */}
          <div className="bg-[#14161B] border border-[#24272E] rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Number of Questions</label>
              <input
                type="number" min={5} max={20} value={form.num_questions}
                onChange={(e) => setForm({ 
                  ...form, 
                  num_questions: e.target.value === '' ? '' : Number(e.target.value) 
                })}
                className={inputClass}
              />
              <p className="text-xs text-[#8B8F97] mt-2 f-mono opacity-80">Range: 5 – 20</p>
            </div>
            <div>
              <label className={labelClass}>Time Limit (minutes)</label>
              <input
                type="number" min={0} max={180} value={form.time_limit_minutes}
                onChange={(e) => setForm({ 
                  ...form, 
                  time_limit_minutes: e.target.value === '' ? '' : Number(e.target.value) 
                })}
                className={inputClass}
              />
              <p className="text-xs text-[#8B8F97] mt-2 f-mono opacity-80">0 = no limit</p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={generateMut.isPending || !form.document_id || !form.topic.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F5B942] hover:bg-[#f0aa26]
                         text-[#0A0B0D] f-body font-semibold text-base px-6 py-4 rounded-xl transition-all 
                         shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:shadow-none disabled:hover:bg-[#F5B942]"
            >
              {generateMut.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI is generating your quiz…
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Quiz
                </>
              )}
            </button>
            
            {generateMut.isPending && (
              <p className="text-center text-xs text-[#F5B942] f-mono mt-4 animate-pulse">
                This takes 10–20 seconds. Hang tight!
              </p>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}