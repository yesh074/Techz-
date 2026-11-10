import { useState, useEffect } from 'react'
import {
  Activity, Cpu, Sparkles, CheckCircle, AlertCircle, Clock,
  RefreshCw, Filter, Layers, Database, ArrowRight
} from 'lucide-react'
import { aiApi } from '../services/api'
import { useRealTime } from '../context/RealTimeContext'
import toast from 'react-hot-toast'

export default function AIActivityPage() {
  const { subscribe, isConnected } = useRealTime()
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState('ALL')

  useEffect(() => {
    loadData()
    const unsub = subscribe('AI_ACTIVITY', (newEvent) => {
      setLogs(prev => [newEvent, ...prev.slice(0, 49)])
    })
    return unsub
  }, [])

  function loadData() {
    setLoading(true)
    Promise.all([
      aiApi.getActivity(50),
      aiApi.getStatus().catch(() => ({ data: null }))
    ]).then(([actRes, stRes]) => {
      setLogs(actRes.data || [])
      setStatus(stRes.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      toast.error('Failed to load telemetry logs')
    })
  }

  const filteredLogs = selectedAgent === 'ALL'
    ? logs
    : logs.filter(l => l.agent_name?.toLowerCase().includes(selectedAgent.toLowerCase()))

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Activity size={16} />
            <span>Autonomous Agentic Observability</span>
          </div>
          <h1 className="page-title text-2xl">AI Agent Execution Telemetry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of background multi-agent orchestrations, reasoning cycles, and event bus broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SSE Stream: {isConnected ? 'Live Connected' : 'Reconnecting...'}</span>
          </div>
          <button
            onClick={loadData}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Status Cards */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(status.agents || {}).map(([name, st], i) => (
            <div key={i} className="card p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">{name}</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{st}</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Cpu size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['ALL', 'Intelligence', 'Summary', 'Demand', 'Ordering'].map(ag => (
          <button
            key={ag}
            onClick={() => setSelectedAgent(ag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              selectedAgent === ag
                ? 'bg-primary-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {ag === 'ALL' ? 'All Agents' : `${ag} Agent`}
          </button>
        ))}
      </div>

      {/* Activity Timeline List */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title">Autonomous Action Logs</h2>
          <span className="text-xs text-slate-400">{filteredLogs.length} events logged</span>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredLogs.map((item, idx) => (
            <div key={idx} className="p-5 hover:bg-slate-50/70 transition-colors space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">{item.agent_name}</span>
                    <span className="text-xs text-slate-400 mx-2">·</span>
                    <span className="text-xs text-primary-700 font-medium">{item.action}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">{item.timestamp || 'Just now'}</span>
                  <span className={`badge ${item.status === 'Completed' ? 'badge-healthy' : 'badge-processing'}`}>
                    {item.status || 'Success'}
                  </span>
                </div>
              </div>

              <div className="pl-9 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-800">{item.title}</div>
                <div className="text-slate-600 leading-relaxed">{item.description}</div>

                {item.data_considered && Object.keys(item.data_considered).length > 0 && (
                  <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono text-slate-700 overflow-x-auto">
                    <span className="font-bold text-slate-500 font-sans block mb-1">Reasoning Parameters:</span>
                    {JSON.stringify(item.data_considered, null, 2)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && !loading && (
            <div className="p-12 text-center text-sm text-slate-400">
              No recent agent events found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
