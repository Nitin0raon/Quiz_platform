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

const STATUS_ICON = {
  uploaded:   <Clock className="w-3.5 h-3.5 text-zinc-500" />,
  extracting: <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
  extracted:  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
  chunking:   <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
  processed:  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  failed:     <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
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
      await documentService.upload(fd, (e) => {
        setProgress(Math.round((e.loaded / e.total) * 100))
      })
      toast.success('PDF uploaded and processed!')
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
          ? 'border-lime-400 bg-lime-400/5 shadow-[0_0_30px_-5px_rgba(163,230,53,0.15)]' 
          : 'border-zinc-800 hover:border-lime-400/40 hover:bg-zinc-900/50'}`}
    >
      <input ref={fileRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />

      {progress !== null ? (
        <div className="space-y-4 relative z-10">
          <Loader2 className="w-12 h-12 text-lime-400 animate-spin mx-auto" />
          <p className="text-white font-semibold tracking-wide">Uploading… {progress}%</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden max-w-sm mx-auto border border-zinc-700">
            <div className="h-full bg-lime-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(163,230,53,0.5)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-105 transition-transform">
            <Upload className="w-8 h-8 text-lime-400" />
          </div>
          <p className="font-display font-bold text-lg text-white mb-1.5">Drop your PDF here</p>
          <p className="text-sm text-zinc-400 mb-6 font-medium">or click to browse • Max 10 MB</p>
          <span className="inline-block px-6 py-2.5 bg-[#0a0a0a] border border-zinc-700 text-zinc-300 rounded-lg font-semibold text-sm pointer-events-none">
            Choose PDF
          </span>
        </div>
      )}
      
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-400/5 rounded-full blur-[80px] pointer-events-none" />
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
    <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-fade-in font-sans selection:bg-lime-400 selection:text-black text-zinc-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Documents</h1>
        <p className="text-zinc-400 text-base">Upload PDFs to generate AI quizzes from your study material.</p>
      </div>

      <UploadZone onUpload={() => qc.invalidateQueries(['documents'])} />

      <div className="pt-2">
        <h2 className="font-display font-semibold text-xl text-white mb-5 flex items-center justify-between">
          <span>Your Documents</span>
          <span className="text-sm bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full">
            {data?.count || 0} Files
          </span>
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[#111111] border border-zinc-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="bg-[#111111] border border-zinc-800 border-dashed rounded-2xl py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No documents yet</h3>
            <p className="text-zinc-500 text-sm max-w-sm">Upload a PDF above to get started generating intelligent quizzes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {docs.map((doc) => (
              <div key={doc.id} className="bg-[#111111] border border-zinc-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-5 hover:border-lime-400/30 transition-all duration-300 group shadow-lg">
                
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-lime-400/20 transition-colors">
                  <FileText className="w-6 h-6 text-lime-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-base truncate mb-1.5 group-hover:text-lime-400 transition-colors">{doc.title}</p>
                  <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {STATUS_ICON[doc.status]}
                      <span className={doc.status === 'failed' ? 'text-red-400' : doc.status === 'processed' ? 'text-emerald-400' : ''}>
                        {STATUS_LABEL[doc.status]}
                      </span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                    <span className="text-xs font-medium text-zinc-500">{doc.file_size_mb} MB</span>
                    
                    {doc.page_count > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="text-xs font-medium text-zinc-500">{doc.page_count} pages</span>
                      </>
                    )}
                    
                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                    <span className="text-xs font-medium text-zinc-500">{formatDate(doc.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  {doc.status === 'processed' && (
                    <Link
                      to={`/quizzes/generate?doc=${doc.id}`}
                      className="px-5 py-2.5 bg-lime-400 hover:bg-lime-500 text-[#0a0a0a] font-bold rounded-lg transition-colors flex items-center gap-2 text-sm shadow-[0_0_10px_-2px_rgba(163,230,53,0.3)]"
                    >
                      <Zap className="w-4 h-4" /> Create Quiz
                    </Link>
                  )}
                  {doc.status === 'failed' && (
                    <button
                      onClick={() => reprocessMut.mutate(doc.id)}
                      disabled={reprocessMut.isPending}
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
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
                    className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
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