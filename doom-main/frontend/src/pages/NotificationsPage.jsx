import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import { aiApi } from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifs()
  }, [])

  function loadNotifs() {
    setLoading(true)
    aiApi.getNotifications().then(res => {
      setNotifs(res.data || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      toast.error('Failed to load notifications')
    })
  }

  async function handleMarkRead(id) {
    try {
      await aiApi.markRead(id)
      setNotifs(prev => prev.map(n => n.notification_id === id ? { ...n, read: true } : n))
      toast.success('Marked as read')
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="page-title text-2xl">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts, replenishment triggers, and student activity notices.
          </p>
        </div>
        <button onClick={loadNotifs} className="btn-secondary text-xs flex items-center gap-1.5">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden">
        {notifs.map((n, idx) => (
          <div
            key={idx}
            className={`p-4 flex items-start justify-between gap-4 transition-colors ${
              n.read ? 'bg-white' : 'bg-primary-50/30'
            }`}
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-slate-300' : 'bg-primary-600'}`}></span>
                <span className="font-bold text-slate-800">{n.title}</span>
                <span className="text-slate-400 font-mono text-[10px]">{n.timestamp}</span>
              </div>
              <p className="text-slate-600 pl-4">{n.message}</p>
              {n.action_url && (
                <div className="pl-4 pt-1">
                  <button
                    onClick={() => navigate(n.action_url)}
                    className="text-[11px] text-primary-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    Take Action <ExternalLink size={11} />
                  </button>
                </div>
              )}
            </div>

            {!n.read && (
              <button
                onClick={() => handleMarkRead(n.notification_id)}
                className="text-xs text-slate-400 hover:text-primary-600 p-1 rounded"
                title="Mark as read"
              >
                <Check size={16} />
              </button>
            )}
          </div>
        ))}

        {notifs.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications at this time.
          </div>
        )}
      </div>
    </div>
  )
}
