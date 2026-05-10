import { useState } from 'react';
import { Flag, RefreshCw, Play, Square, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useFlagIds } from '../hooks/useFlagIds';
import StatusBadge from '../components/StatusBadge';

export default function FlagIds() {
  const { flagIds, availableServices, fetcherStatus, loading, filters, page, autoRefresh, setAutoRefresh, applyFilters, changePage, startFetcher, stopFetcher, fetchFlagIds, fetchStatus } = useFlagIds();
  const [localFilters, setLocalFilters] = useState({ service: '', team_id: '', round: '' });

  const handleFilter = (e) => {
    e.preventDefault();
    applyFilters(localFilters);
  };

  const totalPages = Math.ceil(flagIds.total / flagIds.page_size) || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Flag IDs</h1>
          <p className="text-text-secondary text-sm mt-1">Intelligence data for manual exploitation</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={fetcherStatus.running ? 'running' : 'stopped'} label={fetcherStatus.running ? 'Fetcher Running' : 'Fetcher Stopped'} />
          {fetcherStatus.running ? (
            <button onClick={stopFetcher} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 border border-danger/20 transition-colors">
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          ) : (
            <button onClick={startFetcher} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-success/15 text-success hover:bg-success/25 border border-success/20 transition-colors">
              <Play className="w-3.5 h-3.5" /> Start
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-medium text-text-muted uppercase mb-1">Service</label>
            <select className="input-dark" value={localFilters.service} onChange={(e) => setLocalFilters({ ...localFilters, service: e.target.value })}>
              <option value="">All Services</option>
              {availableServices.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="w-28">
            <label className="block text-[10px] font-medium text-text-muted uppercase mb-1">Team ID</label>
            <input className="input-dark" type="number" value={localFilters.team_id} onChange={(e) => setLocalFilters({ ...localFilters, team_id: e.target.value })} placeholder="Any" />
          </div>
          <div className="w-28">
            <label className="block text-[10px] font-medium text-text-muted uppercase mb-1">Round</label>
            <input className="input-dark" type="number" value={localFilters.round} onChange={(e) => setLocalFilters({ ...localFilters, round: e.target.value })} placeholder="Any" />
          </div>
          <button type="submit" className="btn-glow flex items-center gap-1.5"><Search className="w-3.5 h-3.5" /> Filter</button>
          <button type="button" onClick={() => { fetchFlagIds(); fetchStatus(); }} className="p-2 rounded-lg text-text-muted hover:text-accent border border-border hover:border-accent/30 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" /> Auto-refresh
          </label>
        </div>
      </form>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : flagIds.items.length === 0 ? (
          <div className="p-12 text-center">
            <Flag className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No flag IDs found</p>
            <p className="text-text-muted text-xs mt-1">Start the fetcher or adjust your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Team</th>
                  <th>Round</th>
                  <th>Flag ID Desc</th>
                  <th>Flag ID Value</th>
                  <th>Fetched At</th>
                </tr>
              </thead>
              <tbody>
                {flagIds.items.map((item) => (
                  <tr key={item.id}>
                    <td><span className="text-accent font-medium">{item.service}</span></td>
                    <td className="font-mono">{item.team_id}</td>
                    <td className="font-mono">{item.round}</td>
                    <td className="text-text-muted">{item.flag_id_description}</td>
                    <td><code className="text-xs bg-bg-primary/60 px-2 py-0.5 rounded text-cyber-green">{item.flag_id_value}</code></td>
                    <td className="text-text-muted text-xs">{new Date(item.fetched_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {flagIds.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-text-muted">Showing {((page - 1) * 50) + 1}-{Math.min(page * 50, flagIds.total)} of {flagIds.total}</p>
            <div className="flex gap-1">
              <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="p-1.5 rounded text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-3 py-1 text-xs text-text-secondary">{page} / {totalPages}</span>
              <button onClick={() => changePage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
