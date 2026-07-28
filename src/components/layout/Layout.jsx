import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f5f5f5' }}>
      <Sidebar collapsed={collapsed} />
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: collapsed ? 68 : 260 }}
      >
        <Header onToggleSidebar={() => setCollapsed(!collapsed)} sidebarCollapsed={collapsed} />
        <main className="flex-1 p-6 mt-16 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
