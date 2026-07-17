import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Brain, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Spinner from '../../components/common/Spinner'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

function Field({
  name,
  label,
  type = 'text',
  placeholder,
  half,
  form,
  errors,
  handleChange,
  showPw,
  setShowPw,
}) {
  const isPassword = name === 'password' || name === 'password_confirm'

  return (
    <div className={half ? '' : 'col-span-2'}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B8F97] f-mono mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={isPassword && !showPw ? 'password' : (type === 'password' ? 'text' : type)}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-[#0A0B0D] text-[#ECEAE6] border f-body text-sm px-4 py-3 rounded-xl transition-all outline-none placeholder-[#4A4E56] ${
            errors[name] 
              ? 'border-rose-400/50 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20' 
              : 'border-[#24272E] focus:border-[#F5B942]/60 focus:ring-1 focus:ring-[#F5B942]/20'
          } ${isPassword ? 'pr-12' : ''}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4E56] hover:text-[#ECEAE6] transition-colors"
          >
            {showPw ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        )}
      </div>

      {errors[name] && (
        <p className="text-xs text-rose-400 mt-1.5 f-body">
          {errors[name]}
        </p>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  })

  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validate = () => {
    const e = {}

    if (!form.username.trim()) {
      e.username = 'Username is required'
    }

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Valid email required'
    }

    if (!form.password || form.password.length < 8) {
      e.password = 'Password must be at least 8 characters'
    }

    if (form.password !== form.password_confirm) {
      e.password_confirm = 'Passwords do not match'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    const result = await register(form)

    if (result.success) {
      navigate('/home')
    } else if (result.errors) {
      setErrors(result.errors)
    }
  }

  const btnPrimary = "w-full py-3 rounded-xl bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] f-body font-semibold text-sm transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:pointer-events-none"
  const btnGhost = "flex items-center gap-2 px-4 py-2 bg-[#14161B]/80 backdrop-blur-md border border-[#24272E] rounded-xl hover:border-[#F5B942]/40 transition-colors text-[#8B8F97] hover:text-[#ECEAE6] text-sm font-medium shadow-md shadow-black/20"

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D] px-4 py-12 relative overflow-hidden text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D]">
      {FONTS}

      {/* Decorative Blur Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#F5B942]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/LandingPage" className={btnGhost}>
          Home
        </Link>
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <div className="bg-[#14161B] border border-[#24272E] shadow-2xl shadow-black/40 rounded-2xl p-8 md:p-10">
          
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#0A0B0D] border border-[#24272E] rounded-xl flex items-center justify-center mx-auto shadow-inner mb-4">
              <Brain className="w-7 h-7 text-[#F5B942]" />
            </div>

            <h1 className="f-display text-2xl md:text-3xl font-semibold text-[#ECEAE6] mb-2">
              Create Account
            </h1>

            <p className="text-[#8B8F97] text-sm f-body">
              Start your AI-powered learning journey
            </p>

            <p className="text-sm text-[#4A4E56] mt-3 f-body">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#F5B942] font-semibold hover:text-[#f0aa26] transition-colors ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-5">
              <Field
                name="first_name"
                label="First Name"
                placeholder="John"
                half
                form={form}
                errors={errors}
                handleChange={handleChange}
                showPw={showPw}
                setShowPw={setShowPw}
              />

              <Field
                name="last_name"
                label="Last Name"
                placeholder="Doe"
                half
                form={form}
                errors={errors}
                handleChange={handleChange}
                showPw={showPw}
                setShowPw={setShowPw}
              />

              <Field
                name="username"
                label="Username"
                placeholder="johndoe"
                form={form}
                errors={errors}
                handleChange={handleChange}
                showPw={showPw}
                setShowPw={setShowPw}
              />

              <Field
                name="email"
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                form={form}
                errors={errors}
                handleChange={handleChange}
                showPw={showPw}
                setShowPw={setShowPw}
              />

              <Field
                name="password"
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                form={form}
                errors={errors}
                handleChange={handleChange}
                showPw={showPw}
                setShowPw={setShowPw}
              />

              <Field
                name="password_confirm"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                form={form}
                errors={errors}
                handleChange={handleChange}
                showPw={showPw}
                setShowPw={setShowPw}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={btnPrimary}
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Terms Footer */}
          <p className="text-center text-[11px] text-[#4A4E56] f-mono uppercase tracking-wider mt-6">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}