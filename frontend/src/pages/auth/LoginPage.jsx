import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Spinner from '../../components/common/Spinner'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/home'

  const [form, setForm] = useState({
    email: 'Testpro@gmail.com',
    password: 'Testpro123@$',
  })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await login(form.email, form.password)
    if (result.success) navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D] px-4 f-body selection:bg-[#F5B942] selection:text-[#0A0B0D] relative">
      {FONTS}

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#F5B942]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#5EEAD4]/[0.03] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#F5B942 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
      </div>

      {/* Home button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/landingPage"
          className="flex items-center gap-2 px-4 py-2 bg-[#14161B] border border-[#24272E] rounded-lg hover:border-[#F5B942]/50 hover:text-[#F5B942] transition-colors duration-200 text-[#8B8F97] f-mono text-[13px]"
        >
          ← home
        </Link>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-[#14161B] border border-[#24272E] shadow-2xl shadow-black/40 rounded-2xl p-8 sm:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full border-2 border-[#F5B942] flex items-center justify-center mb-5">
              <span className="f-mono text-[#F5B942] text-xl font-semibold">B</span>
            </div>

            <h1 className="text-3xl f-display font-semibold text-[#ECEAE6]">
              Welcome back
            </h1>

            <p className="text-[#8B8F97] text-sm mt-2 text-center f-body">
              Sign in to pick up where your last quiz left off
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block f-mono text-[11px] uppercase tracking-wider text-[#8B8F97] mb-2">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border bg-[#0A0B0D] text-[#ECEAE6] placeholder-[#4A4E56] f-body focus:outline-none focus:ring-1 transition-colors ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#24272E] focus:border-[#F5B942] focus:ring-[#F5B942]'
                }`}
              />

              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 f-mono">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="f-mono text-[11px] uppercase tracking-wider text-[#8B8F97]">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[12px] f-mono text-[#8B8F97] hover:text-[#F5B942] transition-colors"
                >
                  forgot?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border bg-[#0A0B0D] text-[#ECEAE6] placeholder-[#4A4E56] f-body focus:outline-none focus:ring-1 transition-colors ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#24272E] focus:border-[#F5B942] focus:ring-[#F5B942]'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8F97] hover:text-[#ECEAE6] transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 f-mono">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-lg bg-[#F5B942] hover:bg-[#f0aa26] disabled:opacity-70 disabled:hover:bg-[#F5B942] text-[#0A0B0D] f-body font-semibold transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)]"
            >
              {loading ? (
                <Spinner size="sm" color="text-[#0A0B0D]" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-8 text-center">
            <p className="text-[#8B8F97] text-sm f-body">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#F5B942] font-semibold hover:text-[#f0aa26] transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-[#24272E] pt-6">
            <p className="text-center f-mono text-[11px] text-[#8B8F97]/70">
              by signing in you agree to our terms and privacy policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}