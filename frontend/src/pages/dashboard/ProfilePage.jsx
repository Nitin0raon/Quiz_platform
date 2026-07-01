import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Shield, Flame, Trophy, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fade-in font-sans selection:bg-lime-400 selection:text-black text-zinc-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-zinc-400">Manage your account information and security preferences.</p>
      </div>

      {/* Avatar + stats */}
      <div className="bg-[#111111] border border-zinc-800 p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="w-20 h-20 bg-lime-400 rounded-2xl flex items-center justify-center text-[#0a0a0a] font-display font-bold text-3xl shadow-[0_0_20px_-5px_rgba(163,230,53,0.4)] flex-shrink-0 relative z-10">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1 min-w-0 text-center sm:text-left relative z-10">
          <h2 className="font-display text-2xl font-bold text-white mb-1">{user?.username || 'User'}</h2>
          <p className="text-zinc-400 text-sm truncate">{user?.email}</p>
        </div>
        
        <div className="flex gap-6 sm:gap-8 mt-4 sm:mt-0 relative z-10 bg-[#0a0a0a] px-6 py-4 rounded-xl border border-zinc-800">
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-white flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-5 h-5 text-lime-400" />{user?.total_points || 0}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Points</p>
          </div>
          <div className="w-px bg-zinc-800"></div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-white flex items-center justify-center gap-1.5 mb-1">
              <Flame className="w-5 h-5 text-orange-500" />{user?.streak_days || 0}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Day Streak</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left Column: Personal Info */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-[#111111] border border-zinc-800 p-8 rounded-2xl shadow-lg">
            <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-800/50">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-lime-400" />
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
                    <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
                    <input
                      type="text" value={form[name]}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Username</label>
                <input
                  type="text" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <Mail className="w-4.5 h-4.5 text-zinc-500" />
                  <span className="text-sm text-zinc-500">{user?.email}</span>
                  <span className="ml-auto px-2.5 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded">Cannot change</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
                <textarea
                  value={form.bio} rows={4}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about your learning goals..."
                  className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={updateMut.isPending} 
                  className="w-full sm:w-auto px-6 py-3.5 bg-lime-400 hover:bg-lime-500 text-[#0a0a0a] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {updateMut.isPending ? <Spinner size="sm" color="text-[#0a0a0a]" /> : <><Save className="w-4.5 h-4.5" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111111] border border-zinc-800 p-8 rounded-2xl shadow-lg">
            <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-800/50">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-lime-400" />
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
                  <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
                  <input
                    type="password" 
                    value={pwForm[name]}
                    placeholder={placeholder}
                    onChange={(e) => setPwForm({ ...pwForm, [name]: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg bg-[#0a0a0a] text-white placeholder-zinc-600 focus:outline-none transition-colors border ${
                      pwErrors[name] 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-zinc-800 focus:border-lime-400 focus:ring-1 focus:ring-lime-400'
                    }`}
                  />
                  {pwErrors[name] && (
                    <p className="text-xs font-medium text-red-500 mt-1.5">
                      {Array.isArray(pwErrors[name]) ? pwErrors[name][0] : pwErrors[name]}
                    </p>
                  )}
                </div>
              ))}
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={pwMut.isPending} 
                  className="w-full px-6 py-3.5 bg-[#0a0a0a] text-white border border-zinc-800 hover:border-lime-400/50 hover:text-lime-400 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {pwMut.isPending ? <Spinner size="sm" color="text-lime-400" /> : <><Shield className="w-4.5 h-4.5" /> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}