import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { admin, logout } = useAuth();

  return (
    <header className="admin-navbar">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="btn-outline p-2 md:hidden">
          <FiMenu size={20} />
        </button>
        <span className="text-sm font-medium text-slate-500 hidden sm:block">Admin Dashboard</span>
      </div>
      <div className="nav-right">
        <div className="flex items-center gap-2">
          <div className="admin-avatar">{(admin?.email || 'A')[0].toUpperCase()}</div>
          <span className="text-sm font-semibold hidden sm:block">{admin?.email || 'Admin'}</span>
        </div>
        <button onClick={logout} className="btn-outline flex items-center gap-1.5" title="Logout">
          <FiLogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
