import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { RealTimeProvider } from './context/RealTimeContext'
import MainLayout from './layouts/MainLayout'

import Dashboard from './pages/Dashboard'
import BookLibraryPage from './pages/books/BookLibraryPage'
import BookIntelligencePage from './pages/BookIntelligencePage'
import AskBookPage from './pages/AskBookPage'
import DemandPage from './pages/DemandPage'
import OrdersPage from './pages/OrdersPage'
import TrackOrdersPage from './pages/TrackOrdersPage'
import AIActivityPage from './pages/AIActivityPage'
import AcademicsPage from './pages/AcademicsPage'
import ResourcesPage from './pages/ResourcesPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <RealTimeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '13px',
              borderRadius: '8px',
            }
          }}
        />
        <Routes>
          <Route element={<MainLayout />}>
            {/* Overview */}
            <Route path="/" element={<Dashboard />} />

            {/* Books & AI Intelligence */}
            <Route path="/books" element={<BookLibraryPage />} />
            <Route path="/intelligence" element={<BookIntelligencePage />} />
            <Route path="/ask-book" element={<AskBookPage />} />

            {/* Resource Management & Orders */}
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/track-orders" element={<TrackOrdersPage />} />

            {/* AI Intelligence & Predictions */}
            <Route path="/demand" element={<DemandPage />} />
            <Route path="/recommendations" element={<OrdersPage />} />
            <Route path="/ai-activity" element={<AIActivityPage />} />

            {/* Academics Management */}
            <Route path="/students" element={<AcademicsPage defaultTab="students" />} />
            <Route path="/teachers" element={<AcademicsPage defaultTab="teachers" />} />
            <Route path="/courses" element={<AcademicsPage defaultTab="courses" />} />
            <Route path="/attendance" element={<AcademicsPage defaultTab="attendance" />} />
            <Route path="/exams" element={<AcademicsPage defaultTab="exams" />} />
            <Route path="/assignments" element={<AcademicsPage defaultTab="assignments" />} />
            <Route path="/timetable" element={<AcademicsPage defaultTab="timetable" />} />
            <Route path="/reports" element={<DemandPage />} />

            {/* System */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RealTimeProvider>
  )
}
