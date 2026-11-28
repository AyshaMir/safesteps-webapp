import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PlaceholderPage from './components/PlaceholderPage';
import HomePage from './features/home/HomePage';
import ProtectedRoute from './features/auth/ProtectedRoute';
import AdminRoute from './features/auth/AdminRoute';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ProfilePage from './features/auth/ProfilePage';
import AdminLayout from './features/admin/AdminLayout';
import AdminChecklistPage from './features/admin/checklist/AdminChecklistPage';

// Routes from PLAN.md §5. Placeholders mark screens other people are building.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Person 1 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/emergency/*" element={<PlaceholderPage title="I need help now" owner="Ayesha" />} />
          <Route path="/prepare/*" element={<PlaceholderPage title="Prepare" owner="Ayesha" />} />

          {/* Person 2 */}
          <Route path="/learn" element={<PlaceholderPage title="Learn" owner="Hafsa" />} />
          <Route path="/guides/:slug" element={<PlaceholderPage title="Guide" owner="Hafsa" />} />

          {/* Person 3 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/admin" element={<AdminRoute />}>
            <Route
              index
              element={
                <AdminLayout>
                  <h1 className="h1">Guides</h1>
                  <p className="muted">Coming soon (Hafsa is building this screen).</p>
                </AdminLayout>
              }
            />
            <Route path="checklist" element={<AdminChecklistPage />} />
            <Route path="*" element={<AdminLayout><p className="muted">Coming soon.</p></AdminLayout>} />
          </Route>

          <Route path="*" element={<PlaceholderPage title="Page not found" owner="nobody" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
