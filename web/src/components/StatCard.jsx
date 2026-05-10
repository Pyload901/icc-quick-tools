/**
 * Stat card component for dashboard overview.
 */
export default function StatCard({ icon: Icon, label, value, color = 'accent', subtitle }) {
  const colorMap = {
    accent: 'from-accent/20 to-accent/5 text-accent border-accent/20',
    green: 'from-success/20 to-success/5 text-success border-success/20',
    cyan: 'from-cyber-green/20 to-cyber-green/5 text-cyber-green border-cyber-green/20',
    pink: 'from-cyber-pink/20 to-cyber-pink/5 text-cyber-pink border-cyber-pink/20',
    yellow: 'from-warning/20 to-warning/5 text-warning border-warning/20',
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-gradient-to-br border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
