import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, UserCheck, Tag, Rss,
  ShoppingBag, Briefcase, FileText, BookOpen, Bell, Image,
  CreditCard, LogOut, ChevronRight, ChevronDown,
} from 'lucide-react';
import logo from '../../assets/lokonomy.svg';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config';

const navSections = [
  {
    title: 'MAIN',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/business', label: 'Business', icon: Building2 },
      { path: '/users', label: 'App Users', icon: Users },
      { path: '/partners', label: 'Partners', icon: UserCheck },
      { path: '/categories', label: 'Categories', icon: Tag },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { path: '/feed', label: 'Feed Posts', icon: Rss },
      { path: '/market', label: 'Market', icon: ShoppingBag },
      { path: '/jobs', label: 'Jobs', icon: Briefcase },
      { path: '/resume', label: 'Resumes', icon: FileText },
      { path: '/stories', label: 'Stories & News', icon: BookOpen },
    ],
  },
  {
    title: 'ENGAGE',
    items: [
      { path: '/notifications', label: 'Notifications', icon: Bell },
      { path: '/banners', label: 'App Banners', icon: Image },
      { path: '/plans', label: 'Plans', icon: CreditCard },
    ],
  },
];

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();

  const userString = localStorage.getItem('lokonomy_admin_user');
  const user = userString ? JSON.parse(userString) : { name: 'Super Admin', email: 'admin@lokonomy.com' };
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SA';

  const handleLogout = async () => {
    const token = localStorage.getItem('lokonomy_admin_token');
    localStorage.removeItem('lokonomy_admin_token');
    localStorage.removeItem('lokonomy_admin_user');
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`,
            'x-user-type': 'admin'
          },
          body: ''
        });
      } catch (err) {
        console.error('Logout API call failed:', err);
      }
    }
    
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full flex flex-col transition-all duration-300 z-30 bg-white border-r border-gray-100 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 border-b border-gray-100 px-4 flex-shrink-0">
        {collapsed ? (
          <div className="flex items-center justify-center w-full">
            <span className="text-xl font-extrabold" style={{ letterSpacing: '-1px' }}>
              <span style={{ color: '#f68e4c' }}>l</span><span style={{ color: '#26af61' }}>o</span>
            </span>
          </div>
        ) : (
          <img src={logo} alt="Lokonomy" className="h-7 object-contain" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-1">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="nav-section-title">{section.title}</p>
            )}
            {collapsed && <div className="h-3" />}
            {section.items.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg text-[13px] font-medium mb-0.5 transition-all duration-200 group ${
                    collapsed ? 'justify-center mx-2 px-2 py-2.5' : 'mx-3 px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
                title={collapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{label}</span>
                        <ChevronRight
                          size={14}
                          className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'opacity-100 text-primary' : 'text-gray-300'
                          }`}
                        />
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        ) : (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
