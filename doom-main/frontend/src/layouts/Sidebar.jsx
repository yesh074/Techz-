import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Clock, FileText,
  CalendarDays, BookMarked, Library, Brain, MessageSquare,
  Package, ShoppingCart, Truck, BarChart3, TrendingUp, Sparkles,
  Activity, Bell, Settings, ChevronDown, ChevronRight, Boxes
} from 'lucide-react'

const sections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    label: 'Academics',
    items: [
      { label: 'Students', icon: Users, path: '/students' },
      { label: 'Teachers', icon: GraduationCap, path: '/teachers' },
      { label: 'Courses', icon: BookOpen, path: '/courses' },
      { label: 'Attendance', icon: Clock, path: '/attendance' },
      { label: 'Examinations', icon: FileText, path: '/exams' },
      { label: 'Assignments', icon: FileText, path: '/assignments' },
      { label: 'Timetable', icon: CalendarDays, path: '/timetable' },
    ]
  },
  {
    label: 'Books',
    items: [
      { label: 'Book Library', icon: Library, path: '/books' },
      { label: 'Book Intelligence', icon: Brain, path: '/intelligence' },
      { label: 'Ask the Book', icon: MessageSquare, path: '/ask-book' },
    ]
  },
  {
    label: 'Resources',
    items: [
      { label: 'Resource Inventory', icon: Boxes, path: '/resources' },
      { label: 'Orders', icon: ShoppingCart, path: '/orders' },
      { label: 'Track Orders', icon: Truck, path: '/track-orders' },
    ]
  },
  {
    label: 'AI Intelligence',
    items: [
      { label: 'Demand Prediction', icon: TrendingUp, path: '/demand' },
      { label: 'AI Recommendations', icon: Sparkles, path: '/recommendations' },
      { label: 'AI Activity', icon: Activity, path: '/ai-activity' },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Reports', icon: BarChart3, path: '/reports' },
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ]
  },
]

export default function Sidebar({ collapsed, onCollapse }) {
  const location = useLocation()
  const [openSections, setOpenSections] = useState(
    sections.reduce((a, s) => ({ ...a, [s.label]: true }), {})
  )

  function toggleSection(label) {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-30 flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 min-h-[60px]">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">TECHZ</div>
            <div className="text-[10px] text-slate-400 leading-tight">AI Education ERP</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {sections.map(section => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-1 mb-1"
              >
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{section.label}</span>
                {openSections[section.label]
                  ? <ChevronDown size={11} className="text-slate-400" />
                  : <ChevronRight size={11} className="text-slate-400" />}
              </button>
            )}

            {(collapsed || openSections[section.label]) && section.items.map(item => {
              const Icon = item.icon
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon size={16} className={`flex-shrink-0 sidebar-icon ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight size={16} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  )
}
