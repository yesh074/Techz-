import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, Library, Boxes, ClipboardCheck,
  ShoppingCart, Bell, Zap, TrendingUp, TrendingDown,
  ArrowRight, RefreshCw, Sparkles, AlertCircle, CheckCircle, Send
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { dashboardApi, ordersApi } from '../services/api'
import { useRealTime } from '../context/RealTimeContext'

function KPICard({ label, value, icon: Icon, color, trend }) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <div className="stat-label mb-1">{label}</div>
        <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  )
}

const RISK_BADGE = {
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  HEALTHY: 'badge-healthy',
  SURPLUS: 'badge-surplus',
}

const STATUS_BADGE = {
  'AI Recommended': 'badge-recommended',
  'Processing': 'badge-processing',
  'Delivered': 'badge-delivered',
  'Pending': 'badge-pending',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { subscribe } = useRealTime()
  const [stats, setStats] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [askQuery, setAskQuery] = useState('')
  const [askResult, setAskResult] = useState(null)
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    loadDashboard()
    const unsub = subscribe('DEMAND_UPDATED', () => loadDashboard())
    return unsub
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const [s, f, r, a] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getForecast(),
        dashboardApi.getRecommendations(),
        dashboardApi.getRecentActivity(8),
      ])
      setStats(s.data)
      setForecast(f.data)
      setRecommendations(r.data)
      setActivity(a.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleAskTechz(e) {
    e.preventDefault()
    if (!askQuery.trim()) return
    setAsking(true)
    setAskResult(null)
    try {
      const r = await dashboardApi.askTechz(askQuery)
      setAskResult(r.data)
    } catch { setAskResult({ answer: 'Unable to connect to TECHZ AI right now. Please try again.', type: 'error' }) }
    setAsking(false)
  }

  async function handleApprove(orderId) {
    try {
      await ordersApi.approve(orderId)
      loadDashboard()
    } catch (e) { alert('Could not approve order.') }
  }

  const kpis = stats ? [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-500', trend: 3.2 },
    { label: 'Teachers', value: stats.teachers, icon: GraduationCap, color: 'bg-emerald-500', trend: 1.1 },
    { label: 'Books (Copies)', value: stats.books, icon: Library, color: 'bg-violet-500', trend: -2.4 },
    { label: 'Resources', value: stats.resources, icon: Boxes, color: 'bg-amber-500', trend: 0.8 },
    { label: 'Attendance', value: `${stats.attendance}%`, icon: ClipboardCheck, color: 'bg-indigo-500', trend: 0.4 },
    { label: 'Pending Orders', value: stats.pending_orders, icon: ShoppingCart, color: 'bg-orange-500' },
    { label: 'AI Alerts', value: stats.ai_alerts, icon: Bell, color: 'bg-red-500' },
    { label: 'AI Actions', value: stats.ai_actions, icon: Zap, color: 'bg-primary-600' },
  ] : []

  const chartData = forecast?.timeline || []
  const agentColors = { 'Demand Prediction Agent': '#7c3aed', 'Book Ordering Agent': '#2563eb', 'Book Intelligence Agent': '#059669', 'Book Summary Agent': '#d97706', default: '#64748b' }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, Yogesh 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening across your institution today.</p>
        </div>
        <button onClick={loadDashboard} className="btn-secondary" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-16 mb-3"></div>
              <div className="h-7 bg-slate-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} {...k} />)}
        </div>
      )}

      {/* Ask TECHZ AI */}
      <div className="card p-5 border-primary-100 bg-gradient-to-r from-primary-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary-600" />
          <span className="text-sm font-semibold text-primary-800">Ask TECHZ AI</span>
        </div>
        <form onSubmit={handleAskTechz} className="flex gap-3">
          <input
            className="input flex-1 bg-white text-sm"
            placeholder="What books will be required next semester? Which books are running low? Why order Data Structures?"
            value={askQuery}
            onChange={e => setAskQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary flex-shrink-0" disabled={asking}>
            {asking ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            Ask AI
          </button>
        </form>
        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Which books are running low?', 'What books for next semester?', 'Why order Data Structures?'].map(p => (
            <button
              key={p}
              onClick={() => setAskQuery(p)}
              className="text-xs px-3 py-1.5 bg-white border border-primary-200 rounded-full text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        {askResult && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-primary-100">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{askResult.answer}</p>
            {askResult.action_link && (
              <button onClick={() => navigate(askResult.action_link)} className="mt-2 text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                View details <ArrowRight size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Forecast Chart */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <div>
              <h2 className="section-title">Book Demand Forecast</h2>
              <p className="text-xs text-slate-400 mt-0.5">{forecast?.selected_book || 'All Books'}</p>
            </div>
            <button onClick={() => navigate('/demand')} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              Full Analysis <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-5">
            {/* Mini KPIs */}
            {forecast && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-slate-900">{forecast.current_stock}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Current Stock</div>
                </div>
                <div className="bg-violet-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-violet-700">{forecast.predicted_demand}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Predicted Demand</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-600">{forecast.expected_shortage}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Expected Shortage</div>
                </div>
              </div>
            )}

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val, name) => [val, name === 'actual' ? 'Actual Stock' : name === 'historical' ? 'Historical' : 'Predicted Demand']}
                  />
                  <Legend formatter={(v) => v === 'actual' ? 'Actual Stock' : v === 'historical' ? 'Historical' : 'Predicted Demand'} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="historical" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" connectNulls={false} />
                  <Area type="monotone" dataKey="actual" stroke="#7c3aed" strokeWidth={2} fill="url(#actualGrad)" connectNulls={false} />
                  <Area type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="url(#predictedGrad)" connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Loading chart data...</div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">AI Recommendations</h2>
            <button onClick={() => navigate('/recommendations')} className="text-xs text-primary-600 font-medium hover:underline">View all</button>
          </div>
          <div className="p-4 space-y-3">
            {recommendations.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
                <div className="text-sm text-slate-500">No critical recommendations</div>
              </div>
            )}
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="text-sm font-semibold text-slate-800 line-clamp-1">{rec.book_title}</div>
                  <span className={`${RISK_BADGE[rec.risk_level] || 'badge'} ml-2 flex-shrink-0`}>{rec.risk_level}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  Stock: <strong>{rec.current_stock}</strong> · Demand: <strong>{rec.predicted_demand}</strong>
                </div>
                <div className="text-xs font-medium text-primary-700 mb-2">
                  Recommend: Order {rec.recommended_order} copies
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/orders')} className="text-xs px-2 py-1 border border-slate-200 rounded text-slate-600 hover:bg-white transition-colors">Details</button>
                  <button onClick={() => handleApprove(rec.order_id)} className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Recent Activity</h2>
          <button onClick={() => navigate('/ai-activity')} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">View AI Activity <ArrowRight size={11} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Agent / User</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activity.map((a, i) => (
                <tr key={i} className="table-row">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${a.agent_name?.includes('AI') || a.agent_name?.includes('Agent') ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
                        {a.agent_name?.[0] || 'A'}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{a.agent_name || 'Admin'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600 max-w-xs">
                    <div className="font-medium text-slate-800">{a.title}</div>
                    <div className="text-slate-400 mt-0.5 truncate">{a.description}</div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{a.timestamp}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${a.status === 'Completed' ? 'badge-healthy' : a.status === 'Alert' ? 'badge-high' : 'badge-processing'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {activity.length === 0 && (
                <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-slate-400">No recent activity</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
