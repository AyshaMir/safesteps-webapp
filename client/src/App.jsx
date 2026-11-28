import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'

// Person 1
import Home from './Home'
import EmergencyPicker from './features/emergency/EmergencyPicker'
import EmergencySteps from './features/emergency/EmergencySteps'
import WhatNow from './features/emergency/WhatNow'
import PrepareHome from './features/prepare/PrepareHome'
import PrepareIntro from './features/prepare/PrepareIntro'
import EmergencyPlan from './features/prepare/EmergencyPlan'
import KitChecklist from './features/prepare/KitChecklist'
import EmergencyContacts from './features/prepare/EmergencyContacts'

// Person 3
import LoginPage from './features/auth/LoginPage'
import SignupPage from './features/auth/SignupPage'
import ProfilePage from './features/auth/ProfilePage'
import ProtectedRoute from './features/auth/ProtectedRoute'
import AdminRoute from './features/auth/AdminRoute'
import AdminLayout from './features/admin/AdminLayout'
import AdminChecklistPage from './features/admin/checklist/AdminChecklistPage'

// Shared components
import PlaceholderPage from './components/PlaceholderPage'
import LoadingPage from './components/LoadingPage'

function PrepareAccess({ children }) {
  const { user, ready } = useAuth()

  if (!ready) return <LoadingPage />

  return user ? children : <PrepareIntro />
}

function AppRoutes() {
  return (
    <Routes>

      {/* Person 1 — Home and Emergency Mode */}

      <Route path="/" element={<Home />} />

      <Route
        path="/emergency"
        element={<EmergencyPicker />}
      />

      <Route
        path="/emergency/:slug"
        element={<EmergencySteps />}
      />

      <Route
        path="/emergency/:slug/done"
        element={<WhatNow />}
      />

      {/* Person 1 — Prepare */}

      <Route
        path="/prepare"
        element={
          <PrepareAccess>
            <PrepareHome />
          </PrepareAccess>
        }
      />

      <Route
        path="/prepare/plan"
        element={
          <PrepareAccess>
            <EmergencyPlan />
          </PrepareAccess>
        }
      />

      <Route
        path="/prepare/checklist"
        element={
          <PrepareAccess>
            <KitChecklist />
          </PrepareAccess>
        }
      />

      <Route
        path="/prepare/contacts"
        element={
          <PrepareAccess>
            <EmergencyContacts />
          </PrepareAccess>
        }
      />

      {/* Person 2 — Learn and Guides */}

      <Route
        path="/learn"
        element={
          <PlaceholderPage title="Learn" owner="Hafsa" />
        }
      />

      <Route
        path="/guides/:slug"
        element={
          <PlaceholderPage title="Guide" owner="Hafsa" />
        }
      />

      {/* Person 3 — Authentication */}

      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin access */}

      <Route path="/admin" element={<AdminRoute />}>
        <Route
          index
          element={
            <AdminLayout>
              <h1>Guides</h1>
              <p>Coming soon.</p>
            </AdminLayout>
          }
        />

        <Route
          path="checklist"
          element={<AdminChecklistPage />}
        />

        <Route
          path="*"
          element={
            <AdminLayout>
              <p>Page not found.</p>
            </AdminLayout>
          }
        />
      </Route>

      {/* Unknown routes */}

      <Route
        path="*"
        element={
          <PlaceholderPage title="Page not found" owner="nobody" />
        }
      />

    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App