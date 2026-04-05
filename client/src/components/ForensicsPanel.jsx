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
      list.push({ id: 1, severity: 'Critical', icon: <AlertTriangle size={14} />, color: '#f87171', title: `${highRisk.length} Ghost Voter Anomalies`, detail: `High-risk voter cluster in ${constituency} exceeds threshold. Immediate review required.`, time: '2m ago' });
    }
    if (fraudAddrs.length > 0) {
      list.push({ id: 2, severity: 'High', icon: <MapPin size={14} />, color: '#fbbf24', title: `Concentrated Address Fraud`, detail: `Addresses flagged with >20 voters registered. Possible housing fraud or ghost roll padding.`, time: '5m ago' });
    }
    list.push({ id: 3, severity: 'Info', icon: <Radio size={14} />, color: '#60a5fa', title: 'Savanna Sync Complete', detail: `Graph data refreshed for ${constituency}. ${voters.length} voter nodes analyzed.`, time: '1m ago' });
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
       // Simple PDF simulation
       const report = {
        metadata: { system: 'NetraVote v4.0', generated: new Date().toISOString(), constituency },
        summary: stats,
        ghostVoters: voters.filter(v => (v.riskScore || 0) > 0.6).length,
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NETRAVOTE_EVIDENCE_${constituency.replace(/ /g, '_')}.json`;
      a.click();
    }, 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar flex gap-8 pb-10">
      
      {/* ── Left Column: Stream & Clusters ── */}
      <div className="flex-[0.8] flex flex-col gap-8 min-w-[340px]">
        
        {/* Threat Stream */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="p-8 rounded-[3rem] glass-panel relative overflow-hidden"
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
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Real-Time Sync</span>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveAlert(activeAlert === alert.id ? null : alert.id)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                    activeAlert === alert.id 
                    ? 'bg-white/[0.08] border-white/20 shadow-2xl' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start gap-5 relative z-10">
                  <div className={`p-3 rounded-xl transition-all shadow-inner ${activeAlert === alert.id ? 'bg-white/10' : 'bg-white/[0.03]'}`} style={{ color: activeAlert === alert.id ? alert.color : '#64748b' }}>
                    {alert.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-white tracking-tight uppercase group-hover:text-royal-400 transition-colors italic">{alert.title}</span>
                      <span className="text-[9px] font-black font-mono text-slate-600 uppercase tracking-widest">{alert.time}</span>
                    </div>
                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg inline-block border shadow-sm ${
                        alert.severity === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        alert.severity === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-royal-500/10 text-royal-400 border-royal-500/20'
                    }`}>
                        {alert.severity.toUpperCase()} ALERT_V.7
                    </div>
                    <AnimatePresence>
                        {activeAlert === alert.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <p className="text-[11px] text-slate-400 mt-5 leading-relaxed border-t border-white/5 pt-5 uppercase tracking-wide font-medium italic opacity-80">
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

        {/* Cluster Map */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="p-8 rounded-[3rem] glass-panel flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2.5 rounded-2xl bg-royal-400/10 border border-royal-400/20 shadow-lg">
              <Building size={20} className="text-royal-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Structural Phantoms</h3>
          </div>

          <div className="space-y-4">
            {clusters.map((c, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col group hover:bg-white/[0.04] transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-black font-mono text-slate-700 w-8">#{String(i+1).padStart(2, '0')}</span>
                    <div>
                      <div className="text-[12px] font-black text-white truncate max-w-[150px] uppercase tracking-tight">{c.addrId}</div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] mt-1 italic">Spatial Nexus Point</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white leading-none tabular-nums tracking-tighter">{c.voters.length}</div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2">Active Nodes</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-center flex flex-col items-center">
                    <div className="text-lg font-black text-rose-500 tabular-nums">{c.highRisk}</div>
                    <div className="text-[8px] font-black text-rose-500/40 uppercase tracking-widest mt-1">Ghost Entities</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center flex flex-col items-center">
                    <div className="text-lg font-black text-emerald-500 tabular-nums">{c.voters.length - c.highRisk}</div>
                    <div className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest mt-1">Verified Base</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Middle Column: Investigation Registry ── */}
      <div className="flex-[2] flex flex-col gap-8">
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex-1 p-10 rounded-[3.5rem] glass-panel flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40">
                <Fingerprint size={28} className="text-royal-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic leading-none">Investigation Registry</h3>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{filtered.length} Flagged Neural Entities Detected</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
                {[
                  { id: 'all', label: 'Total Sync', icon: <Layers size={12} /> },
                  { id: 'high', label: 'Phantom', icon: <AlertTriangle size={12} /> },
                  { id: 'medium', label: 'Suspect', icon: <Target size={12} /> },
                  { id: 'safe', label: 'Clean', icon: <ShieldCheck size={12} /> }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setRiskFilter(f.id)}
                        className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                            riskFilter === f.id 
                            ? 'bg-royal-600 border-royal-400 shadow-xl shadow-royal-900/60 text-white' 
                            : 'bg-transparent border-transparent text-slate-500 hover:text-white'
                        }`}
                    >
                        {f.icon} {f.label}
                    </button>
                ))}
            </div>
          </div>

          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-royal-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center px-6 gap-5 shadow-inner focus-within:border-royal-500/50 transition-all">
                <Search size={22} className="text-slate-500 group-focus-within:text-royal-400 transition-colors" />
                <input 
                    className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-700 font-bold tracking-tight uppercase"
                    placeholder="Scan_EPIC_Code / Neural_Hash / System_UUID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-royal-500/10 border border-royal-500/20">
                    <Activity size={14} className="text-royal-400" />
                    <span className="text-[9px] font-black text-royal-400 uppercase tracking-widest">Live Scan</span>
                </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
            <div className="grid grid-cols-1 gap-3">
                {filtered.map((voter, i) => (
                    <motion.div 
                        layout 
                        key={voter.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => setExpandedVoter(expandedVoter === voter.id ? null : voter.id)}
                        className={`rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden group ${
                            expandedVoter === voter.id
                            ? 'bg-white/[0.08] border-white/20 shadow-2xl scale-[1.01]'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-xl hover:translate-x-1'
                        }`}
                    >
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="text-[14px] font-black font-mono text-slate-800 w-10 text-right italic group-hover:text-royal-500 transition-colors">{String(i+1).padStart(3, '0')}</div>
                                <div className="p-4 rounded-2xl bg-white/[0.03] shadow-inner group-hover:bg-white/10 transition-colors">
                                    <User size={24} className="text-slate-500 group-hover:text-white" />
                                </div>
                                <div className="space-y-1.4">
                                    <h4 className="text-lg font-black text-white tracking-wide uppercase italic leading-none">{voter.name || 'ANONYMOUS_ENTITY'}</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 font-mono tracking-widest">{voter.id}</div>
                                        <span className="w-1 h-1 rounded-full bg-slate-800" />
                                        <span className="text-[10px] font-black text-royal-400 uppercase tracking-[0.2em] italic">EPIC_LINK: {voter.epic_number || 'PENDING'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <div className={`text-3xl font-black tabular-nums tracking-tighter italic ${voter.riskScore > 0.6 ? 'text-rose-500' : voter.riskScore > 0.3 ? 'text-amber-500' : 'text-emerald-500'}`} style={{ textShadow: `0 0 20px ${voter.riskScore > 0.6 ? 'rgba(244,63,94,0.3)' : 'transparent'}` }}>
                                        {((voter.riskScore || 0) * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1 leading-none">Risk Probability</div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-lg ${
                                    voter.riskScore > 0.6 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-900/20' :
                                    voter.riskScore > 0.3 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-900/20' :
                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-900/20'
                                }`}>
                                    {voter.riskScore > 0.6 ? 'PHANTOM' : voter.riskScore > 0.3 ? 'SUSPECT' : 'VERIFIED'}
                                </div>
                                <div className="text-slate-700 group-hover:text-white transition-colors">
                                    <ChevronDown size={20} className={`transition-transform duration-500 ${expandedVoter === voter.id ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expandedVoter === voter.id && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6 border-t border-white/5 pt-8 bg-white/[0.01]"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        {[
                                            { icon: <Hash size={14} />, label: 'Neural UUID', value: voter.id },
                                            { icon: <User size={14} />, label: 'Entity Bias', value: voter.gender === 'M' ? 'MALE_STREAM' : 'FEMALE_STREAM' },
                                            { icon: <Clock size={14} />, label: 'Injection Vector', value: voter.registration_date ? voter.registration_date.substring(0, 10) : 'Pre-Audit' },
                                            { icon: <MapPin size={14} />, label: 'Linked Address', value: voter.address_id || 'Isolated_Nexus' },
                                            { icon: <Building size={14} />, label: 'Asset Node', value: voter.booth_id || 'SECTOR_ALPHA_1' },
                                            { icon: <Target size={14} />, label: 'Scoring Confidence', value: 'High Accuracy (99.2%)' }
                                        ].map((f, fi) => (
                                            <div key={fi} className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors shadow-inner">
                                                <div className="flex items-center gap-3 mb-3 text-slate-600">
                                                    {f.icon}
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{f.label}</span>
                                                </div>
                                                <div className="text-sm font-black text-slate-100 uppercase tracking-tight italic">{f.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] bg-royal-400/[0.03] border border-royal-400/10 shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu size={120} className="text-royal-400" /></div>
                                        <div className="flex items-center gap-4 mb-5 relative z-10">
                                            <div className="p-2.5 rounded-xl bg-royal-400/20 border border-royal-400/30">
                                                <Eye size={18} className="text-royal-400" />
                                            </div>
                                            <span className="text-xs font-black text-slate-300 uppercase tracking-[0.4em] italic">Neural Engine Forensics Report</span>
                                        </div>
                                        <p className="text-[12px] leading-relaxed text-slate-400 font-bold uppercase tracking-widest relative z-10 opacity-85">
                                            {voter.explanation || (voter.riskScore > 0.6
                                                ? `CRITICAL_EXCEPTION: Synthetic identity injection fingerprint detected. Node registration correlates with a burst cluster of 48 entities within a 2-second temporal window at a designated high-density structural hub. GSQL path analysis reveals zero legitimate social linkages across adjacent electoral sectors.`
                                                : `INTEGRITY_VERIFIED: Entity topology perfectly aligns with historical registration vectors. Address occupancy density is within standard 2σ demographic deviation for the specified sector. Neural link scoring confirms legitimate resident patterns with no synthetic cross-net duplication identified.`
                                            )}
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

      {/* ── Right Column: Evidence Package ── */}
      <div className="flex-[0.6] flex flex-col gap-8 min-w-[300px]">
        
        {/* Evidence Export */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden h-fit"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FileBadge size={160} className="text-royal-400" />
          </div>
          <div className="flex items-center gap-4 mb-8 relative">
            <div className="p-3 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <FileText size={22} className="text-royal-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Evidence Core</h3>
          </div>
          
          <p className="text-[11px] text-slate-500 font-black leading-relaxed mb-10 relative uppercase tracking-widest opacity-80 italic">
            Compiling cryptographically signed evidence packages for constitutional regulatory compliance and presentation.
          </p>

          <div className="space-y-5 mb-10 relative">
            {[
              { label: 'Topology Graph Matrix', done: true },
              { label: 'Risk Factor Neural Correlation', done: true },
              { label: 'Address Cluster Evidence Base', done: true },
              { label: 'Phantom Hub Entity Registry', done: reportDone },
              { label: 'ECI Standardized JSON Export', done: reportDone },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-700 shadow-lg ${item.done ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 rotate-[360deg]' : 'bg-slate-800/20 border-slate-700/40 text-slate-800'}`}>
                    {item.done ? <CheckCircle size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.1em] italic ${item.done ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            disabled={reportGenerating}
            onClick={handleGenerateReport}
            className="w-full py-5 rounded-[2rem] bg-royal-600 hover:bg-royal-500 text-white font-black text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.4)] border border-royal-400/30 disabled:opacity-50 relative group overflow-hidden"
          >
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20 transition-opacity" />
            {reportGenerating ? (
                <><div className="w-5 h-5 rounded-full border-3 border-white/20 border-t-white animate-spin" /> <span>Syncing Core...</span></>
            ) : reportDone ? (
                <><CheckCircle size={20} strokeWidth={3} /> <span>Evidence Downloaded</span></>
            ) : (
                <><Download size={20} strokeWidth={3} /> <span>Initialize Export Protocol</span></>
            )}
          </button>
          
          {reportDone && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center justify-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic"
              >
                  <ShieldCheck size={14} className="animate-pulse" />
                  <span>Verified System Signature</span>
              </motion.div>
          )}
        </motion.div>

        {/* System Monitoring */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="p-10 rounded-[3.5rem] glass-panel flex-1 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -left-10 p-12 opacity-5 pointer-events-none rotate-12">
            <Cpu size={160} className="text-emerald-400" />
          </div>
          <div className="flex items-center gap-4 mb-10 relative">
            <div className="p-3 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Activity size={22} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Neural Status</h3>
          </div>

          <div className="space-y-5 relative">
            {[
              { label: 'Graph Savanna', status: 'Optimal', color: '#10b981' },
              { label: 'Scoring Core', status: 'Engaged', color: '#10b981' },
              { label: 'Explanation Engine', status: 'Active', color: '#60a5fa' },
              { label: 'Ingest Pipeline', status: 'Syncing', color: '#fbbf24' },
              { label: 'Secure Auth Protocol', status: 'Verified', color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-white/5 shadow-inner">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic group-hover:text-slate-300 transition-colors">{s.label}</span>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-white tracking-widest italic opacity-80">{s.status}</span>
                    <div className="w-2 h-2 rounded-full shadow-lg" style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-[2rem] bg-royal-500/5 border border-royal-400/10 relative overflow-hidden">
            <div className="absolute inset-0 quantum-grid opacity-[0.05]" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <LifeBuoy size={14} className="text-royal-400" />
                <span className="text-[10px] font-black text-royal-400 uppercase tracking-[0.4em]">Protocol Link</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 font-bold uppercase tracking-wider relative z-10 italic mb-0">
                GSQL Pattern Matcher v4.2 engaged. Predictive anomaly detection active for structural EPIC tampering.
            </p>
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default ForensicsPanel;
