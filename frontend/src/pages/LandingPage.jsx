import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Brain, Zap, FileText, BarChart2, Trophy, Shield,
  ArrowRight, Check, Star, Sparkles, Target, Clock, 
  TrendingUp, Users, BookOpen, Award
} from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'Upload Any PDF',
    desc: 'Upload your study material, textbooks, or notes. Our system extracts and understands the content automatically.',
  },
  {
    icon: Brain,
    title: 'AI Quiz Generation',
    desc: 'Gemini AI reads your document and generates targeted MCQs at your chosen difficulty level in seconds.',
  },
  {
    icon: Clock,
    title: 'Timed Practice',
    desc: 'Set custom time limits to simulate real exam conditions. Track how fast you answer each question.',
  },
  {
    icon: BarChart2,
    title: 'Deep Analytics',
    desc: 'Track accuracy trends, identify weak topics, and measure improvement over time with rich charts.',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    desc: 'Compete with other learners, earn points for every correct answer, and climb the global rankings.',
  },
  {
    icon: Target,
    title: 'Smart Retrieval',
    desc: 'RAG pipeline finds the most relevant sections of your document for each quiz topic automatically.',
  },
]

const STEPS = [
  { step: '01', title: 'Upload your PDF', desc: 'Drop in any study material — textbooks, notes, articles.' },
  { step: '02', title: 'Choose a topic', desc: 'Tell the AI what topic to focus on and pick your difficulty.' },
  { step: '03', title: 'Take the quiz', desc: 'Answer AI-generated MCQs with a timer if you want.' },
  { step: '04', title: 'Review & improve', desc: 'See detailed explanations and track your progress over time.' },
]

const STATS = [
  { value: '10x', label: 'Faster than manual flashcards' },
  { value: '94%', label: 'Users improved their scores' },
  { value: '50K+', label: 'Quizzes generated' },
  { value: '200+', label: 'Topics supported' },
]

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'Medical Student',
    text: 'I uploaded my anatomy notes and got 10 perfect MCQs in 15 seconds. This is insane.',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    role: 'Software Engineer',
    text: 'Used it to prep for system design interviews. The AI actually understands context, not just keywords.',
    rating: 5,
  },
  {
    name: 'Ananya K.',
    role: 'UPSC Aspirant',
    text: 'Finally a tool that turns my 200-page PDFs into focused practice. My accuracy went from 60% to 84%.',
    rating: 5,
  },
]

function Navbar() {
  const { isAuthenticated } = useAuth()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5 text-[#0a0a0a]" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">
            Quiz<span className="text-lime-400">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-lime-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-lime-400 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-lime-400 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/home" className="px-4 py-2 bg-lime-400 hover:bg-lime-500 text-[#0a0a0a] font-semibold rounded-md flex items-center gap-2 transition-colors text-sm">
              Go to App <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-zinc-300 hover:text-white text-sm font-medium">Sign in</Link>
              <Link to="/register" className="px-4 py-2 bg-lime-400 hover:bg-lime-500 text-[#0a0a0a] font-semibold rounded-md flex items-center gap-2 transition-colors text-sm">
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
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-lime-400 selection:text-black">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="pt-40 pb-32 px-5 relative overflow-hidden bg-[#0a0a0a]">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-lime-400 text-xs font-medium mb-8 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered quiz generation
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Turn any PDF into a{' '}
            <span className="text-lime-400 relative">
              smart quiz
            </span>
            <br />in seconds.
          </h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your study material. Choose a topic. Let AI generate targeted MCQ quizzes
            with explanations. Track your progress and ace every exam.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link to="/register" className="px-8 py-3.5 bg-lime-400 hover:bg-lime-500 text-[#0a0a0a] font-semibold rounded-md flex items-center justify-center gap-2 transition-colors text-base">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="px-8 py-3.5 bg-[#111111] hover:bg-zinc-800 border border-zinc-800 text-white font-semibold rounded-md flex items-center justify-center transition-colors text-base">
              See how it works
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-zinc-500 flex-wrap">
            {['No credit card required', 'Free forever plan', 'Setup in 2 minutes'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-lime-400" strokeWidth={3} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-16 bg-[#111111] border-y border-zinc-800">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-lime-400 mb-1">{s.value}</p>
              <p className="text-zinc-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-5 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base">
              Transform unstructured study material into a powerful learning experience with our advanced features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#111111] p-8 rounded-xl border border-zinc-800 hover:border-lime-400/30 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-lime-400/10 flex items-center justify-center mb-6 group-hover:bg-lime-400/20 transition-colors">
                  <f.icon className="w-5 h-5 text-lime-400" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-3">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-5 bg-[#111111] border-y border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              From PDF to quiz in 4 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-[1px] bg-zinc-800 z-0" />
            
            {STEPS.map((s) => (
              <div key={s.step} className="relative z-10 bg-[#0a0a0a] p-6 rounded-xl border border-zinc-800 text-center">
                <div className="w-16 h-16 rounded-lg bg-[#111111] border border-lime-400/30 flex items-center justify-center mx-auto mb-5">
                  <span className="font-display font-bold text-lime-400 text-lg">{s.step}</span>
                </div>
                <h3 className="font-display font-semibold text-white mb-2 text-base">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 px-5 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Why Choose QuizAI?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#111111] p-8 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-lime-400 fill-lime-400" />
                    ))}
                  </div>
                  <p className="text-zinc-300 leading-relaxed mb-8 text-sm">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <span className="font-bold text-white text-sm">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-lime-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-[#111111] border-t border-zinc-800 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 bg-lime-400 rounded-lg flex items-center justify-center mx-auto mb-8">
            <Zap className="w-6 h-6 text-[#0a0a0a]" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Let us Bring your Ideas to Life in the Digital World.
          </h2>
          <p className="text-zinc-400 mb-10 text-base max-w-xl mx-auto">
            Join thousands of students and professionals who use QuizAI to prepare faster and score higher.
          </p>
          <div className="flex justify-center">
             <Link to="/register" className="px-8 py-3.5 bg-lime-400 hover:bg-lime-500 text-[#0a0a0a] font-bold rounded-md transition-colors text-base">
               Start Project
             </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] border-t border-zinc-800 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-lime-400 rounded flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#0a0a0a]" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-white text-lg">
              Quiz<span className="text-lime-400">AI</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-400">
            <a href="#" className="hover:text-lime-400 transition-colors">Home</a>
            <a href="#features" className="hover:text-lime-400 transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-lime-400 transition-colors">Process</a>
            <a href="#pricing" className="hover:text-lime-400 transition-colors">About</a>
            <a href="#" className="hover:text-lime-400 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
             © 2026 QuizAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}