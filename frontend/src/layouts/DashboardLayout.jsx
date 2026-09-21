import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cog,
  LayoutDashboard,
  Package,
  PlusCircle,
  MessageSquare,
  FileCheck,
  Calculator,
  Bookmark,
  Users,
  ShieldCheck,
  AlertTriangle,
  Layers,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Store,
  UserCheck
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, isBuyer, isSeller, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Build navigation items based on role
  let navItems = [];

  if (isBuyer) {
    navItems = [
      { name: 'Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
      { name: 'Browse Marketplace', path: '/marketplace', icon: Store },
      { name: 'Saved Wishlist', path: '/buyer/wishlist', icon: Bookmark },
      { name: 'My Purchase Requests', path: '/buyer/requests', icon: FileCheck },
      { name: 'My Inquiries', path: '/buyer/inquiries', icon: MessageSquare },
    ];
  } else if (isSeller) {
    navItems = [
      { name: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'My Listings', path: '/seller/listings', icon: Package },
      { name: 'Add Machine Part', path: '/seller/add-part', icon: PlusCircle },
      { name: 'Surplus Inventory Value', path: '/seller/inventory', icon: Calculator },
      { name: 'Inquiries Received', path: '/seller/inquiries', icon: MessageSquare },
      { name: 'Purchase Requests', path: '/seller/requests', icon: FileCheck },
    ];
  } else if (isAdmin) {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Listings Approval', path: '/admin/listings', icon: ShieldCheck },
      { name: 'User Directory', path: '/admin/users', icon: Users },
      { name: 'Categories Manager', path: '/admin/categories', icon: Layers },
      { name: 'Purchase Requests', path: '/admin/requests', icon: FileCheck },
      { name: 'Reported Listings', path: '/admin/reports', icon: AlertTriangle },
    ];
  }

  const roleLabel = isAdmin ? 'Admin Console' : isSeller ? 'Seller Portal' : 'Buyer Hub';
  const roleColor = isAdmin
    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    : isSeller
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-sky-500/10 text-sky-400 border-sky-500/30';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <Cog className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">MACHINE<span className="text-orange-500">X</span></span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen sticky top-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Cog className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">MACHINE<span className="text-orange-500">X</span></span>
              <p className="text-[10px] text-slate-400 font-medium">B2B Industrial Spares</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Profile */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-400 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.company_name || user?.email}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleColor}`}>
              {roleLabel}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1">{item.name}</span>
                {active && <ChevronRight className="w-4 h-4 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick link to main site & logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/marketplace"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Store className="w-4 h-4 text-orange-400" />
            Public Marketplace
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto h-screen">
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
