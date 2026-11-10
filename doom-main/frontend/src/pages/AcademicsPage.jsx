import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Users, GraduationCap, BookOpen, Clock, FileText, CalendarDays,
  Search, Plus, CheckCircle, RefreshCw, Layers
} from 'lucide-react'
import { academicsApi } from '../services/api'
import toast from 'react-hot-toast'

export default function AcademicsPage({ defaultTab }) {
  const location = useLocation()
  const pathPart = location.pathname.replace('/', '')
  const activeSection = defaultTab || (pathPart || 'students')

  const [tab, setTab] = useState(activeSection)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTab(activeSection)
  }, [activeSection])

  useEffect(() => {
    loadTabData(tab)
  }, [tab])

  function loadTabData(curTab) {
    setLoading(true)
    let fetcher = academicsApi.getStudents
    if (curTab === 'teachers') fetcher = academicsApi.getTeachers
    else if (curTab === 'courses') fetcher = academicsApi.getCourses
    else if (curTab === 'attendance') fetcher = academicsApi.getAttendance
    else if (curTab === 'exams') fetcher = academicsApi.getExams
    else if (curTab === 'assignments') fetcher = academicsApi.getAssignments
    else if (curTab === 'timetable') fetcher = academicsApi.getTimetable

    fetcher().then(res => {
      setData(res.data || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      toast.error(`Could not load ${curTab} data`)
    })
  }

  const filteredData = Array.isArray(data)
    ? data.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap size={16} />
            <span>Academic ERP Management</span>
          </div>
          <h1 className="page-title text-2xl capitalize">
            {tab} Directory & Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional roster, active enrollments, faculty workloads, and examination schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-8 py-1.5 text-xs w-48 sm:w-60"
            />
          </div>
          <button
            onClick={() => loadTabData(tab)}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'students', label: 'Students', icon: Users },
          { id: 'teachers', label: 'Teachers & Faculty', icon: GraduationCap },
          { id: 'courses', label: 'Courses & Syllabus', icon: BookOpen },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'exams', label: 'Examinations', icon: FileText },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'timetable', label: 'Timetable', icon: CalendarDays },
        ].map(t => {
          const Icon = t.icon
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title capitalize">{tab} Records</h2>
          <span className="text-xs text-slate-400">{filteredData.length} records displayed</span>
        </div>

        <div className="overflow-x-auto">
          {filteredData.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {Object.keys(filteredData[0]).filter(k => k !== '_id' && k !== 'hierarchy' && k !== 'sample_pages').map(k => (
                    <th key={k} className="px-5 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      {k.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((row, i) => (
                  <tr key={i} className="table-row">
                    {Object.entries(row).filter(([k]) => k !== '_id' && k !== 'hierarchy' && k !== 'sample_pages').map(([k, v], cellIdx) => (
                      <td key={cellIdx} className="px-5 py-3 text-slate-700">
                        {typeof v === 'boolean' ? (
                          <span className={`badge ${v ? 'badge-healthy' : 'badge-high'}`}>{v ? 'Yes' : 'No'}</span>
                        ) : typeof v === 'object' && v !== null ? (
                          <span className="font-mono text-[11px] text-slate-500">{JSON.stringify(v).slice(0, 30)}...</span>
                        ) : (
                          String(v || '—')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400">
              {loading ? 'Loading academic database records...' : 'No records found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
