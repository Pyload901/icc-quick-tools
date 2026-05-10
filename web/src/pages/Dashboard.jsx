/**
 * Dashboard — Overview page with key metrics and quick links.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Flag, Wrench, Crosshair, Activity, Zap, Trophy, ExternalLink } from 'lucide-react';
import api from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [scoreboardUrl, setScoreboardUrl] = useState('http://10.10.0.1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, flagStatsRes, toolsRes, vulnboxesRes, urlsRes] = await Promise.allSettled([
          api.get('/config'),
          api.get('/flagids/stats'),
          api.get('/tools'),
          api.get('/vulnboxes'),
          api.get('/config/urls'),
        ]);

        if (urlsRes.status === 'fulfilled') setScoreboardUrl(urlsRes.value.data.scoreboard_url);

        if (configRes.status === 'fulfilled') setConfig(configRes.value.data);

        const flagStats = flagStatsRes.status === 'fulfilled' ? flagStatsRes.value.data : {};
        const tools = toolsRes.status === 'fulfilled' ? toolsRes.value.data : [];
        const vulnboxes = vulnboxesRes.status === 'fulfilled' ? vulnboxesRes.value.data : [];

        const scannedBoxes = vulnboxes.filter((v) => v.services.length > 0).length;
        const totalServices = vulnboxes.reduce((acc, v) => acc + v.services.length, 0);

        setStats({
          totalServices,
          scannedBoxes,
          totalFlagIds: flagStats.total_flag_ids || 0,
          totalTools: tools.length,
          fetcherRunning: flagStats.fetcher_running || false,
          lastFetchAt: flagStats.last_fetch_at,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const quickLinks = [
    { to: '/targets', icon: Crosshair, label: 'Target Matrix', desc: 'View all team IPs', color: 'text-cyber-pink' },
    { to: '/vulnboxes', icon: Server, label: 'Vulnboxes', desc: 'Manage your infrastructure', color: 'text-cyber-green' },
    { to: '/flagids', icon: Flag, label: 'Flag IDs', desc: 'Intelligence data', color: 'text-warning' },
    { to: '/tools', icon: Wrench, label: 'Tools', desc: 'External tool links', color: 'text-accent' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Command Center</h1>
        <p className="text-text-secondary mt-1">
          {config ? `Team ${config.team_id} — Tick: ${config.game_tick_seconds}s` : 'Loading...'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Server}
          label="Services Found"
          value={stats?.totalServices ?? '—'}
          color="green"
          subtitle={`${stats?.scannedBoxes ?? 0}/10 boxes scanned`}
        />
        <StatCard
          icon={Flag}
          label="Flag IDs"
          value={stats?.totalFlagIds ?? '—'}
          color="yellow"
          subtitle={stats?.fetcherRunning ? 'Fetcher running' : 'Fetcher stopped'}
        />
        <StatCard
          icon={Wrench}
          label="Tools Saved"
          value={stats?.totalTools ?? '—'}
          color="accent"
        />
        <StatCard
          icon={Activity}
          label="Fetcher Status"
          value={stats?.fetcherRunning ? 'ACTIVE' : 'IDLE'}
          color={stats?.fetcherRunning ? 'cyan' : 'pink'}
          subtitle={stats?.lastFetchAt ? `Last: ${new Date(stats.lastFetchAt).toLocaleTimeString()}` : 'Never fetched'}
        />
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-warning" /> Quick Access
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} className="glass-card p-5 group cursor-pointer block">
            <Icon className={`w-8 h-8 ${color} mb-3 group-hover:scale-110 transition-transform`} />
            <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
            <p className="text-xs text-text-muted mt-1">{desc}</p>
          </Link>
        ))}

        {/* Scoreboard — external link */}
        <a
          id="scoreboard-quick-link"
          href={scoreboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-5 group cursor-pointer block"
          style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(17,24,39,0.6))' }}
        >
          <div className="relative">
            <Trophy className="w-8 h-8 text-warning mb-3 group-hover:scale-110 transition-transform" />
            <ExternalLink className="w-3 h-3 text-text-muted absolute -top-0.5 right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Scoreboard</h3>
          <p className="text-xs text-text-muted mt-1 truncate" title={scoreboardUrl}>{scoreboardUrl}</p>
        </a>
      </div>
    </div>
  );
}
