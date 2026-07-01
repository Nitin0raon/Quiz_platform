import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Brain, FileText, Clock, BarChart2, Trophy, Target,
  ArrowRight, Check, Star, Sparkles, X
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

const FEATURES = [
  {
    icon: FileText,
    title: 'Feed it any PDF',
    desc: 'Textbook chapters, lecture notes, research papers — drop them in and the engine reads and indexes the content in seconds.',
  },
  {
    icon: Brain,
    title: 'Targeted question generation',
    desc: 'Pick a topic and difficulty. The model writes MCQs from the actual material, not generic trivia.',
  },
  {
    icon: Clock,
    title: 'Timed, exam-style rounds',
    desc: 'Set a clock per question or per set to build real exam pressure instead of untimed flashcard drilling.',
  },
  {
    icon: BarChart2,
    title: 'See where you actually lose points',
    desc: 'Every attempt is logged by topic, so weak areas show up as a pattern, not a guess.',
  },
  {
    icon: Trophy,
    title: 'Global leaderboard',
    desc: 'Points for accuracy and speed. Compare your rank against everyone studying the same material.',
  },
  {
    icon: Target,
    title: 'Retrieval that finds the right passage',
    desc: 'A retrieval pipeline pulls the exact section relevant to your chosen topic before writing a single question.',
  },
]

const STEPS = [
  { mark: 'A', title: 'Upload your PDF', desc: 'Textbooks, notes, articles — any document you\u2019re studying from.' },
  { mark: 'B', title: 'Set the topic & level', desc: 'Tell it what to focus on and how hard to make it.' },
  { mark: 'C', title: 'Sit the quiz', desc: 'Answer AI-written MCQs, timer on if you want the pressure.' },
  { mark: 'D', title: 'Read the breakdown', desc: 'Every answer comes with an explanation and a running accuracy trend.' },
]

const STATS = [
  { value: '10×', label: 'faster than manual flashcards' },
  { value: '94%', label: 'of users raised their score' },
  { value: '50K+', label: 'quizzes generated' },
  { value: '200+', label: 'topics covered' },
]

