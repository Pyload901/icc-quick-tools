/**
 * Status badge for online/offline/running states.
 */
export default function StatusBadge({ status, label }) {
  const styles = {
    online: 'bg-success/15 text-success border-success/30',
    offline: 'bg-danger/15 text-danger border-danger/30',
    running: 'bg-cyber-green/15 text-cyber-green border-cyber-green/30',
    stopped: 'bg-text-muted/15 text-text-muted border-text-muted/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.offline}`}>
      <span className={`status-dot ${status === 'online' || status === 'running' ? 'online' : 'offline'}`} />
      {label || status}
    </span>
  );
}
