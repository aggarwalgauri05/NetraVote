import { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  FileText, Clock, User, Shield, Search, ChevronDown, 
  CheckCircle2, AlertCircle, Fingerprint, Lock, 
  ExternalLink, Layers, History, ShieldCheck, Activity,
  X, Cpu, Database, Binary, Key, Globe, Eye,
  ArrowUpRight, Download, Filter, Trash2
} from 'lucide-react';

const ACTION_TYPES = {
  SCAN:       { label: 'System Scan',           color: 'var(--royal-400)', icon: <Search size={14} />, bg: 'bg-royal-500/10' },
  FLAG:       { label: 'Anomaly Flagged',        color: '#f43f5e', icon: <AlertCircle size={14} />, bg: 'bg-rose-500/10' },
  OVERRIDE:   { label: 'Human Override',        color: '#f59e0b', icon: <History size={14} />, bg: 'bg-amber-500/10' },
  EXPORT:     { label: 'Intel Export',          color: '#10b981', icon: <ExternalLink size={14} />, bg: 'bg-emerald-500/10' },
  UPLOAD:     { label: 'Data Ingestion',        color: '#8b5cf6', icon: <Layers size={14} />, bg: 'bg-purple-500/10' },
  WHISTLE:    { label: 'Secure Intel',          color: '#ec4899', icon: <Shield size={14} />, bg: 'bg-pink-500/10' },
  VERIFY:     { label: 'Physical Validation',   color: '#06d6a0', icon: <ShieldCheck size={14} />, bg: 'bg-teal-500/10' },
  ESCALATE:   { label: 'Level 1 Escalation',    color: '#ef4444', icon: <Activity size={14} />, bg: 'bg-red-500/10' },
  LOGIN:      { label: 'Protocol Access',       color: '#64748b', icon: <Lock size={14} />, bg: 'bg-slate-500/10' },
  STATUS:     { label: 'Network Integrity',     color: '#22d3ee', icon: <CheckCircle2 size={14} />, bg: 'bg-cyan-500/10' },
};

function generateAuditLog() {
  const now = Date.now();
  return [
    { id: 'AUD-992-X1', timestamp: now - 120000,  type: 'SCAN',     officer: 'DEO-DL-042',  constituency: 'New Delhi',   details: 'Full graph scan completed. 88 ghost anomalies detected at ADDR-FRAUD-999.', severity: 'HIGH' },
    { id: 'AUD-851-Q2', timestamp: now - 480000,  type: 'FLAG',     officer: 'BLO-DL-119',  constituency: 'New Delhi',   details: 'Subscriber VOTER-FRAUD-1 manually flagged as phantom entity after multi-factor verification.', severity: 'CRITICAL' },
    { id: 'AUD-742-W3', timestamp: now - 900000,  type: 'OVERRIDE', officer: 'ARO-DL-005',  constituency: 'New Delhi',   details: 'Risk score adjusted: VOTER-NORM-3-2 set to 0.15. Baseline parity confirmed by field operative.', severity: 'INFO' },
    { id: 'AUD-633-R4', timestamp: now - 1800000, type: 'EXPORT',   officer: 'DEO-DL-042',  constituency: 'New Delhi',   details: 'ECI evidence dossier (NV-1775) generated for judicial submission. Hash alignment verified.', severity: 'INFO' },
    { id: 'AUD-524-T5', timestamp: now - 3600000, type: 'WHISTLE',  officer: 'ANONYMOUS',    constituency: 'South Delhi', details: 'Direct injection report (WB-17) logged. Malpractice detected in batch registration cycle.', severity: 'HIGH' },
    { id: 'AUD-415-Y6', timestamp: now - 5400000, type: 'UPLOAD',   officer: 'DEO-MH-012',  constituency: 'Mumbai North', details: 'Electoral data ingestion phase 4 complete. 12,400 vertices synced with master branch.', severity: 'MEDIUM' },
    { id: 'AUD-306-U7', timestamp: now - 7200000, type: 'ESCALATE', officer: 'CEO-DL-001',  constituency: 'Chandni Chowk', details: 'Incident CASE-2024-003 escalated to higher commission for biometric override.', severity: 'CRITICAL' },
  ];
}

