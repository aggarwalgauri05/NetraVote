import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, AlertTriangle, ShieldCheck, User, MapPin,
  Fingerprint, Clock, ChevronDown, ChevronRight, FileText, Zap,
  Radio, Eye, CheckCircle, XCircle, Building, Hash, Calendar, Shield,
  ArrowRight, FileBadge, LifeBuoy, Activity, Target, ShieldAlert,
  Layers, Cpu
} from 'lucide-react';

const ForensicsPanel = ({ graphData = { nodes: [], links: [] }, stats, constituency, onNodeHighlight }) => {
  const { nodes = [] } = graphData;
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [expandedVoter, setExpandedVoter] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const voters = useMemo(() => nodes.filter(n => n.group === 'Voters'), [nodes]);
  const addresses = useMemo(() => nodes.filter(n => n.group === 'Addresses'), [nodes]);

  const filtered = useMemo(() => {
    let list = voters;
    if (riskFilter === 'high') list = list.filter(v => (v.riskScore || 0) > 0.6);
    else if (riskFilter === 'medium') list = list.filter(v => (v.riskScore || 0) > 0.3 && (v.riskScore || 0) <= 0.6);
    else if (riskFilter === 'safe') list = list.filter(v => (v.riskScore || 0) <= 0.3);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        (v.name || '').toLowerCase().includes(q) ||
        (v.id || '').toLowerCase().includes(q) ||
        (v.epic_number || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [voters, search, riskFilter]);

  const alerts = useMemo(() => {
    const list = [];
    const highRisk = voters.filter(v => (v.riskScore || 0) > 0.6);
    const fraudAddrs = addresses.filter(a => (a['@addressVoterCount'] || 0) > 20);

    if (highRisk.length > 0) {
      list.push({ id: 1, severity: 'Critical', icon: <AlertTriangle size={14} />, color: '#f43f5e', title: `${highRisk.length} Ghost Voter Anomalies`, detail: `High-risk voter cluster in ${constituency} exceeds threshold. Immediate review required.`, time: '2m ago' });
    }
    if (fraudAddrs.length > 0) {
      list.push({ id: 2, severity: 'High', icon: <MapPin size={14} />, color: '#fbbf24', title: `Concentrated Address Fraud`, detail: `Addresses flagged with >20 voters registered. Possible housing fraud.`, time: '5m ago' });
    }
    list.push({ id: 3, severity: 'Info', icon: <Radio size={14} />, color: '#f43f5e', title: 'Savanna Sync Complete', detail: `Graph data refreshed for ${constituency}. Analysts in position.`, time: '1m ago' });
    return list;
  }, [voters, addresses, constituency]);

  const clusters = useMemo(() => {
    const map = {};
    voters.forEach(v => {
      const addrId = v.address_id || 'UNKNOWN';
      if (!map[addrId]) map[addrId] = { addrId, voters: [], highRisk: 0 };
      map[addrId].voters.push(v);
      if ((v.riskScore || 0) > 0.6) map[addrId].highRisk++;
    });
    return Object.values(map).filter(c => c.voters.length > 3).sort((a, b) => b.highRisk - a.highRisk).slice(0, 6);
  }, [voters]);

  const handleGenerateReport = () => {
    setReportGenerating(true);
    setReportDone(false);
    setTimeout(() => {
      setReportGenerating(false);
      setReportDone(true);
       const report = {
        metadata: { system: 'NetraVote v4.1', generated: new Date().toISOString(), constituency },
        summary: stats,
        ghostVoters: voters.filter(v => (v.riskScore || 0) > 0.6).length,
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NETRAVOTE_EVIDENCE_${constituency.replace(/ /g, '_')}.json`;
      a.click();
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar flex flex-col xl:flex-row gap-8 pb-10">
      
      {/* ── Left Column: Stream & Clusters ── */}
      <div className="flex-1 xl:flex-[0.8] flex flex-col gap-8 min-w-0 md:min-w-[340px]">
        
        {/* Threat Stream */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-8 rounded-[3rem] glass-panel relative overflow-hidden border-rose-500/10 shadow-[0_20px_50px_-20px_rgba(244,63,94,0.1)]"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-lg">
                <Zap size={18} className="text-rose-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Intelligence Stream</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Scanning</span>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveAlert(activeAlert === alert.id ? null : alert.id)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                    activeAlert === alert.id 
                    ? 'bg-rose-500/10 border-rose-500/30' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-rose-500/[0.03] hover:border-rose-500/20'
                }`}
              >
                <div className="flex items-start gap-5 relative z-10">
                  <div className={`p-3 rounded-xl transition-all ${activeAlert === alert.id ? 'bg-rose-500/20 text-rose-400' : 'bg-white/[0.03] text-slate-500'}`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-white tracking-tight uppercase group-hover:text-rose-400 transition-colors italic truncate">{alert.title}</span>
                      <span className="text-[9px] font-black font-mono text-slate-600 uppercase tracking-widest">{alert.time}</span>
                    </div>
                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg inline-block border ${
                        alert.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 
                        alert.severity === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                        {alert.severity} PRIORITY
                    </div>
                    <AnimatePresence>
                        {activeAlert === alert.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <p className="text-[11px] text-slate-400 mt-5 leading-relaxed border-t border-rose-500/10 pt-5 uppercase tracking-wide font-medium italic">
                                    {alert.detail}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Structural phantoms */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="p-8 rounded-[3.5rem] glass-panel border-rose-500/5 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-lg">
              <Building size={20} className="text-rose-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Structural Phantoms</h3>
          </div>

          <div className="space-y-4">
            {clusters.map((c, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col group hover:bg-rose-500/[0.02] hover:border-rose-500/20 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-black font-mono text-slate-700 w-8">#{String(i+1).padStart(2, '0')}</span>
                    <div className="truncate max-w-[200px]">
                      <div className="text-[12px] font-black text-white truncate uppercase tracking-tight">{c.addrId}</div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] mt-1 italic">Spatial Nexus</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col">
                    <div className="text-2xl font-black text-white tabular-nums tracking-tighter leading-none">{c.voters.length}</div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2">Entities</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <div className="text-lg font-black text-rose-500 tabular-nums">{c.highRisk}</div>
                    <div className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">Phantoms</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <div className="text-lg font-black text-emerald-500 tabular-nums">{c.voters.length - c.highRisk}</div>
                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Verified</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Middle Column: Investigation Registry ── */}
      <div className="flex-1 xl:flex-[2] flex flex-col gap-8 min-w-0">
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex-1 p-6 md:p-10 rounded-[3.5rem] glass-panel shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] border-rose-500/5"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 shadow-2xl shadow-rose-900/40">
                <Fingerprint size={28} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic leading-none">Investigation Registry</h3>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{filtered.length} Flagged Neural Entities</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
                {[
                  { id: 'all', label: 'All', icon: <Layers size={12} /> },
                  { id: 'high', label: 'Phantoms', icon: <AlertTriangle size={12} /> },
                  { id: 'medium', label: 'Suspects', icon: <Target size={12} /> }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setRiskFilter(f.id)}
                        className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                            riskFilter === f.id 
                            ? 'bg-rose-600 border-rose-400 shadow-xl shadow-rose-900/60 text-white' 
                            : 'bg-transparent border-transparent text-slate-500 hover:text-white'
                        }`}
                    >
                        {f.icon} {f.label}
                    </button>
                ))}
            </div>
          </div>

          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-rose-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center px-6 gap-5 shadow-inner focus-within:border-rose-500/50 transition-all">
                <Search size={22} className="text-slate-500 group-focus-within:text-rose-400" />
                <input 
                    className="flex-1 bg-transparent border-none outline-none text-base md:text-lg text-white placeholder-slate-700 font-bold uppercase"
                    placeholder="Scan_Neural_Hash / EPIC..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
            <div className="grid grid-cols-1 gap-4">
                {filtered.map((voter, i) => (
                    <motion.div 
                        layout 
                        key={voter.id}
                        className={`rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden group ${
                            expandedVoter === voter.id
                            ? 'bg-white/[0.08] border-rose-500/30'
                            : 'bg-white/[0.02] border-white/5 hover:border-rose-500/20'
                        }`}
                    >
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6" onClick={() => setExpandedVoter(expandedVoter === voter.id ? null : voter.id)}>
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="p-4 rounded-2xl bg-white/[0.03] shadow-inner group-hover:bg-rose-500/20 transition-all text-slate-500 group-hover:text-rose-400">
                                    <User size={24} />
                                </div>
                                <div className="truncate">
                                    <h4 className="text-lg font-black text-white tracking-wide uppercase italic leading-none truncate">{voter.name || 'ANONYMOUS'}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="text-[9px] font-black text-slate-500 font-mono tracking-widest">{voter.id}</div>
                                        <span className="w-1 h-1 rounded-full bg-slate-800" />
                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] italic truncate">{voter.epic_number || 'EPIC_PENDING'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto justify-between border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                <div className="text-right">
                                    <div className={`text-2xl md:text-3xl font-black tabular-nums tracking-tighter italic ${voter.riskScore > 0.6 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {((voter.riskScore || 0) * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1">Risk Score</div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                                    voter.riskScore > 0.6 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}>
                                    {voter.riskScore > 0.6 ? 'PHANTOM' : 'VERIFIED'}
                                </div>
                                <ChevronDown size={20} className={`text-slate-700 group-hover:text-white transition-transform ${expandedVoter === voter.id ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expandedVoter === voter.id && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-8 border-t border-rose-500/10 pt-8 bg-rose-500/[0.01]"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                        {[
                                            { icon: <Clock size={14} />, label: 'Added', value: voter.registration_date?.substring(0, 10) || '2024-03-12' },
                                            { icon: <MapPin size={14} />, label: 'Address ID', value: voter.address_id || 'isolated_node' },
                                            { icon: <Target size={14} />, label: 'Accuracy', value: 'High' }
                                        ].map((f, fi) => (
                                            <div key={fi} className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                                <div className="flex items-center gap-3 mb-2 text-slate-600">
                                                    {f.icon}
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{f.label}</span>
                                                </div>
                                                <div className="text-sm font-black text-white uppercase italic">{f.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 rounded-[2.5rem] bg-rose-500/[0.03] border border-rose-500/10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu size={100} className="text-rose-400" /></div>
                                        <p className="text-[11px] md:text-[12px] leading-relaxed text-slate-400 font-bold uppercase tracking-widest relative z-10 italic">
                                            {voter.explanation || "System Anomaly: High-risk behavior detected in temporal registration stream. Probable synthetic entity."}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right Column: Control & Export ── */}
      <div className="flex-1 xl:flex-[0.6] flex flex-col gap-8 min-w-0 md:min-w-[300px]">
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="p-10 rounded-[3.5rem] glass-panel border-rose-500/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FileBadge size={160} className="text-rose-400" />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-lg">
              <FileText size={22} className="text-rose-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Evidence</h3>
          </div>
          
          <div className="space-y-5 mb-10">
            {[
              { label: 'Neural Graph Matrix', done: true },
              { label: 'Cluster Proofs', done: true },
              { label: 'ECI JSON Standard', done: reportDone }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${item.done ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-slate-800/20 border-slate-700/40 text-slate-800'}`}>
                    {item.done && <CheckCircle size={12} strokeWidth={3} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.1em] italic ${item.done ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            disabled={reportGenerating}
            onClick={handleGenerateReport}
            className="w-full py-5 rounded-[2rem] bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_-10px_rgba(244,63,94,0.4)] disabled:opacity-50"
          >
            {reportGenerating ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> SCANNING</> : reportDone ? <><CheckCircle size={18} /> DOWNLOADED</> : <><Download size={18} /> DOWNLOAD REPORT</>}
          </button>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-10 rounded-[3.5rem] glass-panel shadow-2xl flex-1 border-emerald-500/5 overflow-hidden relative"
        >
          <div className="absolute -bottom-10 -left-10 p-12 opacity-5 pointer-events-none rotate-12">
            <Cpu size={160} className="text-emerald-400" />
          </div>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 shadow-lg">
              <Activity size={22} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">System</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Graph Savanna', status: 'Optimal', color: '#10b981' },
              { label: 'Scoring Engine', status: 'Active', color: '#10b981' },
              { label: 'Neural Sync', status: 'Active', color: '#10b981' }
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.label}</span>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-white opacity-80">{s.status}</span>
                    <div className="w-2 h-2 rounded-full shadow-lg" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForensicsPanel;
