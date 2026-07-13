import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Menu, LogOut, User, Settings, Search } from 'lucide-react';

const breadcrumbMap = {
  '/': 'Dashboard',
  '/business': 'Business Management',
  '/users': 'App Users',
  '/partners': 'Partner Management',
  '/categories': 'Category Management',
  '/feed': 'Feed Posts',
  '/market': 'Market Listings',
  '/jobs': 'Job Postings',
  '/resume': 'Job Seeker Resumes',
  '/stories': 'Stories & News',
  '/notifications': 'Notification Center',
  '/banners': 'App Banner Management',
  '/plans': 'Subscription Plans',
};

export default function Header({ onToggleSidebar, sidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getPagePath = () => {
    const path = location.pathname;
    if (path.startsWith('/business/')) return 'Business Detail';
    return breadcrumbMap[path] || 'Dashboard';
  };

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 z-20 transition-all duration-300"
      style={{ left: sidebarCollapsed ? 68 : 260 }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
        >
          <Menu size={18} />
        </button>
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-gray-400">Lokonomy</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{getPagePath()}</span>
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
          <Search size={18} />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-xs">SA</span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Super Admin</p>
                <p className="text-xs text-gray-400 mt-0.5">admin@lokonomy.com</p>
              </div>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                <User size={15} className="text-gray-400" /> My Profile
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                <Settings size={15} className="text-gray-400" /> Settings
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler */}
      {showUserDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </header>
  );
}
