import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import ChatAssistantButton from './components/ai/ChatAssistantButton';
import { Navigate } from 'react-router-dom';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminPolicies = lazy(() => import('./pages/AdminPolicies'));
const WorkersView = lazy(() => import('./pages/WorkersView'));
const PoliciesPage = lazy(() => import('./pages/PoliciesPage'));
const ClaimsDashboard = lazy(() => import('./pages/ClaimsDashboard'));
const RiskAnalytics = lazy(() => import('./pages/RiskAnalytics'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const WorkerBenefits = lazy(() => import('./pages/WorkerBenefits'));
const ReportEmergency = lazy(() => import('./pages/ReportEmergency'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminClaimsCenter = lazy(() => import('./pages/AdminClaimsCenter'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = localStorage.getItem('shieldgig_user');
  if (!userStr) return <Navigate to="/login" replace />;
  
  const user = JSON.parse(userStr);
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/worker-dashboard'} replace />;
  }
  
  return children;
};

const DashboardLayout = ({ children }) => (
  <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Make page content stretch full width */}
      <div className="w-full">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
          <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              
              {/* Admin/Dashboard Routes */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><Dashboard /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/admin/dashboard"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminDashboard /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/admin/payments"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminPayments /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/workers"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><WorkersView /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/policies"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminPolicies /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/claims"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><ClaimsDashboard /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/admin/claims-verification"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminClaimsCenter /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/analytics"
                element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><RiskAnalytics /></DashboardLayout></></ProtectedRoute>}
              />
              
              {/* Worker Flow Routes */}
              <Route
                path="/worker-dashboard"
                element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><WorkerDashboard /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/worker/policies"
                element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><PoliciesPage /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/worker/claims"
                element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><ClaimsDashboard /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/worker/benefits"
                element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><WorkerBenefits /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/worker/report"
                element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><ReportEmergency /></DashboardLayout></></ProtectedRoute>}
              />
              <Route
                path="/worker/wallet"
                element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><WalletPage /></DashboardLayout></></ProtectedRoute>}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
              {/* Additional placeholder routes */}
              <Route
                path="/ai-insights"
                element={<><TopNav /><DashboardLayout><div className="p-8 text-center text-slate-500">AI Insights Coming Soon...</div></DashboardLayout></>}
              />
              <Route
                path="/settings"
                element={<><TopNav /><DashboardLayout><div className="p-8 text-center text-slate-500">Settings Coming Soon...</div></DashboardLayout></>}
              />
            </Routes>
          </Suspense>
          <ChatAssistantButton />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
