import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [form, setForm] = useState({ team_id: '', team_token: '', ssh_password: '', game_tick_seconds: '', total_teams: '' });
  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/config/full');
        setForm({
          team_id: data.team_id || '',
          team_token: data.team_token || '',
          ssh_password: data.ssh_password || '',
          game_tick_seconds: data.game_tick_seconds || 120,
          total_teams: data.total_teams || 30,
        });
        setLoaded(true);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/config', {
        team_id: parseInt(form.team_id) || undefined,
        team_token: form.team_token || undefined,
        ssh_password: form.ssh_password || undefined,
        game_tick_seconds: parseInt(form.game_tick_seconds) || undefined,
        total_teams: parseInt(form.total_teams) || undefined,
      });
      toast.success('Configuration saved successfully');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>
        <div className="skeleton h-96 max-w-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Configure team identity and game parameters</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 max-w-xl space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="p-2 rounded-lg bg-accent/15 text-accent"><SettingsIcon className="w-5 h-5" /></div>
          <h2 className="text-sm font-semibold text-text-primary">Game Configuration</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Team ID</label>
            <input className="input-dark" type="number" value={form.team_id} onChange={(e) => setForm({ ...form, team_id: e.target.value })} min="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Total Teams</label>
            <input className="input-dark" type="number" value={form.total_teams} onChange={(e) => setForm({ ...form, total_teams: e.target.value })} min="2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Team Token</label>
          <div className="relative">
            <input className="input-dark pr-10" type={showToken ? 'text' : 'password'} value={form.team_token} onChange={(e) => setForm({ ...form, team_token: e.target.value })} placeholder="Enter team token..." />
            <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">SSH Password</label>
          <div className="relative">
            <input className="input-dark pr-10" type={showPassword ? 'text' : 'password'} value={form.ssh_password} onChange={(e) => setForm({ ...form, ssh_password: e.target.value })} placeholder="Root SSH password..." />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Game Tick (seconds)</label>
          <input className="input-dark" type="number" value={form.game_tick_seconds} onChange={(e) => setForm({ ...form, game_tick_seconds: e.target.value })} min="1" />
        </div>

        <button type="submit" disabled={saving} className="btn-glow w-full flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
