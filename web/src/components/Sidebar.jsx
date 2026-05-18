/**
 * Sidebar navigation component with cyberpunk aesthetic.
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Crosshair,
  Server,
  Flag,
  Wrench,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/targets', icon: Crosshair, label: 'Targets' },
  { to: '/vulnboxes', icon: Server, label: 'Vulnboxes' },
  { to: '/flagids', icon: Flag, label: 'Flag IDs' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-border bg-bg-secondary/80 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-cyber-green flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-text-primary tracking-wide">CTF Command</h1>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border space-y-2">
        <p className="text-[10px] text-text-muted text-center">A/D CTF Panel v1.0</p>
        <button
          id="sidebar-logout-btn"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Lock Panel
        </button>
      </div>
    </aside>
  );
}
