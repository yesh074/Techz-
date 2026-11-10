import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Upload, Filter, Grid, List, X, RefreshCw, BookOpen, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { booksApi } from '../../services/api'

const RISK_BADGE = {
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  HEALTHY: 'badge-healthy',
  SURPLUS: 'badge-surplus',
}
const RISK_LABEL = { HIGH: 'High Demand', MEDIUM: 'Moderate', HEALTHY: 'Healthy', SURPLUS: 'Surplus' }

function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [dept, setDept] = useState('Computer Science')
  const [semester, setSemester] = useState('V')
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState(null)

  const steps = ['Uploading', 'Reading PDF', 'Extracting chapters', 'Creating knowledge', 'Ready']

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('department', dept)
    formData.append('semester', semester)

    // Animate steps
    let si = 0
    const interval = setInterval(() => {
      setStep(steps[si++])
      if (si >= steps.length) clearInterval(interval)
    }, 1500)

    try {
      const r = await booksApi.upload(formData)
      clearInterval(interval)
      setStep('Ready')
      setTimeout(() => { onSuccess(r.data); onClose() }, 1000)
    } catch (e) {
      clearInterval(interval)
      setUploading(false)
      setStep(null)
      alert('Upload failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fadeIn">
      <div className="w-[480px] bg-white rounded-2xl border border-slate-200 shadow-card-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-800">Upload Textbook</h2>
          <button onClick={onClose}><X size={16} className="text-slate-400" /></button>
        </div>

        {!uploading ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">PDF File</label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}
                onClick={() => document.getElementById('book-upload-input').click()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f) }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input id="book-upload-input" type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                <BookOpen size={28} className={`mx-auto mb-2 ${file ? 'text-primary-600' : 'text-slate-300'}`} />
                {file ? (
                  <div><div className="text-sm font-medium text-primary-700">{file.name}</div><div className="text-xs text-primary-500">{(file.size / 1024 / 1024).toFixed(1)} MB</div></div>
                ) : (
                  <div><div className="text-sm text-slate-500">Drop PDF here or click to browse</div><div className="text-xs text-slate-400 mt-1">Supports text-based and scanned PDFs</div></div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
                <select className="input" value={dept} onChange={e => setDept(e.target.value)}>
                  {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering', 'Management Studies'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Semester</label>
                <select className="input" value={semester} onChange={e => setSemester(e.target.value)}>
                  {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleUpload} disabled={!file} className="btn-primary flex-1">Upload & Process</button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="space-y-3">
              {steps.map((s, i) => {
                const currentIdx = steps.indexOf(step)
                const isDone = i < currentIdx || step === 'Ready'
                const isActive = s === step && step !== 'Ready'
                return (
                  <div key={s} className={`flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary-50' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-100' : isActive ? 'bg-primary-100' : 'bg-slate-100'}`}>
                      {isDone ? <CheckCircle size={13} className="text-emerald-600" /> : isActive ? <RefreshCw size={13} className="text-primary-600 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    </div>
                    <span className={`text-sm ${isDone ? 'text-emerald-600 font-medium' : isActive ? 'text-primary-700 font-medium' : 'text-slate-400'}`}>{s}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookLibraryPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('all')
  const [semester, setSemester] = useState('all')
  const [risk, setRisk] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => { loadBooks() }, [dept, semester, risk])

  async function loadBooks() {
    setLoading(true)
    try {
      const r = await booksApi.list({ department: dept, semester, risk })
      setBooks(r.data)
    } catch {}
    setLoading(false)
  }

  const filtered = books.filter(b =>
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Book Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">{books.length} textbooks in institutional collection</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <Upload size={14} /> Upload Book
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-8" placeholder="Search books, authors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={dept} onChange={e => setDept(e.target.value)}>
          <option value="all">All Departments</option>
          {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input w-32" value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="all">All Semesters</option>
          {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select className="input w-36" value={risk} onChange={e => setRisk(e.target.value)}>
          <option value="all">All Risk Levels</option>
          <option value="HIGH">High Demand</option>
          <option value="MEDIUM">Moderate</option>
          <option value="HEALTHY">Healthy</option>
        </select>
        <div className="flex gap-1 border border-slate-200 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-slate-400'}`}><Grid size={14} /></button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-slate-400'}`}><List size={14} /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-72 animate-pulse bg-slate-50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
          <div className="text-slate-500 font-medium">No books found</div>
          <button onClick={() => setShowUpload(true)} className="btn-primary mt-4">Upload First Book</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(book => (
            <div key={book.book_id} className="card overflow-hidden hover:shadow-card-lg transition-shadow group">
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary-100 to-indigo-100">
                {book.cover_image ? (
                  <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><BookOpen size={36} className="text-primary-300" /></div>
                )}
                <span className={`absolute top-2 right-2 ${RISK_BADGE[book.demand_risk] || 'badge'}`}>{RISK_LABEL[book.demand_risk] || book.demand_risk}</span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight mb-1">{book.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{book.author}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
                  <div className="text-xs text-slate-500">Available: <span className="font-semibold text-slate-700">{book.available_stock || book.current_stock}</span></div>
                  <div className="text-xs text-slate-500">Demand: <span className={`font-semibold ${book.demand_risk === 'HIGH' ? 'text-red-600' : 'text-slate-700'}`}>{book.predicted_demand}</span></div>
                </div>
                <button
                  onClick={() => navigate(`/books/${book.book_id}`)}
                  className="w-full btn-primary text-xs py-1.5 justify-center"
                >
                  Visit Book
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Book</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Stock</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Demand</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Risk</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(book => (
                <tr key={book.book_id} className="table-row">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-11 rounded overflow-hidden flex-shrink-0 bg-primary-50">
                        {book.cover_image ? <img src={book.cover_image} alt="" className="w-full h-full object-cover" /> : <BookOpen size={14} className="text-primary-300 m-auto mt-3" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{book.title}</div>
                        <div className="text-xs text-slate-400">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{book.department} · Sem {book.semester}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-800">{book.current_stock}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-800">{book.predicted_demand}</td>
                  <td className="px-5 py-3"><span className={RISK_BADGE[book.demand_risk] || 'badge'}>{RISK_LABEL[book.demand_risk] || book.demand_risk}</span></td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => navigate(`/books/${book.book_id}`)} className="btn-secondary text-xs py-1">Visit Book</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={loadBooks} />}
    </div>
  )
}
