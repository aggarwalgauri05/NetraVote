import { 
  Shield, LayoutDashboard, Cpu, Clock, Globe, 
  MapPin, Upload, FileText, ShieldAlert, Activity,
  ChevronRight, LogOut, Settings, Command
} from 'lucide-react';
import { motion } from 'framer-motion';

const GlobalSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'network',       icon: <Activity size={18} />,        label: 'Network Matrix' },
    { id: 'analytics',     icon: <LayoutDashboard size={18} />, label: 'Intel Analytics' },
    { id: 'forensics',     icon: <Cpu size={18} />,             label: 'Quantum Forensics' },
    { id: 'timeline',      icon: <Clock size={18} />,           label: 'Temporal Flux' },
    { id: 'crossnet',      icon: <Globe size={18} />,           label: 'Cross-Net Nexus' },
    { id: 'geomap',        icon: <MapPin size={18} />,          label: 'Geo-Spatial' },
    { id: 'upload',        icon: <Upload size={18} />,          label: 'Data Ingestion' },
    { id: 'audit',         icon: <FileText size={18} />,        label: 'Immutable Audit' },
    { id: 'whistleblower', icon: <ShieldAlert size={18} />,     label: 'Whistleblower' },
  ];

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-[280px] h-full glass-panel border-r border-white/5 flex flex-col z-[100] relative overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-royal-500/20 to-transparent" />
      
      {/* ── Logo Section ── */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="relative">
            <div className="absolute inset-0 bg-royal-500/20 blur-xl rounded-full group-hover:bg-royal-500/40 transition-all" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-royal-400 to-royal-600 flex items-center justify-center shadow-2xl shadow-royal-500/20 active:scale-95 transition-transform">
              <Shield size={24} className="text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-white font-display">NETRAVOTE</span>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Core_Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-4">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Operational Modules</span>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full group relative flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-royal-500/10' : 'hover:bg-white/[0.03]'}`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="sidebar-active-pill"
                className="absolute inset-0 bg-royal-500/5 rounded-2xl border border-royal-500/20"
                transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
              />
            )}
            
            <div className={`relative z-10 transition-colors duration-300 ${activeTab === tab.id ? 'text-royal-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {tab.icon}
            </div>
            
            <span className={`relative z-10 text-xs font-bold tracking-wide transition-all duration-300 uppercase ${activeTab === tab.id ? 'text-white translate-x-1' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {tab.label}
            </span>

            {activeTab === tab.id && (
              <motion.div 
                layoutId="sidebar-dot"
                className="absolute left-[-10px] w-1.5 h-6 bg-royal-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <ChevronRight size={12} className={`relative z-10 ml-auto transition-all ${activeTab === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
          </button>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                    <Command size={14} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Control</span>
                    <span className="text-[11px] font-bold text-slate-300">V.5.0 Deployment</span>
                </div>
                <Settings size={14} className="ml-auto text-slate-600 hover:text-white transition-colors" />
            </div>
        </div>
        
        <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-rose-400 transition-colors">
            <LogOut size={16} />
            <span className="text-[11px] font-black uppercase tracking-widest">Logout Session</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default GlobalSidebar;
