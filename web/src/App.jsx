import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Targets from './pages/Targets';
import Vulnboxes from './pages/Vulnboxes';
import FlagIds from './pages/FlagIds';
import Tools from './pages/Tools';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/vulnboxes" element={<Vulnboxes />} />
            <Route path="/flagids" element={<FlagIds />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1f2e',
            color: '#e2e8f0',
            border: '1px solid #2a3142',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#1a1f2e' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a1f2e' } },
        }}
      />
    </BrowserRouter>
  );
}
