import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Boxes,
  Sliders, RefreshCw, ShoppingCart, Sparkles, ArrowRight
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { demandApi, ordersApi } from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const RISK_BADGE = {
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  HEALTHY: 'badge-healthy',
  SURPLUS: 'badge-surplus',
}

export default function DemandPage() {
  const navigate = useNavigate()
  const [forecasts, setForecasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [simCourse, setSimCourse] = useState('CS301')
  const [simStudents, setSimStudents] = useState(30)
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  useEffect(() => {
    loadForecasts()
  }, [])

  function loadForecasts() {
    setLoading(true)
    demandApi.getForecasts().then(res => {
      setForecasts(res.data || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      toast.error('Could not load demand forecasts')
    })
  }

  async function handleSimulate() {
    setSimulating(true)
    try {
      const res = await demandApi.simulateEnrollment({
        course_code: simCourse,
        additional_students: parseInt(simStudents, 10)
      })
      setSimResult(res.data)
      toast.success(`Simulation completed: Recalculated demand curve for ${simCourse}`)
    } catch {
      toast.error('Simulation failed')
    } finally {
      setSimulating(false)
    }
  }

  async function handleQuickOrder(book) {
    try {
      const qty = Math.max(15, (book.predicted_demand || 40) - (book.current_stock || 0))
      await ordersApi.create({
        book_id: book.book_id,
        quantity: qty,
        supplier: 'Cambridge / Oxford University Press',
        notes: 'Autonomous demand risk mitigation order'
      })
      toast.success(`Purchase order generated for ${qty} copies of ${book.title}`)
      navigate('/orders')
    } catch {
      toast.error('Failed to create order')
    }
  }

  const chartData = forecasts.map(f => ({
    name: f.course_code || f.title?.slice(0, 12),
    Stock: f.current_stock,
    Demand: f.predicted_demand,
    Enrolled: f.enrolled_students || 60
  }))

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp size={16} />
            <span>Autonomous Demand Intelligence</span>
          </div>
          <h1 className="page-title text-2xl">Textbook Demand Forecasting</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive stock vs. course syllabus requirement models and dynamic enrollment simulator.
          </p>
        </div>

        <button
          onClick={loadForecasts}
          className="btn-secondary text-xs flex items-center gap-2 self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Predictions</span>
        </button>
      </div>

      {/* Chart Section */}
      <div className="card p-6 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Current Inventory vs. Projected Semester Demand
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Stock" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Demand" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Enrolled" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="card p-6 bg-gradient-to-br from-white to-indigo-50/40 border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="text-primary-600" size={18} />
            <h2 className="text-sm font-bold text-slate-900">
              Enrollment Spike Simulator
            </h2>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
            What-If Scenario Tool
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Target Course Code</label>
            <select
              value={simCourse}
              onChange={(e) => setSimCourse(e.target.value)}
              className="input text-xs"
            >
              {forecasts.map(f => (
                <option key={f.book_id} value={f.course_code || 'CS301'}>
                  {f.course_code || 'CS301'} — {f.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Simulated Extra Enrollment</span>
              <span className="font-bold text-primary-600">+{simStudents} Students</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={simStudents}
              onChange={(e) => setSimStudents(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full btn-primary text-xs justify-center py-2.5"
            >
              <Sparkles size={14} className={simulating ? 'animate-spin' : ''} />
              <span>Simulate Demand Impact</span>
            </button>
          </div>
        </div>

        {simResult && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-indigo-200 shadow-xs flex items-center justify-between">
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-900">
                Simulation Result for {simCourse} (+{simStudents} students):
              </div>
              <div className="text-slate-600">
                New Projected Demand: <strong className="text-primary-700">{simResult.new_predicted_demand} copies</strong> ·
                Risk Level: <span className={`badge ${RISK_BADGE[simResult.new_risk_level] || 'badge-medium'} ml-1`}>{simResult.new_risk_level}</span>
              </div>
            </div>
            <button
              onClick={() => {
                ordersApi.create({
                  book_id: simResult.book_id,
                  quantity: simResult.recommended_additional_order || 25,
                  supplier: 'Educational Publisher Direct',
                  notes: `Auto-generated buffer order for simulated +${simStudents} enrollment surge`
                }).then(() => {
                  toast.success('Simulation order created!')
                  navigate('/orders')
                })
              }}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Generate Buffer Order
            </button>
          </div>
        )}
      </div>

      {/* Forecasts Table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title">All Course Textbook Forecasts</h2>
          <span className="text-xs text-slate-400">{forecasts.length} titles evaluated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Book & Course</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Stock</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enrolled</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Forecast</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Risk Level</th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {forecasts.map((f, i) => (
                <tr key={i} className="table-row">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{f.title}</div>
                    <div className="text-[11px] text-slate-400">{f.course_code} · {f.department}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{f.current_stock}</td>
                  <td className="px-5 py-3.5 text-slate-600">{f.enrolled_students || 55}</td>
                  <td className="px-5 py-3.5 font-bold text-primary-700">{f.predicted_demand}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${RISK_BADGE[f.risk_level] || 'badge-healthy'}`}>
                      {f.risk_level}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    {f.risk_level === 'HIGH' && (
                      <button
                        onClick={() => handleQuickOrder(f)}
                        className="btn-primary text-[11px] py-1 px-2.5"
                      >
                        Quick Order
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/intelligence?id=${f.book_id}`)}
                      className="btn-secondary text-[11px] py-1 px-2.5"
                    >
                      Intelligence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
