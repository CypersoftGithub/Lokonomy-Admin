import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f5f5f5' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#26af61', secondary: 'white' } },
          error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }}
      />
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
