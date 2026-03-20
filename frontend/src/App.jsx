import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import AdminDashboard from './pages/AdminDashboard';
import AdminPolicies from './pages/AdminPolicies';
import WorkersView from './pages/WorkersView';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsDashboard from './pages/ClaimsDashboard';
import RiskAnalytics from './pages/RiskAnalytics';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerBenefits from './pages/WorkerBenefits';
import ReportEmergency from './pages/ReportEmergency';
import WalletPage from './pages/WalletPage';
import AdminPayments from './pages/AdminPayments';
import AdminClaimsCenter from './pages/AdminClaimsCenter';
import Dashboard from './pages/Dashboard';
import ChatAssistantButton from './components/ai/ChatAssistantButton';
import { Navigate } from 'react-router-dom';

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
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
            {/* Admin/Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><Dashboard /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminDashboard /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminPayments /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/workers" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><WorkersView /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/policies" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminPolicies /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><ClaimsDashboard /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/admin/claims-verification" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><AdminClaimsCenter /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRole="admin"><><TopNav /><DashboardLayout><RiskAnalytics /></DashboardLayout></></ProtectedRoute>} />
            
            {/* Worker Flow Routes */}
            <Route path="/worker-dashboard" element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><WorkerDashboard /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/worker/policies" element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><PoliciesPage /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/worker/claims" element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><ClaimsDashboard /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/worker/benefits" element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><WorkerBenefits /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/worker/report" element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><ReportEmergency /></DashboardLayout></></ProtectedRoute>} />
            <Route path="/worker/wallet" element={<ProtectedRoute allowedRole="worker"><><TopNav /><DashboardLayout><WalletPage /></DashboardLayout></></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
            {/* Additional placeholder routes */}
            <Route path="/ai-insights" element={<><TopNav /><DashboardLayout><div className="p-8 text-center text-slate-500">AI Insights Coming Soon...</div></DashboardLayout></>} />
            <Route path="/settings" element={<><TopNav /><DashboardLayout><div className="p-8 text-center text-slate-500">Settings Coming Soon...</div></DashboardLayout></>} />
          </Routes>
          <ChatAssistantButton />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