const RESULTS = [
  {
    name: 'Priya S.',
    role: 'Medical student',
    text: 'I uploaded my anatomy notes and had ten solid MCQs back in fifteen seconds. Cut my prep time in half.',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    role: 'Software engineer',
    text: 'Used it for system design interview prep. It actually reasons about the document instead of matching keywords.',
    rating: 5,
  },
  {
    name: 'Ananya K.',
    role: 'UPSC aspirant',
    text: 'It turned a 200-page PDF into focused practice sets. My accuracy went from 60% to 84% in three weeks.',
    rating: 5,
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-colors duration-300 ${
                showCorrect
                  ? 'border-[#5EEAD4]/50 bg-[#5EEAD4]/[0.08]'
                  : 'border-[#24272E] bg-[#0A0B0D]/40'
              }`}
            >
              <span
                className={`f-mono w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-medium shrink-0 border transition-colors duration-300 ${
                  showCorrect
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
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 border-[#F5B942] flex items-center justify-center">
            <span className="f-mono text-[#F5B942] text-xs font-semibold">B</span>
          </div>
          <span className="f-display font-semibold text-[#ECEAE6] text-lg">
            Quiz<span className="text-[#F5B942]">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 f-mono text-[13px] text-[#8B8F97]">
          <a href="#features" className="hover:text-[#F5B942] transition-colors">features</a>
          <a href="#how-it-works" className="hover:text-[#F5B942] transition-colors">how_it_works</a>
          <a href="#results" className="hover:text-[#F5B942] transition-colors">results</a>
        </div>

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
      <section className="pt-40 pb-28 px-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#F5B942 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-14 items-center">
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
              <Link to="/register" className="px-7 py-3.5 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold rounded-md flex items-center justify-center gap-2 transition-colors text-base">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="px-7 py-3.5 bg-transparent hover:bg-[#14161B] border border-[#24272E] text-[#ECEAE6] f-body font-medium rounded-md flex items-center justify-center transition-colors text-base">
                See how it works
              </a>
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
      <section className="py-14 bg-[#0E1013] border-y border-[#24272E]">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:border-l md:border-[#24272E] md:first:border-l-0 md:pl-6 md:first:pl-0">
              <p className="f-mono text-3xl font-semibold text-[#F5B942] mb-1">{s.value}</p>
              <p className="f-body text-[#8B8F97] text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <p className="f-mono text-[11px] uppercase tracking-wider text-[#F5B942] mb-3">what it does</p>
            <h2 className="f-display text-3xl md:text-4xl font-semibold text-[#ECEAE6] mb-4">
              Built to study from, not just around
            </h2>
            <p className="text-[#8B8F97] text-base leading-relaxed">
              Every feature exists to close the gap between reading material and being tested on it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#14161B] p-7 rounded-xl border border-[#24272E] hover:border-[#F5B942]/30 transition-colors group">
                <div className="w-10 h-10 rounded-lg border border-[#F5B942]/30 bg-[#F5B942]/[0.06] flex items-center justify-center mb-6 group-hover:bg-[#F5B942]/[0.12] transition-colors">
                  <f.icon className="w-4.5 h-4.5 text-[#F5B942]" />
                </div>
                <h3 className="f-display font-semibold text-base text-[#ECEAE6] mb-2.5">{f.title}</h3>
                <p className="text-[#8B8F97] leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-5 bg-[#0E1013] border-y border-[#24272E]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="f-mono text-[11px] uppercase tracking-wider text-[#F5B942] mb-3">the flow</p>
            <h2 className="f-display text-3xl md:text-4xl font-semibold text-[#ECEAE6]">
              From document to graded answer sheet
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-[1px] bg-[#24272E] z-0" />
            {STEPS.map((s) => (
              <div key={s.mark} className="relative z-10 bg-[#0A0B0D] p-6 rounded-xl border border-[#24272E] text-center">
                <div className="w-14 h-14 rounded-full bg-[#14161B] border-2 border-[#F5B942] flex items-center justify-center mx-auto mb-5">
                  <span className="f-mono font-semibold text-[#F5B942] text-lg">{s.mark}</span>
                </div>
                <h3 className="f-display font-semibold text-[#ECEAE6] mb-2 text-base">{s.title}</h3>
                <p className="text-sm text-[#8B8F97] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────────── */}
      <section id="results" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <p className="f-mono text-[11px] uppercase tracking-wider text-[#F5B942] mb-3">real scores</p>
            <h2 className="f-display text-3xl md:text-4xl font-semibold text-[#ECEAE6]">
              What changed after switching
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {RESULTS.map((t) => (
              <div key={t.name} className="bg-[#14161B] p-7 rounded-xl border border-[#24272E] flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#F5B942] fill-[#F5B942]" />
                    ))}
                  </div>
                  <p className="text-[#ECEAE6] leading-relaxed mb-7 text-sm">{t.text}</p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-[#24272E]">
                  <div className="w-9 h-9 rounded-full bg-[#0A0B0D] border border-[#24272E] flex items-center justify-center">
                    <span className="f-mono font-medium text-[#ECEAE6] text-xs">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="f-body font-medium text-[#ECEAE6] text-sm">{t.name}</p>
                    <p className="f-mono text-[11px] text-[#F5B942] mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-[#0E1013] border-t border-[#24272E] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="f-mono text-[11px] uppercase tracking-wider text-[#F5B942] mb-5">no more re-reading the same chapter</p>
          <h2 className="f-display text-3xl md:text-4xl font-semibold text-[#ECEAE6] mb-6 leading-tight">
            Upload one PDF. Find out what you don't know yet.
          </h2>
          <p className="text-[#8B8F97] mb-10 text-base max-w-lg mx-auto">
            Free to start, no card needed. Your first quiz is ready before your coffee is.
          </p>
          <Link to="/register" className="inline-flex px-8 py-3.5 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold rounded-md transition-colors text-base">
            Start your first quiz <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[#24272E] py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border-2 border-[#F5B942] flex items-center justify-center">
              <span className="f-mono text-[#F5B942] text-[10px] font-semibold">B</span>
            </div>
            <span className="f-display font-semibold text-[#ECEAE6] text-base">
              Quiz<span className="text-[#F5B942]">AI</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 f-mono text-[12px] text-[#8B8F97]">
            <a href="#features" className="hover:text-[#F5B942] transition-colors">features</a>
            <a href="#how-it-works" className="hover:text-[#F5B942] transition-colors">how_it_works</a>
            <a href="#results" className="hover:text-[#F5B942] transition-colors">results</a>
            <a href="#" className="hover:text-[#F5B942] transition-colors">contact</a>
          </div>

          <div className="f-mono text-[11px] text-[#8B8F97]/70">
            © 2026 quizai
          </div>
        </div>
      </footer>
    </div>
  )
}