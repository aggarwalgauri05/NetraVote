import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, AlertTriangle, ShieldCheck, User, MapPin,
  Fingerprint, Clock, ChevronDown, ChevronRight, FileText, Zap,
  Radio, Eye, CheckCircle, XCircle, Building, Hash, Calendar, Shield,
  ArrowRight, FileBadge, LifeBuoy, Activity, Target, ShieldAlert,
  Layers, Cpu, FileJson, ExternalLink, Scan, ShieldHalf
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
        metadata: { system: 'GhostWatch v4.1', generated: new Date().toISOString(), constituency },
        summary: stats,
        ghostVoters: voters.filter(v => (v.riskScore || 0) > 0.6).length,
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GHOSTWATCH_EVIDENCE_${constituency.replace(/ /g, '_')}.json`;
      a.click();
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar flex flex-col xl:flex-row gap-10 pb-16 px-2">
      
      {/* ── Left Column: Stream & Clusters ── */}
      <div className="flex-1 xl:flex-[0.8] flex flex-col gap-10 min-w-0 md:min-w-[340px]">
        
        {/* Threat Stream */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden border-rose-500/10 shadow-3xl bg-white/[0.01]"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-xl">
                <Zap size={22} className="text-rose-400" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Intelligence Stream</h3>
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none italic">Scanning</span>
            </div>
          </div>

          <div className="space-y-5 relative z-10">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveAlert(activeAlert === alert.id ? null : alert.id)}
                className={`p-8 rounded-[3rem] border transition-all cursor-pointer group relative overflow-hidden shadow-2xl ${
                    activeAlert === alert.id 
                    ? 'bg-rose-500/15 border-rose-500/40' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-rose-500/[0.05] hover:border-rose-500/20'
                }`}
              >
                <div className="flex items-start gap-6 relative z-10">
                  <div className={`p-4 rounded-2xl transition-all shadow-inner ${activeAlert === alert.id ? 'bg-rose-500/20 text-rose-400' : 'bg-white/[0.03] text-slate-500'}`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <span className="text-base font-black text-white tracking-tight uppercase group-hover:text-rose-400 transition-colors italic truncate">{alert.title}</span>
                      <span className="text-[9px] font-black font-mono text-slate-600 uppercase tracking-widest">{alert.time}</span>
                    </div>
                    <div className={`text-[9px] font-black px-3 py-1 rounded-xl inline-block border shadow-inner ${
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
                                <p className="text-[12px] text-slate-400 mt-6 leading-relaxed border-t border-rose-500/10 pt-6 uppercase tracking-wider font-bold italic opacity-80">
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
           className="p-10 rounded-[4rem] glass-panel bg-white/[0.01] border border-white/5 shadow-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
              <Building size={24} className="text-royal-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Structural Phantoms</h3>
          </div>

          <div className="space-y-5 relative z-10">
            {clusters.map((c, i) => (
              <div key={i} className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col group hover:bg-rose-500/[0.03] hover:border-rose-500/20 transition-all shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-5">
                  <div className="flex items-center gap-5">
                    <span className="text-base font-black font-mono text-slate-700 w-10">#{String(i+1).padStart(2, '0')}</span>
                    <div className="truncate w-full max-w-[200px]">
                      <div className="text-[13px] font-black text-white truncate uppercase tracking-tight mb-1 italic">{c.addrId}</div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic leading-none">Spatial Nexus Node</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col">
                    <div className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none italic">{c.voters.length}</div>
                    <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-2 italic shadow-sm">Entities</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2.5xl bg-rose-500/10 border border-rose-500/20 text-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <div className="text-2xl font-black text-rose-500 tabular-nums italic">{c.highRisk}</div>
                    <div className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mt-2 italic">Phantoms</div>
                  </div>
                  <div className="p-4 rounded-2.5xl bg-emerald-500/5 border border-emerald-500/10 text-center shadow-inner">
                    <div className="text-2xl font-black text-emerald-500 tabular-nums italic">{c.voters.length - c.highRisk}</div>
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2 italic">Verified</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Middle Column: Investigation Registry ── */}
      <div className="flex-1 xl:flex-[2] flex flex-col gap-10 min-w-0">
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex-1 p-10 md:p-14 rounded-[4.5rem] glass-panel bg-white/[0.01] shadow-3xl border-white/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 shadow-2xl shadow-rose-950/40 relative">
                <Fingerprint size={32} className="text-rose-400" />
                 <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-0 bg-rose-400/20 blur-2xl rounded-full" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight italic leading-none">Investigation Registry</h3>
                <div className="flex items-center gap-4 mt-5">
                    <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{filtered.length} Flagged Neural Entities</p>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 p-2 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-2xl shadow-2xl">
                {[
                  { id: 'all', label: 'All', icon: <Layers size={14} /> },
                  { id: 'high', label: 'Phantoms', icon: <AlertTriangle size={14} /> },
                  { id: 'medium', label: 'Suspects', icon: <Target size={14} /> }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setRiskFilter(f.id)}
                        className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-3 italic ${
                            riskFilter === f.id 
                            ? 'bg-rose-600 border-rose-400 shadow-2xl shadow-rose-900/40 text-white' 
                            : 'bg-transparent border-transparent text-slate-500 hover:text-white'
                        }`}
                    >
                        {f.icon} {f.label}
                    </button>
                ))}
            </div>
          </div>

          <div className="relative mb-10 group z-10">
            <div className="absolute inset-0 bg-rose-500/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="h-20 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex items-center px-8 gap-6 shadow-inner focus-within:border-rose-500/50 transition-all backdrop-blur-md">
                <Search size={24} className="text-slate-500 group-focus-within:text-rose-400 transition-colors" />
                <input 
                    className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-slate-700 font-black uppercase italic tracking-tight"
                    placeholder="SCAN_NEURAL_HASH / EPIC_ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-600">
                    <Scan size={18} />
                </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
            <div className="grid grid-cols-1 gap-6">
                {filtered.map((voter, i) => (
                    <motion.div 
                        layout 
                        key={voter.id}
                        className={`rounded-[3.5rem] border transition-all cursor-pointer overflow-hidden group shadow-2xl ${
                            expandedVoter === voter.id
                            ? 'bg-white/[0.08] border-rose-500/40 shadow-rose-900/20'
                            : 'bg-white/[0.02] border-white/5 hover:border-rose-500/30'
                        }`}
                    >
                        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8" onClick={() => setExpandedVoter(expandedVoter === voter.id ? null : voter.id)}>
                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <div className="p-5 rounded-3xl bg-white/[0.04] shadow-inner group-hover:bg-rose-500/20 transition-all text-slate-500 group-hover:text-rose-400 group-hover:scale-110">
                                    <User size={28} />
                                </div>
                                <div className="truncate w-full">
                                    <h4 className="text-xl font-black text-white tracking-wide uppercase italic leading-none truncate mb-3 group-hover:text-rose-400 transition-colors">{voter.name || 'ANONYMOUS_ENTITY'}</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="px-3 py-1 rounded-lg bg-slate-900/50 border border-white/5">
                                            <span className="text-[10px] font-black text-slate-600 font-mono tracking-widest">{voter.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                            <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] italic truncate leading-none">{voter.epic_number || 'EPIC_UNASSIGNED'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-10 lg:gap-14 w-full md:w-auto justify-between border-t md:border-t-0 border-white/5 pt-8 md:pt-0">
                                <div className="text-right">
                                    <div className={`text-3xl lg:text-4xl font-black tabular-nums tracking-tighter italic leading-none ${voter.riskScore > 0.6 ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-emerald-500'}`}>
                                        {((voter.riskScore || 0) * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-3 italic shadow-sm">Threat Delta</div>
                                </div>
                                <div className={`px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest italic border shadow-inner transition-all group-hover:scale-110 ${
                                    voter.riskScore > 0.6 ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-950/20' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-950/20'
                                }`}>
                                    {voter.riskScore > 0.6 ? 'PHANTOM' : 'VERIFIED'}
                                </div>
                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-rose-500/20 transition-all">
                                    <ChevronRight size={20} className={`text-slate-700 group-hover:text-white transition-transform ${expandedVoter === voter.id ? 'rotate-90' : ''}`} />
                                </div>
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expandedVoter === voter.id && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-8 pb-10 border-t border-rose-500/20 pt-10 bg-rose-500/[0.02]"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                        {[
                                            { icon: <Clock size={16} />, label: 'Temporal Entry', value: voter.registration_date?.substring(0, 10) || '2024-03-12' },
                                            { icon: <MapPin size={16} />, label: 'Nexus Link', value: voter.address_id || 'unlinked_cluster' },
                                            { icon: <Activity size={16} />, label: 'Link Assurance', value: 'High' }
                                        ].map((f, fi) => (
                                            <div key={fi} className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl hover:bg-white/[0.05] transition-all">
                                                <div className="flex items-center gap-4 mb-4 text-slate-600">
                                                    <div className="p-2 rounded-xl bg-white/5">{f.icon}</div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{f.label}</span>
                                                </div>
                                                <div className="text-base font-black text-white uppercase italic tracking-tight">{f.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-10 rounded-[3.5rem] bg-rose-500/5 border border-rose-500/20 relative overflow-hidden shadow-inner">
                                        <div className="absolute top-0 right-0 p-10 opacity-5 shadow-2xl"><Cpu size={140} className="text-rose-400 group-hover:rotate-45 transition-transform duration-1000" /></div>
                                        <div className="flex items-center gap-4 mb-5 relative z-10">
                                            <div className="p-2 rounded-xl bg-rose-500/20"><ShieldHalf size={16} className="text-rose-400" /></div>
                                            <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] italic shadow-sm">Autonomous Analysis Diagnostic</span>
                                        </div>
                                        <p className="text-sm md:text-base leading-relaxed text-slate-400 font-bold uppercase tracking-widest relative z-10 italic opacity-90 transition-all">
                                            "{voter.explanation || "System Anomaly Detected: High-risk behavior signatures identified in temporal registration stream. Topological pattern analysis indicates probable synthetic identity generation across inter-booth boundaries."}"
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
                
                {filtered.length === 0 && (
                    <div className="py-48 flex flex-col items-center justify-center opacity-30 bg-white/[0.01] rounded-[4rem] border border-dashed border-white/10">
                        <Search size={80} className="text-slate-800 animate-pulse mb-8" />
                        <span className="text-sm font-black uppercase tracking-[0.8em] text-slate-700 italic">No Registry Entities Matching Filter Crypt</span>
                    </div>
                )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right Column: Control & Export ── */}
      <div className="flex-1 xl:flex-[0.6] flex flex-col gap-10 min-w-0 md:min-w-[320px]">
        
        {/* Evidence Gen Card */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="p-10 rounded-[4rem] glass-panel border-rose-500/10 shadow-3xl relative overflow-hidden bg-white/[0.01]"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none scale-125">
            <FileBadge size={180} className="text-rose-400 shadow-2xl" />
          </div>
          
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 shadow-2xl">
              <FileText size={24} className="text-rose-400 shadow-sm" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight italic leading-none">Evidence Deck</h3>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mt-2 italic shadow-sm">Generation_Protocol_v4.1</p>
            </div>
          </div>
          
          {/* Diagnostic Visualization from Assets */}
          <div className="mb-10 rounded-[2.5rem] overflow-hidden border border-white/5 relative group cursor-pointer shadow-3xl">
                <img src="/C:/Users/Anushree Jain/.gemini/antigravity/brain/355033f0-7828-4bfe-b320-4c655ad0e6f0/media__1775567846888.png" className="w-full h-48 object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-royal-600 shadow-2xl border border-royal-400/30">
                            <FileJson size={14} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic shadow-lg">Evidence_Template_STDL</span>
                    </div>
                    <Eye size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
          </div>

          <div className="space-y-6 mb-12 relative z-10">
            {[
              { label: 'Neural Graph Matrix', done: true },
              { label: 'Cluster Proofs', done: true },
              { label: 'ECI JSON Standard', done: reportDone }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 p-4 rounded-2.5xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shadow-xl ${item.done ? 'bg-rose-500/20 border-rose-500/40 text-rose-500' : 'bg-slate-900 border-slate-800 text-slate-800'}`}>
                    {item.done ? <CheckCircle size={18} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] italic ${item.done ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <motion.button 
            disabled={reportGenerating}
            onClick={handleGenerateReport}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-7 rounded-[3rem] bg-rose-600 hover:bg-rose-500 text-white font-black text-[12px] tracking-[0.3em] uppercase flex items-center justify-center gap-5 transition-all shadow-3xl shadow-rose-900/60 disabled:opacity-50 italic group border border-rose-400/30"
          >
            {reportGenerating ? <><Loader className="w-5 h-5 animate-spin" /> SCANNING_NODES</> : reportDone ? <><CheckCircle size={22} className="group-hover:scale-110 transition-transform" /> DOWNLOADED</> : <><Download size={22} className="group-hover:-translate-y-1 transition-transform" /> GENERATE EVIDENCE</>}
          </motion.button>
        </motion.div>

        {/* System State Card */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-12 rounded-[4.5rem] glass-panel shadow-3xl flex-1 border-emerald-500/10 overflow-hidden relative bg-white/[0.01]"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
          <div className="absolute -bottom-10 -left-10 p-16 opacity-5 pointer-events-none rotate-12 scale-150">
            <Cpu size={160} className="text-emerald-400 shadow-2xl" />
          </div>
          <div className="flex items-center gap-5 mb-12 relative z-10">
            <div className="p-4 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 shadow-2xl">
              <Activity size={24} className="text-emerald-400 shadow-sm" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Engine Integrity</h3>
          </div>

          <div className="space-y-5 relative z-10">
            {[
              { label: 'Graph Savanna Core', status: 'Optimal', color: '#10b981' },
              { label: 'Neural Scoring Engine', status: 'Active', color: '#10b981' },
              { label: 'Boundary Sync Cluster', status: 'Active', color: '#10b981' }
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-emerald-500/[0.02] transition-all group">
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic transition-colors group-hover:text-emerald-500">{s.label}</span>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-white opacity-80 italic tracking-widest">{s.status}</span>
                    <div className="w-2.5 h-2.5 rounded-full shadow-2xl animate-pulse" style={{ background: s.color, boxShadow: `0 0 15px ${s.color}` }} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-14 p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between relative z-10 transition-all hover:bg-emerald-500/10 cursor-pointer group">
              <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><ExternalLink size={16} /></div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic shadow-sm">Tactical_Dashboard_Logs</span>
              </div>
              <ChevronRight size={16} className="text-emerald-800 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Loader = ({ className }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin" />
    </div>
);

export default ForensicsPanel;
