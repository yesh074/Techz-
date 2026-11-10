import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, User, ChevronDown, X, Cpu, Activity, Zap } from 'lucide-react'
import { useRealTime } from '../context/RealTimeContext'
import { aiApi, searchApi } from '../services/api'

function getBreadcrumb(pathname) {
  const map = {
    '/': 'Dashboard',
    '/students': 'Academics / Students',
    '/teachers': 'Academics / Teachers',
    '/courses': 'Academics / Courses',
    '/attendance': 'Academics / Attendance',
    '/exams': 'Academics / Examinations',
    '/assignments': 'Academics / Assignments',
    '/timetable': 'Academics / Timetable',
    '/books': 'Books / Book Library',
    '/intelligence': 'Books / Book Intelligence',
    '/ask-book': 'Books / Ask the Book',
    '/resources': 'Resources / Inventory',
    '/orders': 'Resources / Orders',
    '/track-orders': 'Resources / Track Orders',
    '/demand': 'AI Intelligence / Demand Prediction',
    '/recommendations': 'AI Intelligence / AI Recommendations',
    '/ai-activity': 'AI Intelligence / AI Activity',
    '/reports': 'Analytics / Reports',
    '/notifications': 'System / Notifications',
    '/settings': 'System / Settings',
  }
  const base = '/' + pathname.split('/')[1]
  return map[base] || map[pathname] || 'TECHZ'
}

export default function Header() {
  const { isConnected } = useRealTime()
  const location = useLocation()
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showAIStatus, setShowAIStatus] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [aiStatus, setAIStatus] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const breadcrumb = getBreadcrumb(location.pathname)

  useEffect(() => {
    aiApi.getNotifications().then(r => {
      setNotifications(r.data.slice(0, 6))
      setUnreadCount(r.data.filter(n => !n.read).length)
    }).catch(() => {})
  }, [location.pathname])

  async function handleSearch(e) {
    const q = e.target.value
    setSearchQuery(q)
    if (!q || q.length < 2) { setSearchResults(null); return }
    setSearching(true)
    try {
      const r = await searchApi.search(q)
      setSearchResults(r.data)
    } catch {}
    setSearching(false)
  }

  function openAIStatus() {
    setShowAIStatus(true)
    aiApi.getStatus().then(r => setAIStatus(r.data)).catch(() => {})
  }

  const severityColors = { error: 'text-red-600', warning: 'text-amber-600', success: 'text-emerald-600', info: 'text-blue-600' }
  const severityDots = { error: 'bg-red-500', warning: 'bg-amber-500', success: 'bg-emerald-500', info: 'bg-blue-500' }

  return (
    <header className="fixed top-0 right-0 left-0 h-14 bg-white border-b border-slate-200 z-20 flex items-center px-6 gap-4">
      {/* Breadcrumb */}
      <div className="flex-1 text-sm text-slate-500 font-medium">{breadcrumb}</div>

      {/* Search trigger */}
      <button
        onClick={() => setShowSearch(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 hover:border-primary-300 hover:text-slate-600 transition-colors w-52"
      >
        <Search size={13} />
        <span className="flex-1 text-left">Search anything...</span>
        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">⌘K</span>
      </button>

      {/* AI Status pill */}
      <button
        onClick={openAIStatus}
        className="ai-indicator bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
      >
        <span className="ai-dot"></span>
        <span className="text-xs font-medium text-emerald-700">TECHZ AI {isConnected ? 'Online' : 'Connecting...'}</span>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-slate-200 shadow-card-lg z-50 animate-fadeIn">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              <button onClick={() => setShowNotif(false)}><X size={14} className="text-slate-400" /></button>
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-slate-400">No notifications</div>
              )}
              {notifications.map((n, i) => (
                <div key={i} className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/40' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${severityDots[n.severity] || 'bg-slate-400'}`}></span>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{n.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 text-center">
              <button onClick={() => { navigate('/notifications'); setShowNotif(false) }} className="text-xs text-primary-600 font-medium hover:underline">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
          <User size={14} className="text-primary-700" />
        </div>
        <span className="text-sm font-medium text-slate-700">Yogesh</span>
        <ChevronDown size={13} className="text-slate-400" />
      </button>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-24 animate-fadeIn" onClick={(e) => { if (e.target === e.currentTarget) { setShowSearch(false); setSearchQuery(''); setSearchResults(null) } }}>
          <div className="w-[560px] bg-white rounded-2xl shadow-card-lg border border-slate-200">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search students, books, orders, courses..."
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none"
                value={searchQuery}
                onChange={handleSearch}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults(null) }}>
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            {searching && (
              <div className="px-4 py-6 text-center text-sm text-slate-400">Searching...</div>
            )}
            {searchResults && (
              <div className="max-h-96 overflow-y-auto py-2">
                {Object.entries(searchResults.categories).map(([cat, items]) => {
                  if (!items.length) return null
                  return (
                    <div key={cat} className="mb-2">
                      <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{cat}</div>
                      {items.slice(0, 4).map((item, i) => (
                        <button
                          key={i}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                          onClick={() => { navigate(item.url || '/'); setShowSearch(false); setSearchQuery(''); setSearchResults(null) }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary-600">{cat[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{item.title}</div>
                            <div className="text-xs text-slate-400">{item.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
                {searchResults.total_results === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">No results found for "{searchQuery}"</div>
                )}
              </div>
            )}
            {!searchResults && !searching && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">Type to search across books, students, orders, and more...</div>
            )}
          </div>
        </div>
      )}

      {/* AI Status Modal */}
      {showAIStatus && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-24 animate-fadeIn" onClick={(e) => { if (e.target === e.currentTarget) setShowAIStatus(false) }}>
          <div className="w-80 bg-white rounded-2xl shadow-card-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-primary-600" />
                <span className="font-semibold text-slate-800">TECHZ AI Status</span>
              </div>
              <button onClick={() => setShowAIStatus(false)}><X size={14} className="text-slate-400" /></button>
            </div>
            {aiStatus ? (
              <div className="space-y-3">
                {Object.entries(aiStatus.agents || {}).map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{name}</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {status}
                    </span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  Autonomous Loop: {aiStatus.autonomous_loop} · Last Cycle: {aiStatus.last_cycle}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-400">Loading status...</div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
