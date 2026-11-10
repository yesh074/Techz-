import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Header />
      <main
        className="transition-all duration-200"
        style={{
          marginLeft: collapsed ? '64px' : '240px',
          marginTop: '56px',
          padding: '24px',
          minHeight: 'calc(100vh - 56px)'
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
