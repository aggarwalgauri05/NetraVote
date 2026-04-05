import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Building, ChevronRight, X, AlertTriangle, 
  ShieldCheck, Map, Activity, Fingerprint, BarChart3, 
  FileText, Zap, Shield, Search, Globe, Target, Terminal,
  Cpu, AlertOctagon, Info, Radar
} from 'lucide-react';

const ThreatFeed = () => {
    const [events, setEvents] = useState([
        { id: 1, type: 'CRITICAL', msg: 'EPIC_COLLISION: VTR-8829 AT ADDR-092' },
        { id: 2, type: 'WARNING', msg: 'AGE_GAP_ANOMALY: RADIUS_SECTOR_4' },
        { id: 3, type: 'INFO', msg: 'GRAPH_SYNC: CLUSTER_REBUILD_COMPLETE' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newEvent = {
                id: Date.now(),
                type: Math.random() > 0.7 ? 'CRITICAL' : 'WARNING',
                msg: `ANOMALY_DET_v8: NODE_${Math.floor(Math.random() * 9000 + 1000)}`
            };
            setEvents(prev => [newEvent, ...prev.slice(0, 5)]);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-2 pt-6">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 px-1">Live_Threat_Stream</span>
            {events.map((e, i) => (
                <motion.div 
                    key={e.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1 - (i * 0.15), x: 0 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                    <div className={`w-1 h-1 rounded-full ${e.type === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-bold text-slate-400 font-mono truncate">{e.msg}</span>
                </motion.div>
            ))}
        </div>
    );
};

const Sidebar = ({ stats, constituency, selectedNode, onClearSelection, loading }) => {
  
  return (
    <div className="h-full w-[380px] glass-panel border-l border-white/5 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-royal-500/[0.02] to-transparent pointer-events-none" />
      
      {/* ─── Global Integrity Header ─── */}
      <section className="p-8 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Activity size={16} className="text-emerald-400" />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Integrity Flux</span>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-white/5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Syncing</span>
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-all"
            >
              <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield size={40} className="text-emerald-400" />
              </div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 font-display">Sector Health</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-400 tabular-nums font-display">{stats.integrityScore}%</span>
                <span className="text-[9px] font-bold text-slate-700">v.01</span>
              </div>
              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.integrityScore}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-all"
            >
              <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search size={40} className="text-royal-400" />
              </div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 font-display">Anomalies</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white tabular-nums font-display">{stats.ghostVoters}</span>
                <div className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">Alert</span>
                </div>
              </div>
              <span className="text-[8px] text-royal-400 font-black uppercase tracking-widest mt-2 block opacity-60">Scanning Nodes</span>
            </motion.div>
          </div>
        )}
      </section>

      {/* ─── Forensic Dossier ─── */}
      <section className="flex-1 flex flex-col p-8 overflow-hidden relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-royal-500/10 border border-royal-500/20">
            <Fingerprint size={16} className="text-royal-400" />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Node Intelligence Dossier</span>
        </div>

        <AnimatePresence mode="wait">
          {!selectedNode ? (
             <motion.div 
               key="empty"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex-1 flex flex-col min-h-0"
             >
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] relative overflow-hidden group">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-[0.03] flex items-center justify-center"
                    >
                        <Radar size={400} className="text-royal-400" />
                    </motion.div>

                    <div className="relative mb-8">
                       <div className="absolute inset-0 bg-royal-500/20 blur-3xl rounded-full" />
                       <div className="relative w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-slate-900 shadow-2xl">
                         <Target size={32} className="text-slate-800 animate-pulse" />
                       </div>
                    </div>
                    <h4 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase mb-3 relative z-10">Satellite Awaiting Target</h4>
                    <p className="text-[10px] text-slate-700 leading-relaxed uppercase tracking-widest max-w-[220px] relative z-10">
                       Intercept any node within the network matrix to deploy deep-spectrum behavioral analysis.
                    </p>
                </div>

                <ThreatFeed />
             </motion.div>
          ) : (
            <motion.div 
              key="dossier"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar"
            >
              {/* Dossier Header */}
              <div className="p-6 rounded-[2.5rem] bg-slate-800/40 border border-white/10 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Cpu size={120} className="text-royal-400" />
                </div>
                
                <div className="flex items-center justify-between mb-8 relative">
                   <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl border shadow-lg ${
                        selectedNode.isHighRisk 
                        ? 'bg-rose-500/10 border-rose-500/20 shadow-rose-900/10' 
                        : 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-900/10'
                      }`}>
                         {selectedNode.group === 'Voters' ? 
                          <User size={24} className={selectedNode.isHighRisk ? 'text-rose-400' : 'text-emerald-400'} /> :
                          <MapPin size={24} className="text-amber-400" />
                         }
                      </div>
                      <div>
                        <h2 className="text-lg font-black tracking-tight text-white font-display uppercase">{selectedNode.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                              ID_{selectedNode.id.substring(0, 8)}
                            </span>
                        </div>
                      </div>
                   </div>
                   <button onClick={onClearSelection} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all">
                      <X size={16} />
                   </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 relative">
                   <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">State</span>
                        <div className={`text-[11px] font-black uppercase ${selectedNode.isHighRisk ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {selectedNode.isHighRisk ? 'Flagged Anomaly' : 'Verified Node'}
                        </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Risk Score</span>
                        <div className={`text-sm font-black tabular-nums transition-colors ${selectedNode.isHighRisk ? 'text-rose-400' : 'text-royal-400'}`}>
                            {((selectedNode.riskScore || 0) * 100).toFixed(2)}%
                        </div>
                   </div>
                </div>
                
                {/* Visual Risk Gauge */}
                <div className="mt-8 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Threat Calibration</span>
                    <span className="text-[9px] font-black text-slate-700 uppercase">Max 100</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                     <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((selectedNode.riskScore || 0.1) * 100)}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full relative ${selectedNode.isHighRisk ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-royal-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}
                     >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                     </motion.div>
                  </div>
                </div>
              </div>

              {/* Cognitive Reasoning Engine */}
              <div className={`p-6 rounded-[2.5rem] border backdrop-blur-sm relative overflow-hidden ${
                selectedNode.isHighRisk 
                ? 'bg-rose-500/5 border-rose-500/10' 
                : 'bg-white/[0.02] border-white/5'
              }`}>
                 <div className="flex items-center gap-3 mb-4">
                    <Terminal size={14} className={selectedNode.isHighRisk ? 'text-rose-400' : 'text-royal-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Engine Reasoning</span>
                 </div>
                 <p className="text-[11px] leading-relaxed text-slate-300 font-bold uppercase tracking-tight italic">
                   "{selectedNode.explanation || (selectedNode.isHighRisk ? 
                    `Subject exhibits non-human registration velocity and EPIC collision patterns. Node should be purged from democratic grid immediately.` : 
                    `Geometric fingerprint aligns with verified local constituency metadata. Anomaly probability is within safe variance thresholds.`)}"
                 </p>
              </div>

              {/* Tactical Actions Grid */}
              <div className="mt-auto grid grid-cols-1 gap-3">
                 <button className="w-full py-4 bg-royal-500 hover:bg-royal-400 text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-royal-500/10 hover:shadow-royal-500/20 active:scale-95 group">
                    <FileText size={16} />
                    <span>Generate Signal Evidence</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                 </button>
                 <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[9px] text-slate-600 font-black tracking-[0.2em] uppercase">AES-256 Hardware Encrypted Link</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      
      {/* ─── Warning Strip ─── */}
      <footer className="p-4 bg-rose-500/5 border-t border-rose-500/10 flex items-center gap-3">
        <AlertOctagon size={14} className="text-rose-500" />
        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Confidential Intel: Internal Use Only</span>
      </footer>
    </div>
  );
};

export default Sidebar;
