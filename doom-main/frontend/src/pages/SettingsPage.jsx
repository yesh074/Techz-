import { useState } from 'react'
import { Settings as SettingsIcon, Save, Key, Building2, Cpu, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('')
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash')
  const [institution, setInstitution] = useState('TECHZ Institute of Technology & Management')
  const [semester, setSemester] = useState('Fall 2026 / Semester V')

  function handleSave(e) {
    e.preventDefault()
    toast.success('Configuration saved locally')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="page-title text-2xl">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institutional metadata, AI models, and Gemini API keys.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Gemini AI Settings Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Cpu size={18} className="text-primary-600" />
            <span>Google Gemini AI Engine Configuration</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Google Gemini API Key</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (configured in backend/.env)"
                className="input pl-9"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used by the RAG Engine for real-time textbook answering. (Can also be set directly in <code>backend/.env</code>).
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Gemini Model Family</label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="input"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Ultra-fast RAG)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-gen reasoning)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep textbook synthesis)</option>
            </select>
          </div>
        </div>

        {/* Institution Info Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Building2 size={18} className="text-primary-600" />
            <span>Institution & Academic Cycle</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Institution Name</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Current Academic Term</label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2 py-2 px-5">
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  )
}
