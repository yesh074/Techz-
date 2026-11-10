import { useState, useEffect } from 'react'
import { Boxes, Search, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { resourcesApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadResources()
  }, [])

  function loadResources() {
    setLoading(true)
    resourcesApi.list().then(res => {
      setResources(res.data || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      toast.error('Failed to load inventory resources')
    })
  }

  const filtered = resources.filter(r =>
    (r.name || r.resource_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Boxes size={16} />
            <span>Campus Asset & Equipment Inventory</span>
          </div>
          <h1 className="page-title text-2xl">Resource Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lab equipment, hardware kits, library assets, and classroom teaching apparatus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-8 py-1.5 text-xs w-52"
            />
          </div>
          <button onClick={loadResources} className="btn-secondary text-xs p-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title">Physical Assets Roster</h2>
          <span className="text-xs text-slate-400">{filtered.length} items logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Resource Item</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Category</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Location</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Available Units</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item, idx) => (
                <tr key={idx} className="table-row">
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    {item.name || item.resource_name || 'Lab Asset'}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {item.category || 'General Equipment'}
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                    {item.location || 'Block C, Room 204'}
                  </td>
                  <td className="px-5 py-3 font-bold text-primary-700">
                    {item.quantity || item.available || 15}
                  </td>
                  <td className="px-5 py-3">
                    <span className="badge badge-healthy">
                      {item.status || item.condition || 'Operational'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400">
                    {loading ? 'Fetching resource catalog...' : 'No inventory items found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
