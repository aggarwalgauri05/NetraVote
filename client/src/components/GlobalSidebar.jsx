import { 
  Shield, LayoutDashboard, Cpu, Clock, Globe, 
  MapPin, Upload, FileText, ShieldAlert, Activity,
  ChevronRight, LogOut, Settings, Command, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const tabs = [
    { id: 'network',       icon: <Activity size={18} />,        label: 'Voter Mapping' },
    { id: 'analytics',     icon: <LayoutDashboard size={18} />, label: 'Voter Insights' },
    { id: 'forensics',     icon: <Cpu size={18} />,             label: 'Fraud Alerts' },
    { id: 'timeline',      icon: <Clock size={18} />,           label: 'Registration Trends' },
    { id: 'crossnet',      icon: <Globe size={18} />,           label: 'Boundary Checks' },
    { id: 'geomap',        icon: <MapPin size={18} />,          label: 'Booth Map' },
    { id: 'upload',        icon: <Upload size={18} />,          label: 'Upload Lists' },
    { id: 'audit',         icon: <FileText size={18} />,        label: 'Audit Log' },
    { id: 'whistleblower', icon: <ShieldAlert size={18} />,     label: 'Official Feedback' },
  ];

  const sidebarContent = (
    <>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-royal-500/20 to-transparent" />
      
      {/* ── Logo Section ── */}
      <div className="p-6 md:p-8 mb-2 md:mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-royal-500/20 blur-xl rounded-full group-hover:bg-royal-500/40 transition-all" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-royal-400 to-royal-600 flex items-center justify-center shadow-2xl shadow-royal-500/20 active:scale-95 transition-transform overflow-hidden">
                <img src="/assets/media__1775567846826.png" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} className="w-full h-full object-cover relative z-10" alt="GhostWatch Logo" />
                <Shield size={24} className="text-white hidden absolute z-0" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-black tracking-tighter text-white font-display uppercase italic">GHOSTWATCH</span>
              <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Core_Active</span>
              </div>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 md:px-4 py-2 space-y-1 md:space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 md:px-4 mb-3 md:mb-4">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Operational Modules</span>
        </div>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const isForensics = tab.id === 'forensics';
          const themeBg = isForensics ? 'bg-rose-500/10' : 'bg-royal-500/10';
          const themeBorder = isForensics ? 'border-rose-500/20' : 'border-royal-500/20';
          const themeText = isForensics ? 'text-rose-400' : 'text-royal-400';
          const themeDot = isForensics ? 'bg-rose-500' : 'bg-royal-500';
          const themeShadow = isForensics ? 'shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'shadow-[0_0_15px_rgba(59,130,246,0.6)]';

          return (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); if (onClose) onClose(); }}
              className={`w-full group relative flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl transition-all duration-300 ${isActive ? themeBg : 'hover:bg-white/[0.03]'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-pill"
                  className={`absolute inset-0 ${isForensics ? 'bg-rose-500/5' : 'bg-royal-500/5'} rounded-xl md:rounded-2xl border ${themeBorder}`}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
              
              <div className={`relative z-10 transition-colors duration-300 ${isActive ? themeText : 'text-slate-500 group-hover:text-slate-300'}`}>
                {tab.icon}
              </div>
              
              <span className={`relative z-10 text-[11px] font-black tracking-wide transition-all duration-300 uppercase ${isActive ? 'text-white translate-x-1' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="sidebar-dot"
                  className={`absolute left-[-10px] w-1.5 h-6 ${themeDot} rounded-full ${themeShadow}`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <ChevronRight size={12} className={`relative z-10 ml-auto transition-all ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 md:p-6 border-t border-white/5 space-y-3 md:space-y-4">
        <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all cursor-pointer">
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
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - always visible on md+ */}
      <aside className="hidden md:flex w-[280px] h-full glass-panel border-r border-white/5 flex-col z-[100] relative overflow-hidden shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] glass-panel border-r border-white/5 flex flex-col z-[201] overflow-hidden md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSidebar;