const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Active Now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function AuditTrailPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const entries = useMemo(() => generateAuditLog(), []);

  const filtered = useMemo(() => {
    let result = entries;
    if (filterType !== 'ALL') result = result.filter(e => e.type === filterType);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.details.toLowerCase().includes(q) || e.officer.toLowerCase().includes(q) || e.constituency.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, filterType, searchTerm]);

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-8 pb-14">
      
      {/* ── Protocol Ledger Header ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Binary size={200} className="text-royal-400" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40 relative">
            <Fingerprint size={32} className="text-royal-400" />
            <motion.div 
               animate={{ opacity: [0.1, 0.4, 0.1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-royal-400/20 blur-xl rounded-full"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic leading-none">Immutable Protocol Ledger</h1>
            <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Encryption Stream Hashed</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">Global Event Chain v7.4</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
            <div className="flex flex-col items-end px-6">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1 italic">Ledger_Integrity</span>
                <div className="text-2xl font-black text-white tabular-nums italic">{entries.length} HITS</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <button className="p-5 rounded-2.5xl bg-royal-600/10 border border-royal-500/20 text-royal-400 hover:bg-royal-600 hover:text-white transition-all shadow-xl active:scale-95">
                <Download size={22} className="stroke-[2.5px]" />
            </button>
        </div>
      </div>

      {/* ── Control Array ── */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-20">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-6 flex items-center">
            <Search size={18} className="text-slate-600 group-focus-within:text-royal-400 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="SEARCH CRYPTOGRAPHIC LEDGER..."
            className="w-full pl-16 pr-8 py-6 rounded-[2.5rem] glass-panel bg-white/[0.01] border-white/5 text-[11px] font-black text-white placeholder-slate-700 tracking-[0.2em] focus:outline-none focus:border-royal-500/30 transition-all uppercase italic"
          />
        </div>
        
        <div className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Filter size={18} className="text-slate-600" />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full pl-16 pr-12 py-6 rounded-[2.5rem] glass-panel bg-white/[0.01] border-white/5 text-[11px] font-black text-white focus:outline-none focus:border-royal-500/30 transition-all uppercase tracking-[0.2em] italic appearance-none cursor-pointer"
          >
            <option value="ALL">ALL_PROTOCOLS</option>
            {Object.entries(ACTION_TYPES).map(([k, v]) => (
              <option key={k} value={k} className="bg-obsidian-950 text-white py-4">{v.label.toUpperCase()}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
            <ChevronDown size={18} className="text-slate-600" />
          </div>
        </div>
      </div>

      {/* ── Event Stream ── */}
      <div className="relative space-y-6">
        {/* Timeline Core */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-royal-500/40 via-royal-500/10 to-transparent hidden lg:block" />

        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {filtered.map((entry, idx) => {
              const meta = ACTION_TYPES[entry.type] || ACTION_TYPES.STATUS;
              const isExpanded = expandedId === entry.id;

              return (
                <motion.div
                  layout
                  key={entry.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="relative lg:pl-24 group cursor-pointer"
                >
                  {/* Ledger Anchor */}
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center z-30">
                    <motion.div 
                        animate={{ 
                            scale: isExpanded ? 1.5 : 1,
                            borderColor: isExpanded ? meta.color : 'rgba(255,255,255,0.1)'
                        }}
                        className="w-6 h-6 rounded-full bg-obsidian-950 border-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center outline outline-4 outline-transparent group-hover:outline-white/5"
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    </motion.div>
                  </div>

                  {/* Card Structure */}
                  <div 
                    className={`p-8 rounded-[3.5rem] border transition-all duration-500 relative overflow-hidden group-hover:bg-white/[0.03] ${isExpanded ? 'bg-white/[0.08] border-white/20 shadow-2xl scale-[1.01] translate-x-2' : 'bg-white/[0.02] border-white/5 hover:border-white/10 shadow-lg'}`}
                  >
                    <div className="absolute inset-0 quantum-grid opacity-[0.02] group-hover:opacity-[0.05]" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-6 flex-1">
                        <div className={`p-5 rounded-3xl transition-all shadow-inner relative group-active:scale-95 ${meta.bg}`} style={{ color: meta.color }}>
                          {meta.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic" style={{ color: meta.color }}>{meta.label}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-800" />
                            <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border italic transition-all ${entry.severity === 'CRITICAL' ? 'bg-red-500/20 border-red-500/30 text-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                {entry.severity} ACCREDITATION
                            </div>
                          </div>
                          <div className="text-base font-black text-white italic tracking-tight leading-relaxed group-hover:text-royal-300 transition-colors">
                            {entry.details.length > 100 && !isExpanded ? entry.details.slice(0, 100) + '...' : entry.details}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 lg:text-right shrink-0">
                        <div className="flex flex-col lg:items-end p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <Clock size={14} />
                                <span className="text-[11px] font-black uppercase tracking-widest italic">{timeAgo(entry.timestamp)}</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-700 tracking-tighter uppercase font-bold">{entry.id}</div>
                        </div>
                        <div className={`p-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-royal-500 text-white rotate-180' : 'bg-white/5 text-slate-700'}`}>
                             <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-10 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                            {[
                                { label: 'Auth_Officer', val: entry.officer, icon: <User size={14} />, color: 'text-royal-400', bg: 'bg-royal-500/10' },
                                { label: 'Node_Sector', val: entry.constituency, icon: <Globe size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'Epoch_Sync', val: new Date(entry.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }), icon: <Activity size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                                { label: 'Ledger_Hash', val: Math.random().toString(36).substring(2, 18).toUpperCase(), icon: <Key size={14} />, color: 'text-slate-500', bg: 'bg-white/10' },
                            ].map((detail, dIdx) => (
                                <div key={dIdx} className="flex flex-col gap-3 p-5 rounded-3xl bg-white/[0.02] border border-white/5 shadow-inner">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">{detail.label}</span>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl border border-white/5 ${detail.bg} ${detail.color}`}>{detail.icon}</div>
                                        <span className="text-[13px] font-black text-white italic tracking-tight break-all tabular-nums">{detail.val}</span>
                                    </div>
                                </div>
                            ))}
                          </div>
                          
                          <div className="mt-8 flex gap-4">
                             <button className="flex-1 py-4 rounded-2.5xl bg-white/[0.03] border border-white/5 hover:border-royal-500/30 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] italic transition-all flex items-center justify-center gap-3">
                                <Eye size={16} />
                                <span>Verify Metadata Integrity</span>
                             </button>
                             <button className="px-8 py-4 rounded-2.5xl bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                <Trash2 size={16} />
                             </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </LayoutGroup>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-32 text-center rounded-[4rem] glass-panel border-dashed border-white/5"
          >
            <div className="inline-flex p-10 rounded-full bg-white/[0.02] border border-white/5 mb-8 relative">
                <Database size={50} className="text-slate-800" />
                <motion.div 
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-white/5 blur-2xl rounded-full"
                />
            </div>
            <h3 className="text-2xl font-black text-slate-700 uppercase italic tracking-tighter mb-4">Null Event Stream</h3>
            <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em] max-w-[280px] mx-auto leading-relaxed">
                No verified cryptographic entries found within the current filter parameters
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Security Badge ── */}
      <div className="mt-auto flex items-center justify-center gap-8 py-8 border-t border-white/5 opacity-40 grayscale hover:grayscale-0 transition-all hover:opacity-100">
         <div className="flex items-center gap-3">
            <Lock size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] italic">AES-256 Protocol Vault</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-slate-800" />
         <div className="flex items-center gap-3">
            <Shield size={12} className="text-royal-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] italic">Distributed_Ledger_Sync</span>
         </div>
      </div>
    </div>
  );
}
