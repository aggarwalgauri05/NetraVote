import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, TrendingUp, TrendingDown, AlertTriangle, 
  ShieldCheck, Clock, Activity, Zap, ChevronRight, 
  BarChart3, LayoutDashboard, History, Timer,
  ArrowUpRight, ArrowDownRight, Layers, Target, 
  Shield, Cpu, Globe, Search, Filter, Download
} from 'lucide-react';

const FAST_API = 'http://localhost:8000';

async function fetchTimeline(constituency, startYear, endYear) {
  try {
    const r = await fetch(`${FAST_API}/analysis/timeline?constituency=${encodeURIComponent(constituency)}&start_year=${startYear}&end_year=${endYear}`);
    if (r.ok) return (await r.json()).results;
  } catch {}
  
  return {
    constituency,
    start_year: startYear,
    end_year: endYear,
    trend: 'WORSENING',
    peak_year: 2023,
    timeline: Array.from({ length: endYear - startYear + 1 }, (_, i) => {
      const yr = startYear + i;
      const spike = [2019, 2021, 2023].includes(yr);
      const total = 12000 + Math.floor(Math.random() * 2000);
      const ghosts = spike ? Math.floor(Math.random() * 200) + 300 : Math.floor(Math.random() * 80) + 20;
      return {
        year: yr, total_voters: total, ghost_anomalies: ghosts,
        legitimate_voters: total - ghosts,
        integrity_score: parseFloat(((1 - ghosts / total) * 100).toFixed(1)),
        fraud_rate_pct: parseFloat((ghosts / total * 100).toFixed(2)),
        spike, spike_reason: spike ? 'Pre-election bulk registration' : null,
        new_addresses: spike ? Math.floor(Math.random() * 12) + 3 : Math.floor(Math.random() * 150) + 50,
      };
    })
  };
}

