import { useState } from 'react';
import { Server, Search as SearchIcon, Download, Plus, Trash2, Loader2, Terminal } from 'lucide-react';
import { useVulnboxes } from '../hooks/useVulnboxes';
import CopyButton from '../components/CopyButton';
import Modal from '../components/Modal';

export default function Vulnboxes() {
  const { vulnboxes, loading, discovering, discoverServices, addManualService, deleteService, downloadArtifacts } = useVulnboxes();
  const [addServiceModal, setAddServiceModal] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', port: '' });

  const handleAddService = async (e) => {
    e.preventDefault();
    await addManualService({ vulnbox_id: addServiceModal, name: serviceForm.name, port: serviceForm.port });
    setAddServiceModal(null);
    setServiceForm({ name: '', port: '' });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Vulnboxes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Vulnboxes</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your team's vulnerable machines (VMs 0-9)</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vulnboxes.map((vbox) => (
          <div key={vbox.vulnbox_id} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/15 text-accent"><Server className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Vulnbox {vbox.vulnbox_id}</h3>
                  <p className="text-xs font-mono text-text-muted">{vbox.ip}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vbox.services.length > 0 ? 'bg-success/15 text-success border border-success/30' : 'bg-text-muted/15 text-text-muted border border-text-muted/30'}`}>
                {vbox.services.length > 0 ? `${vbox.services.length} svc` : 'No services'}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-bg-primary/60 border border-border/50">
              <Terminal className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <code className="text-xs font-mono text-cyber-green flex-1 truncate">{vbox.ssh_command}</code>
              <CopyButton text={vbox.ssh_command} label="Copy" />
            </div>
            {vbox.services.length > 0 && (
              <div className="mb-3 space-y-1">
                {vbox.services.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between text-xs p-2 rounded bg-bg-primary/40 border border-border/30">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${svc.is_auto_discovered ? 'bg-cyber-green' : 'bg-warning'}`} />
                      <span className="text-text-primary font-medium">{svc.name}</span>
                      <span className="text-text-muted font-mono">{svc.port}</span>
                    </div>
                    {!svc.is_auto_discovered && (
                      <button onClick={() => deleteService(svc.id)} className="text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => discoverServices(vbox.vulnbox_id)} disabled={discovering[vbox.vulnbox_id]} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-accent/15 text-accent hover:bg-accent/25 border border-accent/20 transition-colors disabled:opacity-50">
                {discovering[vbox.vulnbox_id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SearchIcon className="w-3.5 h-3.5" />} Discover
              </button>
              <button onClick={() => setAddServiceModal(vbox.vulnbox_id)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-warning/15 text-warning hover:bg-warning/25 border border-warning/20 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Manual
              </button>
              <button onClick={() => downloadArtifacts(vbox.vulnbox_id)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-cyber-green/15 text-cyber-green hover:bg-cyber-green/25 border border-cyber-green/20 transition-colors">
                <Download className="w-3.5 h-3.5" /> ZIP
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={addServiceModal !== null} onClose={() => setAddServiceModal(null)} title={`Add Service to Vulnbox ${addServiceModal}`}>
        <form onSubmit={handleAddService} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Service Name *</label>
            <input className="input-dark" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required placeholder="e.g. my_challenge" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Port *</label>
            <input className="input-dark" value={serviceForm.port} onChange={(e) => setServiceForm({ ...serviceForm, port: e.target.value })} required placeholder="e.g. 8080/tcp" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-glow flex-1">Add Service</button>
            <button type="button" onClick={() => setAddServiceModal(null)} className="flex-1 px-4 py-2 rounded-lg text-sm text-text-muted border border-border transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
