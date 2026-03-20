import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Users, FileText, Activity, ShieldAlert, Heart, Siren, BrainCircuit, Settings, Wallet, CreditCard, ShieldCheck, Layers } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isWorkerFlow = location.pathname === '/worker-dashboard' || location.pathname.startsWith('/worker/');

  const adminNav = [
    { name: 'Home', path: '/admin/dashboard', icon: Home },
    { name: 'Platform Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workers', path: '/workers', icon: Users },
    { name: 'All Policies', path: '/policies', icon: FileText },
    { name: 'Claims Center', path: '/claims', icon: Activity },
    { name: 'Incidents Verification', path: '/admin/claims-verification', icon: ShieldCheck },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Risk Analytics', path: '/analytics', icon: ShieldAlert },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const workerNav = [
    { name: 'Home', path: '/worker-dashboard', icon: Home },
    { name: 'My Policies', path: '/worker/policies', icon: FileText },
    { name: 'My Claims', path: '/worker/claims', icon: Activity },
    { name: 'Report Emergency', path: '/worker/report', icon: Siren },
    { name: 'My Wallet', path: '/worker/wallet', icon: Wallet },
    { name: 'Worker Benefits', path: '/worker/benefits', icon: Heart },
  ];

  const navItems = isWorkerFlow ? workerNav : adminNav;

  return (
    <div className="w-64 flex flex-col pt-4 px-4 h-full bg-[#0F172A] border-r border-[#1F2937]">
      <nav className="flex-1 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:bg-[#111827] hover:text-slate-100'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="py-6 text-xs text-slate-500 text-center">
        © 2026 ShieldGig
      </div>
    </div>
  );
};

export default Sidebar;
