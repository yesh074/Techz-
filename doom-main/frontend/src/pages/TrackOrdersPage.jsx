import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Truck, CheckCircle, Clock, Package, MapPin, ArrowLeft,
  Calendar, Building2, ShieldCheck, ChevronRight
} from 'lucide-react'
import { ordersApi } from '../services/api'
import toast from 'react-hot-toast'

const STAGES = [
  { id: 'Pending', label: 'Order Created', desc: 'Requisition generated' },
  { id: 'AI Recommended', label: 'AI Validated', desc: 'Demand verified by orchestrator' },
  { id: 'Processing', label: 'Processing & Packaged', desc: 'Publisher preparing dispatch' },
  { id: 'Delivered', label: 'Delivered & Stocked', desc: 'Central inventory replenished' }
]

export default function TrackOrdersPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialOrderId = searchParams.get('id')

  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.list().then(res => {
      const ords = res.data || []
      setOrders(ords)
      setLoading(false)
      if (initialOrderId) {
        const match = ords.find(o => o.order_id === initialOrderId)
        if (match) setSelectedOrder(match)
        else if (ords.length > 0) setSelectedOrder(ords[0])
      } else if (ords.length > 0) {
        setSelectedOrder(ords[0])
      }
    }).catch(() => {
      setLoading(false)
      toast.error('Could not load orders')
    })
  }, [initialOrderId])

  function getActiveStageIndex(status) {
    if (status === 'Delivered') return 3
    if (status === 'Processing') return 2
    if (status === 'AI Recommended') return 1
    return 0
  }

  const activeIdx = selectedOrder ? getActiveStageIndex(selectedOrder.status) : 0

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-1 text-xs text-primary-600 font-medium mb-1 hover:underline"
          >
            <ArrowLeft size={12} /> Back to Orders
          </button>
          <h1 className="page-title text-2xl">Requisition & Logistics Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time supply pipeline updates and vendor delivery confirmations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Selector List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Requisitions ({orders.length})
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {orders.map(o => {
              const isSelected = selectedOrder?.order_id === o.order_id
              const item = o.items?.[0] || {}
              return (
                <div
                  key={o.order_id}
                  onClick={() => setSelectedOrder(o)}
                  className={`card p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'border-primary-500 bg-primary-50/50 shadow-sm' : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                    <span>#{o.order_number || o.order_id?.slice(0, 8)}</span>
                    <span className="font-semibold text-slate-700">{o.status}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.title || o.title || 'Course Textbook'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {item.quantity || o.quantity || 20} copies · {o.supplier}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tracking Details View */}
        <div className="md:col-span-2 card p-6 space-y-6">
          {selectedOrder ? (
            <>
              {/* Order Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-400 font-mono">
                    Tracking ID: TECHZ-LOG-{selectedOrder.order_id?.slice(0, 8).toUpperCase()}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedOrder.items?.[0]?.title || selectedOrder.title || 'Textbook Consignment'}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Publisher / Vendor: <strong>{selectedOrder.supplier}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Estimated Delivery</div>
                  <div className="text-sm font-bold text-primary-700">
                    {selectedOrder.status === 'Delivered' ? 'Completed' : 'Within 3 Business Days'}
                  </div>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="py-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                  Logistics Milestones
                </h4>
                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {STAGES.map((stg, i) => {
                    const isDone = i <= activeIdx
                    const isCurrent = i === activeIdx
                    return (
                      <div key={stg.id} className="relative flex items-start gap-4 pl-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                            isDone
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-400 border border-slate-300'
                          }`}
                        >
                          {isDone ? <CheckCircle size={14} /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${isCurrent ? 'text-primary-700' : 'text-slate-800'}`}>
                            {stg.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {stg.desc}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Items & Delivery Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Destination</div>
                  <div className="font-semibold text-slate-800">TECHZ Central Library & Bookstore</div>
                  <div className="text-slate-500">Academic Block 4, Ground Floor</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Package Contents</div>
                  <div className="font-semibold text-slate-800">
                    {selectedOrder.items?.[0]?.quantity || selectedOrder.quantity || 20} Textbook Units
                  </div>
                  <div className="text-slate-500">Autonomous RFID tagging applied upon intake</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select an order on the left to inspect its live supply chain progress.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