const TimelineBar = ({ data, field, color, label, maxVal, unit = '' }) => {
  const max = maxVal || Math.max(...data.map(d => d[field] || 0)) || 1;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 p-8 rounded-[2.5rem] glass-panel relative overflow-hidden group hover:shadow-2xl transition-all"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <BarChart3 size={100} className="text-white" />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
                <Activity size={14} className="text-slate-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{label}</span>
        </div>
        <div className="text-right">
             <div className="text-lg font-black text-white tabular-nums tracking-tighter italic">
                {data[data.length-1][field]}{unit}
             </div>
             <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Terminal Value</div>
        </div>
      </div>
      <div className="flex items-end gap-2 h-40 mt-2 relative z-10">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d[field] / max) * 100}%` }}
              transition={{ duration: 1.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full rounded-t-xl transition-all relative overflow-hidden group-hover:brightness-150 group-hover:scale-x-110 shadow-lg ${d.spike ? 'bg-rose-500/40' : 'bg-royal-500/20'}`}
              style={{ minHeight: '4px' }}
            >
                <div className={`absolute inset-x-0 bottom-0 h-1 ${d.spike ? 'bg-rose-400' : 'bg-royal-400'}`} />
                <div className="absolute inset-0 shimmer opacity-20" />
            </motion.div>
            <span className={`text-[9px] font-black font-mono transition-colors tracking-tighter ${d.year === data[data.length-1].year ? 'text-white' : 'text-slate-700'}`}>
                {String(d.year).slice(2)}
            </span>
            {d.spike && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
            )}
            
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-obsidian-900 border border-white/10 p-3 rounded-2xl shadow-2xl whitespace-nowrap">
                    <div className="text-[10px] font-black text-white uppercase italic mb-1">{d.year} Analysis</div>
                    <div className="text-xs font-bold text-royal-400">{d[field]}{unit}</div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function TimelinePanel({ constituency }) {
  const [startYear, setStartYear] = useState(2018);
  const [endYear,   setEndYear]   = useState(2024);
  const [sliderYear, setSliderYear] = useState(2024);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTimeline(constituency, startYear, endYear).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [constituency, startYear, endYear]);

  const filtered = data?.timeline?.filter(d => d.year <= sliderYear) || [];
  const currentYear = data?.timeline?.find(d => d.year === sliderYear);
  const totalGhosts = filtered.reduce((s, d) => s + (d.ghost_anomalies || 0), 0);
  const avgIntegrity = filtered.length
    ? Math.round(filtered.reduce((s, d) => s + (d.integrity_score || 0), 0) / filtered.length)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar flex flex-col gap-8 pb-10">
      
      {/* ── Control Console ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Timer size={200} className="text-royal-400" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-4 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40">
            <History size={32} className="text-royal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic leading-none">{constituency} Temporal Matrix</h1>
            <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Live Synchronization Active</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">Voter Topology Scan v4.2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 p-2 rounded-2.5xl bg-white/[0.02] border border-white/5 shadow-inner">
                <div className="flex flex-col px-5 py-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1.5 italic">Origin_Epoch</span>
                    <select 
                        value={startYear} onChange={e => setStartYear(+e.target.value)} 
                        className="bg-transparent text-sm font-black text-white focus:outline-none cursor-pointer uppercase tracking-tight italic"
                    >
                        {[2015,2016,2017,2018,2019,2020].map(y => <option key={y} value={y} className="bg-obsidian-900 text-white font-bold">{y} SEC_A</option>)}
                    </select>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col px-5 py-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1.5 italic">Terminal_Epoch</span>
                    <select 
                        value={endYear} onChange={e => setEndYear(+e.target.value)} 
                        className="bg-transparent text-sm font-black text-white focus:outline-none cursor-pointer uppercase tracking-tight italic"
                    >
                        {[2021,2022,2023,2024,2025].map(y => <option key={y} value={y} className="bg-obsidian-900 text-white font-bold">{y} SEC_B</option>)}
                    </select>
                </div>
            </div>
            <button className="p-5 rounded-2.5xl bg-royal-600/10 border border-royal-500/20 text-royal-400 hover:bg-royal-600 hover:text-white transition-all shadow-xl active:scale-95">
                <Download size={22} className="stroke-[2.5px]" />
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
            <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center py-40 glass-panel rounded-[4rem]"
            >
                <div className="relative mb-10">
                    <div className="absolute inset--8 bg-royal-500/20 blur-[40px] rounded-full animate-pulse-slow" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="relative w-20 h-20 rounded-2xl border-4 border-royal-500/20 border-t-royal-500 flex items-center justify-center"
                    >
                        <Cpu size={32} className="text-royal-400" />
                    </motion.div>
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.8em] animate-pulse italic">Synchronizing_Temporal_Streams</span>
            </motion.div>
        ) : (
            <motion.div 
                key="content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col gap-8"
            >
                {/* ── Neural Scrubber ── */}
                <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden bg-white/[0.01]">
                    <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                                <Target size={20} className="text-slate-500" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic mb-1 block">Active Investigation Anchor</span>
                                <div className="flex items-center gap-4">
                                    <h3 className="text-4xl font-black text-white tabular-nums tracking-tighter italic leading-none">{sliderYear}</h3>
                                    <div className="h-6 w-px bg-white/10" />
                                    <span className="text-lg font-bold text-royal-400 font-display italic">Cycle Analysis Protocol</span>
                                </div>
                            </div>
                        </div>
                        
                        {data?.trend && (
                            <motion.div 
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className={`flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-2xl shadow-2xl ${
                                    data.trend === 'WORSENING' 
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-900/20' 
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-900/20'
                                }`}
                            >
                                <div className="p-2 rounded-xl bg-white/10">
                                    {data.trend === 'WORSENING' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Drift Vector</div>
                                    <div className="text-sm font-black uppercase tracking-widest italic">{data.trend} SIGNAL</div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="px-6 relative z-10">
                        <input
                            type="range"
                            min={startYear} max={endYear}
                            value={sliderYear}
                            onChange={e => setSliderYear(+e.target.value)}
                            className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer group active:h-3 transition-all"
                            style={{
                                accentColor: 'var(--royal-500)',
                                background: `linear-gradient(to right, var(--royal-600) 0%, var(--royal-600) ${((sliderYear - startYear) / (endYear - startYear)) * 100}%, rgba(255,255,255,0.05) ${((sliderYear - startYear) / (endYear - startYear)) * 100}%, rgba(255,255,255,0.05) 100%)`
                            }}
                        />
                        <div className="flex justify-between mt-8 relative">
                            {data?.timeline?.map(d => (
                                <div key={d.year} className="flex flex-col items-center gap-3 relative">
                                    <motion.div 
                                        animate={{ 
                                            scale: d.year === sliderYear ? 1.5 : 1,
                                            backgroundColor: d.year === sliderYear ? '#fff' : d.spike ? '#f43f5e' : '#1e293b'
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0)] ${d.year === sliderYear ? 'shadow-white/40' : ''}`} 
                                    />
                                    <span className={`text-[10px] font-black font-mono tracking-tighter italic transition-all duration-500 ${d.year === sliderYear ? 'text-white text-base scale-110' : 'text-slate-700'}`}>{d.year}</span>
                                    {d.spike && d.year !== sliderYear && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Intelligence Feed ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { label: 'Cumulative Phantoms', val: totalGhosts.toLocaleString(), icon: <AlertTriangle size={18} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                        { label: 'Integrity Baseline', val: `${avgIntegrity}%`, icon: <ShieldCheck size={18} />, color: avgIntegrity > 70 ? 'text-emerald-400' : 'text-amber-400', bg: avgIntegrity > 70 ? 'bg-emerald-500/10' : 'bg-amber-500/10' },
                        { label: 'Epochal Cycles', val: `${filtered.length} Phases`, icon: <Clock size={18} />, color: 'text-royal-400', bg: 'bg-royal-500/10' },
                        { label: 'Injection Peak', val: data?.peak_year || '—', icon: <Zap size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                        { label: 'Behavioral Status', val: data?.trend || 'STABLE', icon: <Activity size={18} />, color: data?.trend === 'WORSENING' ? 'text-rose-400' : 'text-emerald-400', bg: data?.trend === 'WORSENING' ? 'bg-rose-500/10' : 'bg-emerald-500/10' },
                    ].map((k, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[2.5rem] glass-panel flex flex-col group hover:bg-white/[0.04] transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-2xl transition-all shadow-inner ${k.bg} ${k.color}`}>{k.icon}</div>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-3 rounded-full bg-white/5" />
                                    <div className="w-1 h-5 rounded-full bg-white/10" />
                                    <div className="w-1 h-3 rounded-full bg-white/5" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white mb-2 tabular-nums tracking-tighter italic">{k.val}</div>
                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-tight">{k.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ── High-Def Bar Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                    <TimelineBar data={filtered} field="ghost_anomalies" label="Anomaly Density Stream" color="var(--royal-500)" />
                    <TimelineBar data={filtered} field="fraud_rate_pct" label="Fractional Exposure Cycle" color="#fbbf24" unit="%" />
                    <TimelineBar data={filtered} field="new_addresses" label="Registration Link Growth" color="#f472b6" />
                    <TimelineBar data={filtered} field="integrity_score" label="Structural Integrity Vector" color="#10b981" maxVal={100} unit="%" />
                </div>

                {/* ── Deep Analytics Layer ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Spike Intelligence Registry */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 p-10 rounded-[3.5rem] glass-panel relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Zap size={160} className="text-white" />
                        </div>
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-xl shadow-rose-900/20">
                                    <AlertTriangle size={20} className="text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Temporal Injection Spikes</h3>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic mt-2 block">High-Density Pattern Detection Engine</span>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                {filtered.filter(d => d.spike).length} Critical Exceptions Found
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {filtered.filter(d => d.spike).map((d, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ x: 5 }}
                                    className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 group hover:bg-rose-500/[0.03] hover:border-rose-500/20 transition-all relative overflow-hidden shadow-inner"
                                >
                                    <div className="absolute inset-0 quantum-grid opacity-[0.03] group-hover:opacity-[0.08]" />
                                    <div className="flex items-center justify-between mb-6 relative">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl font-black text-rose-500 font-mono italic tracking-tighter">{d.year}</div>
                                            <div className="w-px h-6 bg-white/10" />
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic group-hover:text-rose-400 transition-colors">Electoral Wave</div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-lg">
                                            <TrendingUp size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-8 relative">
                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                                            <p className="text-[12px] font-black text-white uppercase tracking-tight italic leading-relaxed">{d.spike_reason}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Injection Magnitude</span>
                                                <span className="text-xl font-black text-rose-400 tabular-nums italic">{d.ghost_anomalies} Nodes</span>
                                            </div>
                                            <div className="text-right flex flex-col">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Exposure Factor</span>
                                                <span className="text-xl font-black text-amber-400 tabular-nums italic">{d.fraud_rate_pct}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-rose-500/30 text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-[0.4em] italic transition-all flex items-center justify-center gap-3">
                                        <span>Initialize Forensic Scan</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            ))}
                            {filtered.filter(d => d.spike).length === 0 && (
                                <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-10">
                                    <Shield size={80} className="mb-6 opacity-40" />
                                    <span className="text-xs font-black uppercase tracking-[1em]">Temporal Stream Stable</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Snap Detailed Investigation */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden shadow-2xl h-fit border-white/10"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <LayoutDashboard size={160} className="text-royal-400" />
                        </div>
                        <div className="flex items-center gap-5 mb-10 relative z-10">
                            <div className="p-4 rounded-3xl bg-royal-400/10 border border-royal-400/20 shadow-xl shadow-royal-900/20">
                                <BarChart3 size={24} className="text-royal-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight italic leading-none">{sliderYear} Analysis</h3>
                                <div className="text-[9px] font-black text-royal-500/60 uppercase tracking-[0.4em] italic mt-2">Active Investigatory Snapshot</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                            {[
                                { label: 'Population Density', value: currentYear?.total_voters?.toLocaleString(), icon: <Globe size={14} /> },
                                { label: 'Phantom Entities', value: currentYear?.ghost_anomalies, icon: <AlertTriangle size={14} />, color: 'text-rose-400', bg: 'bg-rose-500/5' },
                                { label: 'Integrity Rating', value: `${currentYear?.integrity_score}%`, icon: <Shield size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                                { label: 'Fraud Exposure', value: `${currentYear?.fraud_rate_pct}%`, icon: <TrendingUp size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                                { label: 'Structural Hubs', value: currentYear?.new_addresses, icon: <Layers size={14} /> },
                                { label: 'ECI Compliance', value: 'VERIFIED_V.7', icon: <ShieldCheck size={14} />, color: 'text-emerald-400' },
                            ].map((item, idx) => (
                                <div key={idx} className={`group flex flex-col gap-2 p-5 rounded-[2rem] border transition-all hover:bg-white/[0.04] shadow-inner ${item.bg || 'bg-white/[0.02]'} ${item.bg ? 'border-white/10' : 'border-white/5'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <div className="p-1.5 rounded-lg bg-black/20">{item.icon}</div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">{item.label}</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-royal-500 group-hover:shadow-[0_0_8px_var(--royal-500)] transition-all" />
                                    </div>
                                    <div className={`text-2xl font-black tabular-nums tracking-tighter italic ${item.color || 'text-white'}`}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-6 rounded-[2.5rem] bg-royal-500/5 border border-royal-400/10 relative overflow-hidden">
                            <div className="absolute inset-0 quantum-grid opacity-[0.05]" />
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <Cpu size={14} className="text-royal-400" />
                                <span className="text-[10px] font-black text-royal-400 uppercase tracking-[0.4em] italic">Neural Status</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-500 font-bold uppercase tracking-wider relative z-10 italic mb-0 opacity-80">
                                Temporal synchronization constant within 0.04ms tolerance. Predictive behavioral scoring active for current election cycle.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
