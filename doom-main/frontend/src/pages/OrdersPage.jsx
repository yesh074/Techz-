import { useState, useEffect } from 'react'
import {
  ShoppingCart, CheckCircle, Clock, Truck, Plus, Check,
  AlertCircle, Sparkles, Filter, ChevronRight, RefreshCw
} from 'lucide-react'
import { ordersApi, booksApi } from '../services/api'
import { useRealTime } from '../context/RealTimeContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const STATUS_BADGE = {
  'AI Recommended': 'badge-recommended',
  'Processing': 'badge-processing',
  'Delivered': 'badge-delivered',
  'Pending': 'badge-pending',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { subscribe } = useRealTime()
  const [orders, setOrders] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBookId, setNewBookId] = useState('')
  const [newQty, setNewQty] = useState(25)
  const [newSupplier, setNewSupplier] = useState('Pearson Education')

  useEffect(() => {
    loadOrders()
    booksApi.list().then(res => {
      setBooks(res.data || [])
      if (res.data?.length > 0) setNewBookId(res.data[0].book_id)
    }).catch(() => {})

    const unsub = subscribe('INVENTORY_UPDATED', () => loadOrders())
    return unsub
  }, [])

  function loadOrders() {
    setLoading(true)
    ordersApi.list().then(res => {
      setOrders(res.data || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      toast.error('Failed to load orders')
    })
  }

  async function handleApprove(orderId) {
    try {
      await ordersApi.approve(orderId)
      toast.success('Order approved! Inventory stock replenished in real-time.')
      loadOrders()
    } catch {
      toast.error('Approval failed')
    }
  }

  async function handleCreateOrder(e) {
    e.preventDefault()
    try {
      await ordersApi.create({
        book_id: newBookId,
        quantity: parseInt(newQty, 10),
        supplier: newSupplier,
        notes: 'Manual staff requisition order'
      })
      toast.success('Order created successfully')
      setShowCreateModal(false)
      loadOrders()
    } catch {
      toast.error('Failed to create order')
    }
  }

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingCart size={16} />
            <span>Procurement & AI Supply Automation</span>
          </div>
          <h1 className="page-title text-2xl">Textbook & Resource Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve AI-recommended textbook requisitions with automatic inventory updating.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/track-orders')}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Truck size={14} />
            <span>Track Shipments</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create Requisition</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['ALL', 'AI Recommended', 'Processing', 'Delivered'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === status
                ? 'bg-primary-50 text-primary-700 font-bold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {status === 'ALL' ? `All Orders (${orders.length})` : status}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((ord, idx) => {
          const item = ord.items?.[0] || {}
          return (
            <div key={idx} className="card p-5 space-y-4 hover:shadow-card-hover transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    #{ord.order_number || ord.order_id?.slice(0, 8)}
                  </span>
                  <span className={`badge ${STATUS_BADGE[ord.status] || 'badge-pending'}`}>
                    {ord.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title || ord.title || 'Textbook Order'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supplier: <span className="text-slate-700 font-medium">{ord.supplier || 'Direct University Press'}</span>
                </p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-bold text-slate-800">{item.quantity || ord.quantity || 20} copies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Total</span>
                    <span className="font-bold text-slate-800">${ord.total_amount || 1250}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested</span>
                    <span className="text-slate-600">{ord.order_date || 'Today'}</span>
                  </div>
                </div>

                {ord.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2.5">
                    "{ord.notes}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/track-orders?id=${ord.order_id}`)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                >
                  <Truck size={12} />
                  <span>Timeline</span>
                </button>

                {ord.status === 'AI Recommended' || ord.status === 'Pending' ? (
                  <button
                    onClick={() => handleApprove(ord.order_id)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Approve Order</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle size={14} />
                    <span>Processed</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {filteredOrders.length === 0 && !loading && (
          <div className="col-span-full card p-12 text-center text-slate-400">
            No orders matching the selected filter.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900">Create Procurement Requisition</h3>
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Textbook Title</label>
                <select
                  value={newBookId}
                  onChange={(e) => setNewBookId(e.target.value)}
                  className="input text-xs"
                >
                  {books.map(b => (
                    <option key={b.book_id} value={b.book_id}>
                      {b.title} (Stock: {b.current_stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vendor / Publisher</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Generate Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
