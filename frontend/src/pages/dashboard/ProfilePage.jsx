import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Shield, Flame, Trophy, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    bio:        user?.bio        || '',
    username:   user?.username   || '',
  })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', new_password_confirm: '' })
  const [pwErrors, setPwErrors] = useState({})

  const updateMut = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => { refreshUser(); toast.success('Profile updated!') },
    onError: () => toast.error('Update failed.'),
  })

  const pwMut = useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed!')
      setPwForm({ old_password: '', new_password: '', new_password_confirm: '' })
    },
    onError: (err) => {
      const errs = err.response?.data?.errors || {}
      setPwErrors(errs)
      toast.error(err.response?.data?.message || 'Password change failed.')
    },
  })

  const handleUpdate = (e) => {
    e.preventDefault()
    updateMut.mutate(form)
  }

  const handlePw = (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.new_password_confirm) {
      setPwErrors({ new_password_confirm: ['Passwords do not match.'] })
      return
    }
    setPwErrors({})
    pwMut.mutate(pwForm)
  }

  const btnPrimary = "w-full sm:w-auto px-6 py-3.5 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] font-semibold rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] flex items-center justify-center gap-2 disabled:opacity-70 f-body text-sm"
  const btnSecondary = "w-full px-6 py-3.5 bg-[#0A0B0D] text-[#ECEAE6] border border-[#24272E] hover:border-[#F5B942]/50 hover:text-[#F5B942] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 f-body text-sm"
  const inputClass = "w-full px-4 py-3 rounded-xl bg-[#0A0B0D] border border-[#24272E] text-[#ECEAE6] f-body text-sm placeholder-[#4A4E56] focus:outline-none focus:border-[#F5B942]/60 focus:ring-1 focus:ring-[#F5B942]/20 transition-all"
  const labelClass = "block text-[11px] font-semibold text-[#8B8F97] f-mono uppercase tracking-wider mb-2"

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D]">
      {FONTS}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl f-display font-semibold text-[#ECEAE6] mb-2">Profile Settings</h1>
        <p className="text-[#8B8F97] f-body">Manage your account information and security preferences.</p>
      </div>

      {/* Avatar + stats */}
      <div className="bg-[#14161B] border border-[#24272E] p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-lg shadow-black/20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B942]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="w-20 h-20 bg-[#F5B942] rounded-2xl flex items-center justify-center text-[#0A0B0D] f-display font-bold text-3xl shadow-[0_0_20px_-5px_rgba(245,185,66,0.4)] flex-shrink-0 relative z-10">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1 min-w-0 text-center sm:text-left relative z-10">
          <h2 className="f-display text-2xl font-semibold text-[#ECEAE6] mb-1">{user?.username || 'User'}</h2>
          <p className="text-[#8B8F97] text-sm truncate f-mono">{user?.email}</p>
        </div>
        
        <div className="flex gap-6 sm:gap-8 mt-4 sm:mt-0 relative z-10 bg-[#0A0B0D] px-6 py-4 rounded-xl border border-[#24272E]">
          <div className="text-center">
            <p className="f-display font-bold text-2xl text-[#ECEAE6] flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-5 h-5 text-[#F5B942]" />{user?.total_points || 0}
            </p>
            <p className="text-[10px] text-[#8B8F97] uppercase tracking-wider font-semibold f-mono">Points</p>
          </div>
          <div className="w-px bg-[#24272E]"></div>
          <div className="text-center">
            <p className="f-display font-bold text-2xl text-[#ECEAE6] flex items-center justify-center gap-1.5 mb-1">
              <Flame className="w-5 h-5 text-rose-400" />{user?.streak_days || 0}
            </p>
            <p className="text-[10px] text-[#8B8F97] uppercase tracking-wider font-semibold f-mono">Day Streak</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left Column: Personal Info */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-[#14161B] border border-[#24272E] p-8 rounded-2xl shadow-lg shadow-black/10">
            <h3 className="f-display font-semibold text-lg text-[#ECEAE6] flex items-center gap-3 mb-6 pb-4 border-b border-[#24272E]/70">
              <div className="w-8 h-8 rounded-lg bg-[#0A0B0D] border border-[#24272E] flex items-center justify-center shadow-inner">
                <User className="w-4 h-4 text-[#F5B942]" />
              </div>
              Personal Information
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {[
                  { name: 'first_name', label: 'First Name' },
                  { name: 'last_name',  label: 'Last Name' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className={labelClass}>{label}</label>
                    <input
                      type="text" value={form[name]}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Username</label>
                <input
                  type="text" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#24272E]/30 border border-[#24272E]">
                  <Mail className="w-4.5 h-4.5 text-[#4A4E56]" />
                  <span className="text-sm text-[#8B8F97] f-body">{user?.email}</span>
                  <span className="ml-auto px-2.5 py-1 bg-[#24272E] text-[#8B8F97] text-[10px] font-bold uppercase tracking-wider rounded f-mono">Cannot change</span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  value={form.bio} rows={4}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about your learning goals..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={updateMut.isPending} 
                  className={btnPrimary}
                >
                  {updateMut.isPending ? <Spinner size="sm" color="text-[#0A0B0D]" /> : <><Save className="w-4.5 h-4.5" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#14161B] border border-[#24272E] p-8 rounded-2xl shadow-lg shadow-black/10">
            <h3 className="f-display font-semibold text-lg text-[#ECEAE6] flex items-center gap-3 mb-6 pb-4 border-b border-[#24272E]/70">
              <div className="w-8 h-8 rounded-lg bg-[#0A0B0D] border border-[#24272E] flex items-center justify-center shadow-inner">
                <Shield className="w-4 h-4 text-[#F5B942]" />
              </div>
              Security
            </h3>
            
            <form onSubmit={handlePw} className="space-y-5">
              {[
                { name: 'old_password', label: 'Current Password', placeholder: '••••••••' },
                { name: 'new_password', label: 'New Password', placeholder: '••••••••' },
                { name: 'new_password_confirm', label: 'Confirm New Password', placeholder: '••••••••' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="password" 
                    value={pwForm[name]}
                    placeholder={placeholder}
                    onChange={(e) => setPwForm({ ...pwForm, [name]: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0A0B0D] text-[#ECEAE6] f-body text-sm placeholder-[#4A4E56] focus:outline-none transition-all border ${
                      pwErrors[name] 
                        ? 'border-rose-400/50 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20' 
                        : 'border-[#24272E] focus:border-[#F5B942]/60 focus:ring-1 focus:ring-[#F5B942]/20'
                    }`}
                  />
                  {pwErrors[name] && (
                    <p className="text-xs f-body text-rose-400 mt-1.5">
                      {Array.isArray(pwErrors[name]) ? pwErrors[name][0] : pwErrors[name]}
                    </p>
                  )}
                </div>
              ))}
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={pwMut.isPending} 
                  className={btnSecondary}
                >
                  {pwMut.isPending ? <Spinner size="sm" color="text-[#F5B942]" /> : <><Shield className="w-4.5 h-4.5" /> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}