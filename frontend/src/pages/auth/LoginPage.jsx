import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Brain, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Spinner from '../../components/common/Spinner'

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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans selection:bg-lime-400 selection:text-black">
      {/* Background Subtle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-zinc-600/5 rounded-full blur-[120px]" />
        {/* Subtle grid to match the tech agency vibe */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/landingPage"
          className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-zinc-800 rounded-lg shadow-sm hover:border-lime-400/50 hover:text-lime-400 transition-colors duration-200 text-zinc-400 font-medium text-sm"
        >
          ← Home
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-[#111111] border border-zinc-800 shadow-2xl rounded-2xl p-8 sm:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-lime-400 flex items-center justify-center shadow-lg mb-5">
              <Brain className="w-7 h-7 text-[#0a0a0a]" strokeWidth={2.5} />
            </div>

            <h1 className="text-3xl font-display font-bold text-white">
              Welcome Back
            </h1>

            <p className="text-zinc-400 text-sm mt-2 text-center">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border bg-[#0a0a0a] text-white placeholder-zinc-600 focus:outline-none focus:ring-1 transition-colors ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-800 focus:border-lime-400 focus:ring-lime-400'
                }`}
              />

              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-300">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-zinc-500 hover:text-lime-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border bg-[#0a0a0a] text-white placeholder-zinc-600 focus:outline-none focus:ring-1 transition-colors ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-zinc-800 focus:border-lime-400 focus:ring-lime-400'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-lg bg-lime-400 hover:bg-lime-500 disabled:opacity-70 disabled:hover:bg-lime-400 text-[#0a0a0a] font-bold transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_-3px_rgba(163,230,53,0.3)]"
            >
              {loading ? (
                <Spinner size="sm" color="text-[#0a0a0a]" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-lime-400 font-semibold hover:text-lime-300 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <p className="text-center text-xs text-zinc-600">
              By signing in, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}