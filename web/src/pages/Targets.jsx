/**
 * Targets page — Passive network matrix display.
 */
import { useState } from 'react';
import { Crosshair, Search, Shield, Bot, Users } from 'lucide-react';
import { useTargets } from '../hooks/useTargets';
import CopyButton from '../components/CopyButton';

export default function Targets() {
  const { targets, loading, fetchTargets } = useTargets();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, own, npc, enemy

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Target Matrix</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-16" />)}
        </div>
      </div>
    );
  }

  const teams = targets?.teams || [];
  const filtered = teams.filter((team) => {
    if (filter === 'own' && !team.is_own) return false;
    if (filter === 'npc' && !team.is_npc) return false;
    if (filter === 'enemy' && (team.is_own || team.is_npc)) return false;
    if (search && !team.label.toLowerCase().includes(search.toLowerCase()) && !String(team.team_id).includes(search)) return false;
    return true;
  });

  // Sort: own team first, then NPCs, then enemies
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_own) return -1;
    if (b.is_own) return 1;
    if (a.is_npc && !b.is_npc) return -1;
    if (!a.is_npc && b.is_npc) return 1;
    return a.team_id - b.team_id;
  });

  const filterButtons = [
    { key: 'all', label: 'All', icon: Users },
    { key: 'own', label: 'Own', icon: Shield },
    { key: 'npc', label: 'NPCs', icon: Bot },
    { key: 'enemy', label: 'Enemies', icon: Crosshair },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Target Matrix</h1>
          <p className="text-text-secondary text-sm mt-1">Passive IP grid — no network scanning</p>
        </div>
        <button onClick={fetchTargets} className="btn-glow text-sm">Refresh</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input-dark pl-9"
            placeholder="Search by team ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-bg-secondary border border-border">
          {filterButtons.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === key
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix */}
      <div className="space-y-3">
        {sorted.map((team) => (
          <div
            key={team.team_id}
            className={`glass-card p-4 ${
              team.is_own ? 'border-success/40 bg-success/5' : team.is_npc ? 'border-warning/30 bg-warning/5' : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold text-text-primary">{team.label}</span>
              <span className="text-xs text-text-muted">ID: {team.team_id}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {team.targets.map((target) => (
                <div
                  key={target.vulnbox_id}
                  className="bg-bg-primary/60 rounded-lg p-2 border border-border/50 hover:border-accent/50 transition-colors group"
                >
                  <p className="text-[10px] text-text-muted mb-0.5">VBox {target.vulnbox_id}</p>
                  <p className="text-xs font-mono text-text-primary mb-1 truncate">{target.ip}</p>
                  {target.services.length > 0 && (
                    <div className="space-y-0.5 mb-1">
                      {target.services.map((svc, i) => (
                        <p key={i} className="text-[9px] text-cyber-green truncate">{svc}</p>
                      ))}
                    </div>
                  )}
                  <CopyButton text={target.ip} label="IP" className="w-full justify-center opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
