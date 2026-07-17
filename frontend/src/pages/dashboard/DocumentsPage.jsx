import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { documentService } from '../../services/documentService'
import {
  Upload, FileText, Trash2, RefreshCw, Zap,
  CheckCircle, AlertCircle, Clock, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SkeletonCard from '../../components/common/SkeletonCard'
import { formatDate } from '../../utils/helpers'

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

const STATUS_ICON = {
  uploaded:   <Clock className="w-3.5 h-3.5 text-[#8B8F97]" />,
  extracting: <Loader2 className="w-3.5 h-3.5 text-[#F5B942] animate-spin" />,
  extracted:  <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />,
  chunking:   <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />,
  processed:  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  failed:     <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
}

const STATUS_LABEL = {
  uploaded: 'Uploaded', extracting: 'Extracting text…',
  extracted: 'Chunking…', chunking: 'Indexing…',
  processed: 'Ready', failed: 'Failed',
}

function UploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(null)
  const fileRef = useRef()

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed.'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB.'); return }

    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', file.name.replace('.pdf', ''))

    try {
      setProgress(0)
      const response = await documentService.upload(fd, (e) => {
        setProgress(Math.round((e.loaded / e.total) * 100))
      })
      const message = response?.data?.message || 'Upload complete.'
      toast.success(message)
      onUpload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.')
    } finally {
      setProgress(null)
    }
  }, [onUpload])

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => progress === null && fileRef.current.click()}
      className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
        ${dragging 
          ? 'border-[#F5B942] bg-[#F5B942]/5 shadow-[0_0_30px_-5px_rgba(245,185,66,0.15)]' 
          : 'border-[#24272E] hover:border-[#F5B942]/40 hover:bg-[#24272E]/30'}`}
    >
      <input ref={fileRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />

      {progress !== null ? (
        <div className="space-y-4 relative z-10">
          <Loader2 className="w-12 h-12 text-[#F5B942] animate-spin mx-auto" />
          <p className="text-[#ECEAE6] font-semibold tracking-wide f-body">Uploading… {progress}%</p>
          <div className="h-2 bg-[#24272E] rounded-full overflow-hidden max-w-sm mx-auto border border-[#4A4E56]">
            <div className="h-full bg-[#F5B942] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,185,66,0.5)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="relative z-10 group">
          <div className="w-16 h-16 bg-[#0A0B0D] border border-[#24272E] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-105 transition-transform">
            <Upload className="w-8 h-8 text-[#F5B942]" />
          </div>
          <p className="f-display font-bold text-lg text-[#ECEAE6] mb-1.5">Drop your PDF here</p>
          <p className="text-sm text-[#8B8F97] mb-6 font-medium f-body">or click to browse • Max 10 MB</p>
          <span className="inline-block px-6 py-2.5 bg-[#0A0B0D] border border-[#24272E] text-[#ECEAE6] rounded-xl font-semibold text-sm f-body pointer-events-none group-hover:border-[#F5B942]/50 transition-colors">
            Choose PDF
          </span>
        </div>
      )}
      
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#F5B942]/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  )
}

export default function DocumentsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.list().then(r => r.data),
    refetchInterval: (d) => {
      const docs = d?.state?.data?.results || []
      const processing = docs.some(d => ['extracting','extracted','chunking'].includes(d.status))
      return processing ? 4000 : false
    },
  })

  const deleteMut = useMutation({
    mutationFn: documentService.delete,
    onSuccess: () => { qc.invalidateQueries(['documents']); toast.success('Document deleted.') },
    onError: () => toast.error('Delete failed.'),
  })

  const reprocessMut = useMutation({
    mutationFn: documentService.reprocess,
    onSuccess: () => { qc.invalidateQueries(['documents']); toast.success('Reprocessing started.') },
    onError: () => toast.error('Reprocess failed.'),
  })

  const docs = data?.results || []

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-fade-in text-[#8B8F97] f-body selection:bg-[#F5B942] selection:text-[#0A0B0D]">
      {FONTS}

      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl f-display font-semibold text-[#ECEAE6] mb-2">Documents</h1>
        <p className="text-[#8B8F97] text-base f-body">Upload PDFs to generate AI quizzes from your study material.</p>
      </div>

      <UploadZone onUpload={() => qc.invalidateQueries(['documents'])} />

      <div className="pt-2">
        <h2 className="f-display font-semibold text-xl text-[#ECEAE6] mb-5 flex items-center justify-between">
          <span>Your Documents</span>
          <span className="text-xs bg-[#0A0B0D] border border-[#24272E] text-[#8B8F97] px-3 py-1.5 rounded-full f-mono font-semibold">
            {data?.count || 0} Files
          </span>
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[#14161B] border border-[#24272E] rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="bg-[#14161B] border border-[#24272E] border-dashed rounded-2xl py-16 flex flex-col items-center justify-center text-center shadow-lg shadow-black/10">
            <div className="w-16 h-16 bg-[#0A0B0D] border border-[#24272E] rounded-full flex items-center justify-center mb-4 shadow-inner">
              <FileText className="w-6 h-6 text-[#4A4E56]" />
            </div>
            <h3 className="text-lg font-semibold text-[#ECEAE6] mb-1 f-display">No documents yet</h3>
            <p className="text-[#8B8F97] text-sm max-w-sm f-body">Upload a PDF above to get started generating quizzes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {docs.map((doc) => (
              <div key={doc.id} className="bg-[#14161B] border border-[#24272E] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-5 hover:border-[#F5B942]/40 transition-all duration-300 group shadow-lg shadow-black/10">
                
                <div className="w-12 h-12 bg-[#0A0B0D] border border-[#24272E] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-[#F5B942]/30 transition-colors shadow-inner">
                  <FileText className="w-6 h-6 text-[#F5B942]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#ECEAE6] text-lg f-display truncate mb-1 group-hover:text-[#F5B942] transition-colors">{doc.title}</p>
                  <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8B8F97] f-mono">
                      {STATUS_ICON[doc.status]}
                      <span className={doc.status === 'failed' ? 'text-rose-400' : doc.status === 'processed' ? 'text-emerald-400' : ''}>
                        {STATUS_LABEL[doc.status]}
                      </span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#4A4E56]"></span>
                    <span className="text-[11px] font-medium text-[#8B8F97] f-mono">{doc.file_size_mb} MB</span>
                    
                    {doc.page_count > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#4A4E56]"></span>
                        <span className="text-[11px] font-medium text-[#8B8F97] f-mono">{doc.page_count} pages</span>
                      </>
                    )}
                    
                    <span className="w-1 h-1 rounded-full bg-[#4A4E56]"></span>
                    <span className="text-[11px] font-medium text-[#8B8F97] f-mono">{formatDate(doc.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#24272E]">
                  {doc.status === 'processed' && (
                    <Link
                      to={`/quizzes/generate?doc=${doc.id}`}
                      className="px-5 py-2.5 bg-[#F5B942] hover:bg-[#f0aa26] text-[#0A0B0D] font-semibold rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(245,185,66,0.35)] flex items-center gap-2 text-sm f-body"
                    >
                      <Zap className="w-4 h-4" /> Create Quiz
                    </Link>
                  )}
                  {doc.status === 'failed' && (
                    <button
                      onClick={() => reprocessMut.mutate(doc.id)}
                      disabled={reprocessMut.isPending}
                      className="px-4 py-2.5 bg-[#0A0B0D] border border-[#24272E] hover:border-[#F5B942]/50 hover:text-[#F5B942] text-[#ECEAE6] font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50 f-body"
                    >
                      <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete this document and all associated quizzes?'))
                        deleteMut.mutate(doc.id)
                    }}
                    disabled={deleteMut.isPending}
                    className="p-2.5 text-[#4A4E56] hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-colors disabled:opacity-50"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}