import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="admin-main">
          <Outlet />
        </main>
        <footer className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-100">
          © {new Date().getFullYear()} Shopperz Mart — Admin Panel
        </footer>
      </div>
    </div>
  );
}
