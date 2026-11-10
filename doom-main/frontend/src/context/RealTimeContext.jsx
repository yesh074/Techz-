import { createContext, useContext, useEffect, useState, useRef } from 'react'

const RealTimeContext = createContext(null)

export function RealTimeProvider({ children }) {
  const [lastEvent, setLastEvent] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef(null)
  const listenersRef = useRef({})

  useEffect(() => {
    connectSSE()
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close()
    }
  }, [])

  function connectSSE() {
    if (eventSourceRef.current) eventSourceRef.current.close()

    const es = new EventSource('/api/realtime/stream')
    eventSourceRef.current = es

    es.onopen = () => setIsConnected(true)

    es.addEventListener('connected', () => setIsConnected(true))

    const eventTypes = [
      'AI_ACTIVITY', 'DEMAND_UPDATED', 'ORDER_RECOMMENDATION',
      'INVENTORY_UPDATED', 'NOTIFICATION'
    ]

    eventTypes.forEach(type => {
      es.addEventListener(type, (e) => {
        try {
          const data = JSON.parse(e.data)
          const event = { type, data, timestamp: new Date() }
          setLastEvent(event)

          const handlers = listenersRef.current[type] || []
          handlers.forEach(h => h(data))
        } catch (err) {
          // ignore parse errors
        }
      })
    })

    es.onerror = () => {
      setIsConnected(false)
      setTimeout(connectSSE, 5000)
    }
  }

  function subscribe(eventType, handler) {
    if (!listenersRef.current[eventType]) listenersRef.current[eventType] = []
    listenersRef.current[eventType].push(handler)
    return () => {
      listenersRef.current[eventType] = (listenersRef.current[eventType] || []).filter(h => h !== handler)
    }
  }

  return (
    <RealTimeContext.Provider value={{ isConnected, lastEvent, subscribe }}>
      {children}
    </RealTimeContext.Provider>
  )
}

export function useRealTime() {
  return useContext(RealTimeContext)
}
