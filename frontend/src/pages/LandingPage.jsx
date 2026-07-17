import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Brain, FileText, Target, ArrowRight, Check, Sparkles
} from 'lucide-react'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .anim-fadeup { animation: fadeUp 0.5s ease forwards; }
    @media (prefers-reduced-motion: reduce) {
      .anim-fadeup { animation: none; }
    }
  `}</style>
)

const STATS = [
  { value: '10×', label: 'faster than manual flashcards' },
  { value: '94%', label: 'of users raised their score' },
  { value: '50K+', label: 'quizzes generated' },
  { value: '200+', label: 'topics covered' },
]

const STEPS = [
  { 
    icon: FileText, 
    title: '1. Upload your PDF', 
    desc: 'Textbooks, lecture notes, or research papers — drop them in and the engine indexes the content instantly.' 
  },
  { 
    icon: Target, 
    title: '2. Set the parameters', 
    desc: 'Pick a specific topic and difficulty. The model writes MCQs from your actual material, not generic trivia.' 
  },
  { 
    icon: Brain, 
    title: '3. Test & Learn', 
    desc: 'Answer AI-written questions. Every attempt is logged by topic so your weak areas show up as a clear pattern.' 
  },
]

// ── Live quiz demo used in the hero ──────────────────────────
const DEMO_QUESTIONS = [
  {
    q: 'What does RAG stand for in this context?',
    options: [
      { label: 'A', text: 'Random Answer Generation', correct: false },
      { label: 'B', text: 'Retrieval-Augmented Generation', correct: true },
      { label: 'C', text: 'Ranked Answer Grading', correct: false },
      { label: 'D', text: 'Recursive Answer Graph', correct: false },
    ],
  },
  {
    q: 'Mitochondria are best described as the:',
    options: [
      { label: 'A', text: 'Cell\u2019s storage unit', correct: false },
      { label: 'B', text: 'Cell\u2019s powerhouse', correct: true },
      { label: 'C', text: 'Cell\u2019s messenger', correct: false },
      { label: 'D', text: 'Cell\u2019s boundary wall', correct: false },
    ],
  },
  {
    q: 'In a binary search tree, the left child is always:',
    options: [
      { label: 'A', text: 'Greater than the parent', correct: false },
      { label: 'B', text: 'Equal to the parent', correct: false },
      { label: 'C', text: 'Less than the parent', correct: true },
      { label: 'D', text: 'Unrelated to the parent', correct: false },
    ],
  },
]

function LiveQuizCard() {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const revealTimer = setTimeout(() => setRevealed(true), 1400)
    const nextTimer = setTimeout(() => {
      setRevealed(false)
      setIndex((i) => (i + 1) % DEMO_QUESTIONS.length)
    }, 4200)
    return () => {
      clearTimeout(revealTimer)
      clearTimeout(nextTimer)
    }
  }, [index])

  const current = DEMO_QUESTIONS[index]

  return (
    <div className="w-full max-w-md bg-[#14161B] border border-[#24272E] rounded-2xl p-6 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between mb-5">
        <span className="f-mono text-[11px] uppercase tracking-wider text-[#8B8F97]">
          Question {index + 1} / {DEMO_QUESTIONS.length}
        </span>
        <span className="f-mono text-[11px] px-2 py-1 rounded bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/20">
          generated in 2.4s
        </span>
      </div>

      <p key={index} className="f-body text-[#ECEAE6] text-base leading-snug mb-5 anim-fadeup min-h-[3rem]">
        {current.q}
      </p>

      <div className="space-y-2.5">
        {current.options.map((opt) => {
          const showCorrect = revealed && opt.correct
          return (
            <div
              key={opt.label}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-colors duration-300 ${showCorrect
                ? 'border-[#5EEAD4]/50 bg-[#5EEAD4]/[0.08]'
                : 'border-[#24272E] bg-[#0A0B0D]/40'
                }`}
            >
              <span
                className={`f-mono w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-medium shrink-0 border transition-colors duration-300 ${showCorrect
                  ? 'border-[#5EEAD4] text-[#5EEAD4]'
                  : 'border-[#3A3E46] text-[#8B8F97]'
                  }`}
              >
                {opt.label}
              </span>
              <span className={`f-body flex-1 ${showCorrect ? 'text-[#ECEAE6]' : 'text-[#8B8F97]'}`}>
                {opt.text}
              </span>
              {showCorrect && <Check className="w-4 h-4 text-[#5EEAD4] shrink-0" strokeWidth={2.5} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Navbar() {
  const { isAuthenticated } = useAuth()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0B0D]/90 backdrop-blur-md border-b border-[#24272E]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-[#0A0B0D] border border-[#24272E] rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] group-hover:border-[#F5B942]/50 transition-colors flex-shrink-0">
            <Brain className="w-5 h-5 text-[#F5B942]" strokeWidth={2.5} />
          </div>
          <span className="f-display font-bold text-[#ECEAE6] text-xl tracking-tight mt-0.5">
            Quiz<span className="text-[#F5B942]">AI</span>
          </span>
        </Link>

        {/* Navigation links simplified to match a shorter landing page */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/home" className="px-4 py-2 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold rounded-md flex items-center gap-2 transition-colors text-sm">
              Go to app <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-[#ECEAE6]/80 hover:text-[#ECEAE6] text-sm f-body font-medium">Sign in</Link>
              <Link to="/register" className="px-4 py-2 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold rounded-md transition-colors text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D]">
      {FONTS}
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="pt-32 md:pt-40 pb-20 px-5 relative overflow-hidden min-h-[90vh] flex items-center">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#F5B942 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-14 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14161B] border border-[#24272E] text-[#F5B942] f-mono text-[11px] mb-7 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              pdf_in.study_out()
            </div>

            <h1 className="f-display text-4xl md:text-[3.25rem] font-semibold text-[#ECEAE6] leading-[1.08] mb-6">
              Your PDF just became
              <br />
              <span className="text-[#F5B942]">your hardest quiz.</span>
            </h1>

            <p className="f-body text-base md:text-lg text-[#8B8F97] max-w-md mb-9 leading-relaxed">
              Upload any document. Choose a topic and difficulty. Get exam-grade MCQs
              with explanations, timers, and analytics that show exactly where you're weak.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-9">
              <Link to="/register" className="px-7 py-3.5 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] text-base">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-6 f-mono text-[12px] text-[#8B8F97] flex-wrap">
              {['no card required', 'free tier', 'ready in 2 min'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#5EEAD4]" strokeWidth={3} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <LiveQuizCard />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-10 bg-[#14161B] border-y border-[#24272E]">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:border-l md:border-[#24272E] md:first:border-l-0 md:pl-6 md:first:pl-0">
              <p className="f-mono text-3xl font-semibold text-[#F5B942] mb-1">{s.value}</p>
              <p className="f-body text-[#8B8F97] text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPACT WORKFLOW & CTA ───────────────────────── */}
      <section className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="f-display text-3xl md:text-4xl font-semibold text-[#ECEAE6] mb-4">
              From document to graded insights.
            </h2>
            <p className="text-[#8B8F97] text-base max-w-xl mx-auto leading-relaxed">
              No more re-reading the same chapter. Build active recall systems from your actual material in under a minute.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {STEPS.map((step) => (
              <div key={step.title} className="bg-[#14161B] p-8 rounded-2xl border border-[#24272E] hover:border-[#F5B942]/30 transition-colors">
                <div className="w-12 h-12 bg-[#0A0B0D] border border-[#24272E] rounded-xl flex items-center justify-center mb-6 shadow-inner">
                  <step.icon className="w-6 h-6 text-[#F5B942]" />
                </div>
                <h3 className="f-display font-semibold text-lg text-[#ECEAE6] mb-3">{step.title}</h3>
                <p className="text-[#8B8F97] leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#14161B] border border-[#24272E] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B942]/5 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="f-display text-2xl md:text-3xl font-semibold text-[#ECEAE6] mb-4 relative z-10">
              Ready to stop passively reading?
            </h3>
            <p className="text-[#8B8F97] mb-8 text-base max-w-lg mx-auto relative z-10">
              Your first AI-generated practice exam is free. No credit card required.
            </p>
            <Link to="/register" className="inline-flex px-8 py-3.5 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] text-base relative z-10">
              Create your first quiz <ArrowRight className="w-4 h-4 ml-2 mt-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[#24272E] py-10 px-5 bg-[#0A0B0D]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0A0B0D] border border-[#24272E] rounded-lg flex items-center justify-center shadow-inner">
              <Brain className="w-4 h-4 text-[#F5B942]" strokeWidth={2.5} />
            </div>
            <span className="f-display font-bold text-[#ECEAE6] text-lg tracking-tight mt-0.5">
              Quiz<span className="text-[#F5B942]">AI</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 f-mono text-[12px] text-[#8B8F97]">
            <Link to="/contact" className="hover:text-[#F5B942] transition-colors">contact</Link>
            <Link to="/privacy" className="hover:text-[#F5B942] transition-colors">privacy_policy</Link>
            <Link to="/terms" className="hover:text-[#F5B942] transition-colors">terms_of_service</Link>
          </div>

          <div className="f-mono text-[11px] text-[#8B8F97]/70">
            © 2026 QuizAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}