import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, AreaChart, Area, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  TrendingUp, Activity, Users, MapPin, 
  AlertTriangle, Shield, CheckCircle, Info,
  Zap, Brain, Target, BarChart3, PieChart as PieIcon,
  ChevronRight, ArrowUpRight, ArrowDownRight, Layers,
  Cpu, Database, Network, Fingerprint, Scan, ShieldAlert,
  Calendar, Clock, ExternalLink, Box
} from 'lucide-react';

const COLORS = ['#f43f5e', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const GLASS_GRADIENT = "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.95))";

const AnalyticsPanel = ({ stats, constituency }) => {
  const riskDistribution = useMemo(() => [
    { name: 'Critical Phantoms', value: stats.highRisk || 12, color: '#f43f5e' },
    { name: 'Suspected Anomalies', value: stats.mediumRisk || 24, color: '#fbbf24' },
    { name: 'Verified Entities', value: (stats.totalVoters || 450) - (stats.highRisk || 12) - (stats.mediumRisk || 24), color: '#10b981' }
  ], [stats]);

  const demographicData = useMemo(() => [
    { age: '18-25', ghost: 12, real: 45 },
    { age: '26-40', ghost: 8, real: 120 },
    { age: '41-60', ghost: 15, real: 180 },
    { age: '60+', ghost: 22, real: 85 }
  ], []);

  const temporalAnomalies = useMemo(() => [
    { time: '08:00', load: 45, threat: 2 },
    { time: '10:00', load: 85, threat: 12 },
    { time: '12:00', load: 120, threat: 45 },
    { time: '14:00', load: 110, threat: 68 },
    { time: '16:00', load: 95, threat: 30 },
    { time: '18:00', load: 30, threat: 10 }
  ], []);

  const clusterDensity = useMemo(() => [
    { x: 10, y: 30, z: 200, name: 'S-Block Cluster' },
    { x: 45, y: 80, z: 450, name: 'Central Ghetto' },
    { x: 80, y: 20, z: 120, name: 'North Slums' },
    { x: 25, y: 55, z: 300, name: 'Annex Park' }
  ], []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-3xl bg-slate-950/90 backdrop-blur-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">{label || 'NEURAL_SLICE'}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-4 py-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <div className="flex-1 flex items-center justify-between gap-10">
                <span className="text-[11px] font-black text-white/70 uppercase italic">{entry.name}</span>
                <span className="text-[12px] font-black text-white tabular-nums italic">{entry.value}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent px-2 pb-20">
      
      {/* ── Top Header Section ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-10">
        <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-8"
        >
          <div className="p-6 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 shadow-2xl relative">
            <BarChart3 size={36} className="text-rose-400" />
            <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-rose-400/20 blur-2xl rounded-full" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight italic leading-none">Forensic Intelligence</h2>
            <div className="flex items-center gap-6 mt-5">
                <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-slate-900 border border-white/5 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">{constituency}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Database size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] font-mono italic">SYNC_ACTIVE_04.1</span>
                </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-4">
             <button className="px-8 py-4 rounded-[2rem] bg-white/[0.03] border border-white/5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all flex items-center gap-3">
                <Calendar size={16} /> LAST 24H
            </button>
             <button className="px-8 py-4 rounded-[2rem] bg-rose-600 shadow-2xl shadow-rose-900/40 border border-rose-400/30 text-[11px] font-black text-white uppercase tracking-[0.3em] italic hover:scale-105 transition-all flex items-center gap-3">
                <TrendingUp size={16} /> LIVE FEED
            </button>
        </div>
      </div>

      {/* ── Metric Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Neural Threat Level', val: `${(stats.riskScore * 100).toFixed(1)}%`, icon: <Brain size={20} />, color: 'rose', sub: '+4.2% from baseline' },
          { label: 'Synthetic Entities', val: stats.highRisk || 0, icon: <Fingerprint size={20} />, color: 'amber', sub: 'Detected Cluster' },
          { label: 'Network Confidence', val: '98.4%', icon: <Shield size={20} />, color: 'emerald', sub: 'Engine Health Perfect' },
          { label: 'Spatial Coverage', val: '100%', icon: <Scan size={20} />, color: 'royal', sub: 'All Nodes Online' }
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-10 rounded-[3.5rem] glass-panel bg-white/[0.01] border-white/5 shadow-23xl relative overflow-hidden group hover:bg-${m.color}-500/[0.03] transition-all`}
          >
            <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={`p-4 rounded-2xl bg-${m.color}-500/10 border border-${m.color}-500/20 text-${m.color}-400 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                {m.icon}
              </div>
              <ArrowUpRight size={18} className="text-slate-800 group-hover:text-white transition-colors" />
            </div>
            <div className="relative z-10">
                <div className="text-4xl font-black text-white italic tabular-nums tracking-tighter leading-none mb-3">{m.val}</div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">{m.label}</div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                <span className={`text-[9px] font-black uppercase text-${m.color}-500 italic`}>{m.sub}</span>
                <div className={`w-8 h-1 bg-${m.color}-500/20 rounded-full overflow-hidden`}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className={`h-full bg-${m.color}-500 shadow-[0_0_10px_#f43f5e]`}
                    />
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Analytics Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Risk Distribution Pie */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 md:p-12 rounded-[4.5rem] glass-panel bg-white/[0.01] border-white/5 shadow-3xl flex flex-col min-h-[500px] relative overflow-hidden"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-xl"><PieIcon size={20} /></div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Threat Allocation</h3>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-600"><Target size={16} /></div>
          </div>

          <div className="flex-1 min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={135}
                        paddingAngle={10}
                        dataKey="value"
                    >
                        {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-10 relative z-10">
            {riskDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group scale-x-105">
                <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full shadow-2xl" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }} />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic transition-colors group-hover:text-white">{entry.name}</span>
                </div>
                <span className="text-base font-black text-white italic tabular-nums">{entry.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Temporal Attack Vectors */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-2 p-10 md:p-14 rounded-[4.5rem] glass-panel bg-white/[0.01] border-white/5 shadow-3xl relative overflow-hidden flex flex-col"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-[2.5rem] bg-royal-400/10 border border-royal-400/20 text-royal-400 shadow-2xl"><Activity size={28} /></div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Temporal Anomaly Flux</h3>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mt-3 italic shadow-sm">Detection Window: T-Minus 12h</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-2 rounded-[2rem] bg-white/[0.03] border border-white/5 shadow-inner">
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">THREAT_INT</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-royal-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">BASE_LOAD</span>
                </div>
            </div>
          </div>

          <div className="flex-1 min-h-[450px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temporalAnomalies} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                        dataKey="time" 
                        stroke="#334155" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#475569', fontWeight: 900 }}
                        dy={20}
                    />
                    <YAxis 
                        stroke="#334155" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#475569', fontWeight: 900 }}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="threat" name="Threat" stroke="#f43f5e" strokeWidth={5} fillOpacity={1} fill="url(#colorThreat)" />
                    <Area type="monotone" dataKey="load" name="Load" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Demographic Skepticism */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
             className="xl:col-span-2 p-10 md:p-14 rounded-[4.5rem] glass-panel bg-white/[0.01] border-white/5 shadow-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
          <div className="flex items-center gap-6 mb-16 relative z-10">
              <div className="p-5 rounded-[2rem] bg-amber-400/10 border border-amber-400/20 text-amber-400 shadow-2xl relative">
                <Users size={28} />
                 <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Demographic Skeleton Analysis</h3>
          </div>

          <div className="h-[400px] relative z-10 px-4">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographicData} barGap={12}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="age" stroke="#475569" fontSize={11} fontWeight={900} axisLine={false} tickLine={false} dy={15} />
                      <YAxis stroke="#475569" fontSize={11} fontWeight={900} axisLine={false} tickLine={false} dx={-15} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="ghost" name="Phantoms" fill="#f43f5e" radius={[20, 20, 6, 6]} barSize={50} />
                      <Bar dataKey="real" name="Verified" fill="#1e293b" radius={[20, 20, 6, 6]} barSize={50} stroke="rgba(255,255,255,0.1)" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
          
          <div className="mt-14 p-8 rounded-[3rem] bg-rose-500/5 border border-rose-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 group cursor-pointer hover:bg-rose-500/10 transition-all shadow-inner">
               <div className="flex items-center gap-6">
                    <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform"><ShieldAlert size={20} /></div>
                    <div>
                        <p className="text-base font-black text-white uppercase italic tracking-tight mb-1">Unusual Skew: Age-Cohort (60+)</p>
                        <p className="text-[10px] font-black text-rose-500/70 uppercase tracking-[0.2em] italic">Deceased registration patterns detected in Central District.</p>
                    </div>
               </div>
               <div className="flex items-center gap-4 text-rose-500 font-black text-[11px] uppercase tracking-widest italic group-hover:translate-x-2 transition-transform">
                   INVESTIGATE_SLICE <ArrowRight size={16} />
               </div>
          </div>
        </motion.div>

        {/* Spatial Density Scatter / Cluster Asset */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
             className="p-10 md:p-12 rounded-[4.5rem] glass-panel bg-white/[0.01] border-white/5 shadow-3xl flex flex-col gap-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xl"><Layers size={20} /></div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Cluster Density Diagnostic</h3>
            </div>
             <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-600"><Box size={16} /></div>
          </div>

           {/* Forensic Cluster Diagnostic Asset */}
          <div className="rounded-[3rem] overflow-hidden border border-white/5 relative group cursor-pointer shadow-3xl bg-slate-900/50">
                <img src="/C:/Users/Anushree Jain/.gemini/antigravity/brain/355033f0-7828-4bfe-b320-4c655ad0e6f0/media__1775567846845.png" className="w-full h-64 object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/95 via-obsidian-950/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic shadow-sm">SPATIAL_SCAN_COMPLETE</span>
                    </div>
                    <p className="text-[13px] font-black text-white uppercase italic tracking-tight leading-relaxed mb-6">Neural link topology across inter-constituency boundaries shows 14 detected phantom corridors.</p>
                     <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 w-fit">
                        <Scan size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">ANALYZE_CORRIDOR_V4</span>
                    </div>
                </div>
          </div>

          <div className="flex-1 space-y-4 relative z-10">
              {[
                  { label: 'Cluster Connectivity', val: '0.84', sub: 'Critical Topology' },
                  { label: 'Link Assurance Index', val: '0.92', sub: 'Optimal Engine' }
              ].map((item, idx) => (
                  <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-emerald-500/[0.03] transition-all group shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic transition-colors group-hover:text-emerald-500">{item.label}</span>
                         <span className="text-xl font-black text-white italic tabular-nums">{item.val}</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${parseFloat(item.val) * 100}%` }}
                              transition={{ duration: 1.5, delay: 0.2 }}
                              className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                          />
                      </div>
                      <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.3em] italic mt-4">{item.sub}</p>
                  </div>
              ))}
          </div>

          <button className="w-full py-8 rounded-[3rem] bg-white/[0.03] border border-white/10 text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white/[0.08] transition-all group italic overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <ExternalLink size={18} className="text-emerald-500" /> EXPORT_DIAGNOSTIC_SUITE
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default AnalyticsPanel;
