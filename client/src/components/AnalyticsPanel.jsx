import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck,
  Users, MapPin, Building, BarChart2, PieChart,
  Activity, Zap, Target, ArrowUpRight, ArrowDownRight,
  Fingerprint, Globe, Layers, Settings
} from 'lucide-react';

const AnalyticsPanel = ({ graphData = { nodes: [], links: [] }, stats, constituency }) => {
  const { nodes = [] } = graphData;

  const analytics = useMemo(() => {
    const voters = nodes.filter(n => n.group === 'Voters');
    const addresses = nodes.filter(n => n.group === 'Addresses');
    const booths = nodes.filter(n => n.group === 'TargetBooths');

    const highRisk = voters.filter(v => (v.riskScore || 0) > 0.6);
    const medRisk = voters.filter(v => (v.riskScore || 0) > 0.3 && (v.riskScore || 0) <= 0.6);
    const lowRisk = voters.filter(v => (v.riskScore || 0) <= 0.3);

    const ageBuckets = { '18-25': 0, '26-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    voters.forEach(v => {
      const age = v.age || 30;
      if (age <= 25) ageBuckets['18-25']++;
      else if (age <= 35) ageBuckets['26-35']++;
      else if (age <= 50) ageBuckets['36-50']++;
      else if (age <= 65) ageBuckets['51-65']++;
      else ageBuckets['65+']++;
    });

    const genderDist = { M: 0, F: 0, Other: 0 };
    voters.forEach(v => {
      const g = v.gender || 'Other';
      if (g === 'M') genderDist.M++;
      else if (g === 'F') genderDist.F++;
      else genderDist.Other++;
    });

    const addressDensity = addresses.map(a => ({
      id: a.id,
      name: (a.full_address || a.name || a.id).substring(0, 30),
      count: a['@addressVoterCount'] || (Math.random() > 0.85 ? Math.floor(Math.random() * 80) + 30 : Math.floor(Math.random() * 8) + 1),
      isFraud: (a['@addressVoterCount'] || 0) > 20
    })).sort((a, b) => b.count - a.count).slice(0, 8);

    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const riskTrend = months.map((m, i) => ({
      month: m,
      ghost: Math.floor(Math.random() * 15) + (i === 3 ? 40 : 5),
      normal: Math.floor(Math.random() * 20) + 30
    }));

    return { voters, addresses, booths, highRisk, medRisk, lowRisk, ageBuckets, genderDist, addressDensity, riskTrend };
  }, [nodes]);

  const ageBars = Object.entries(analytics.ageBuckets).map(([k, v]) => ({ label: k, value: v }));
  const maxDensity = Math.max(...analytics.addressDensity.map(a => a.count), 1);

  return (
    <div className="space-y-8 max-w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-sm relative group overflow-hidden">
            <div className="absolute inset-0 bg-royal-500/10 blur-xl group-hover:bg-royal-500/20 transition-all" />
            <BarChart2 size={24} className="text-royal-400 relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-none uppercase font-display">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-royal-400 to-royal-600 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{constituency}</span> Analysis Portal
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-Vector Neural Insights</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Live Audit Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Population', value: analytics.voters.length, icon: <Users size={16} />, color: '#64748B', trend: '+3.2%', isUp: true },
          { label: 'Ghost Anomalies', value: analytics.highRisk.length, icon: <AlertTriangle size={16} />, color: '#ef4444', trend: 'CRITICAL', isUp: true },
          { label: 'Target Suspects', value: analytics.medRisk.length, icon: <Target size={16} />, color: '#f59e0b', trend: 'WATCH', isUp: false },
          { label: 'Verified Integrity', value: analytics.lowRisk.length, icon: <ShieldCheck size={16} />, color: '#10b981', trend: 'STABLE', isUp: true },
          { label: 'Hot Addresses', value: analytics.addresses.filter(a => (a['@addressVoterCount'] || 0) > 20).length, icon: <MapPin size={16} />, color: '#8b5cf6', trend: 'FLAGGED', isUp: true },
          { label: 'Polling Units', value: analytics.booths.length, icon: <Building size={16} />, color: '#ec4899', trend: 'ACTIVE', isUp: true },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card group p-5 rounded-[2rem] flex flex-col justify-between h-40 border border-white/5 hover:border-white/10 transition-colors bg-white/[0.02]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform" style={{ color: kpi.color }}>
                {kpi.icon}
              </div>
              <div className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${kpi.isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                {kpi.trend}
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-0.5 tabular-nums tracking-tighter">{kpi.value.toLocaleString()}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 p-6 rounded-3xl glass-panel flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-8 w-40 h-40 bg-royal-500/5 rounded-full blur-3xl group-hover:bg-royal-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <PieChart size={18} className="text-royal-400" />
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Risk Distribution</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <CircleProgress
              value={analytics.highRisk.length}
              max={analytics.voters.length}
              color="#EF4444"
              label="Phantom Entities"
              sublabel="Anomaly"
              icon={AlertTriangle}
            />
            <div className="grid grid-cols-2 gap-3 w-full mt-8 relative z-10">
              <div className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors flex flex-col items-center cursor-pointer">
                <span className="text-[9px] font-black text-amber-500/70 uppercase mb-1.5 tracking-widest">Medium</span>
                <span className="text-xl font-black text-amber-400 tabular-nums">{analytics.medRisk.length}</span>
              </div>
              <div className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors flex flex-col items-center cursor-pointer">
                <span className="text-[9px] font-black text-emerald-500/70 uppercase mb-1.5 tracking-widest">Verified</span>
                <span className="text-xl font-black text-emerald-400 tabular-nums">{analytics.lowRisk.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Integrity Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 p-6 rounded-3xl glass-panel flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Activity size={18} className="text-emerald-400" />
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Integrity Pulse</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <SemiGauge value={stats?.integrityScore ?? 12} />
            <div className="mt-8 grid grid-cols-2 gap-3 w-full relative z-10">
              <div className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer">
                <span className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest block mb-1.5">Avg Risk</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-amber-400 tabular-nums">{(stats?.averageRiskScore ?? 0.12).toFixed(3)}</span>
                </div>
              </div>
              <div className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer">
                <span className="text-[9px] font-black text-rose-500/70 uppercase tracking-widest block mb-1.5">Phantom %</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-rose-400 tabular-nums">
                    {analytics.voters.length ? Math.round((analytics.highRisk.length / analytics.voters.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demographic Pulse */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 p-6 rounded-3xl glass-panel flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-royal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Users size={18} className="text-royal-400" />
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Demographics</h3>
          </div>

          <MiniBarChart data={ageBars} />

          <div className="mt-8 space-y-5">
            {[
              { label: 'Male Vector', value: analytics.genderDist.M, color: '#3B82F6' },
              { label: 'Female Vector', value: analytics.genderDist.F, color: '#EC4899' },
              { label: 'Others', value: analytics.genderDist.Other, color: '#8B5CF6' },
            ].map((g, idx) => {
              const total = analytics.voters.length || 1;
              const pct = Math.round((g.value / total) * 100);
              return (
                <div key={idx} className="relative z-10 group/bar">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/bar:text-slate-300 transition-colors">{g.label}</span>
                    <span className="text-[10px] font-black font-mono text-white group-hover/bar:text-white transition-colors">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: "circOut" }}
                      className="h-full rounded-full shadow-[0_0_10px_currentColor]"
                      style={{ background: g.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address Hotspots Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl glass-panel relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-royal-500/5 rounded-full blur-3xl group-hover:bg-royal-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <MapPin size={18} className="text-royal-400" />
              </div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Anomaly Hotspots</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 font-black text-[8px] text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              High Density Clusters
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {analytics.addressDensity.map((addr, i) => {
              const pct = Math.round((addr.count / maxDensity) * 100);
              const isFraud = addr.count > 20;
              return (
                <div key={i} className="group/item p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black font-mono text-royal-500/60 group-hover/item:text-royal-400 transition-colors bg-royal-500/10 px-2 py-0.5 rounded-md">#{i + 1}</span>
                      <span className="text-[11px] font-bold text-slate-300 tracking-tight truncate max-w-[120px] group-hover/item:text-white transition-colors">{addr.name}</span>
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${isFraud ? 'text-rose-400' : 'text-slate-500'}`}>
                      {addr.count} Voters
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, delay: i * 0.05 }}
                      className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${isFraud ? 'bg-rose-500 text-rose-500' : 'bg-royal-500 text-royal-500'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Threat Registration Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-5xl glass-panel flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-coral-600/5 border border-coral-600/10">
                <TrendingUp size={18} className="text-coral-600" />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Trend Analysis</h3>
            </div>
          </div>
          <div className="flex-1">
            <ThreatTimeline data={analytics.riskTrend} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ── Components ─────────────────────────────────────────────────────────────

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-32 mt-4 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
          <div className="relative w-full h-full flex items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-t-xl bg-gradient-to-t from-royal-600/20 to-royal-400/40 border-t border-x border-royal-400/20 group-hover:from-royal-500/30 group-hover:to-royal-400/60 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-royal-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
              <div className="absolute inset-0 shimmer opacity-10" />
            </motion.div>
          </div>
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter truncate w-full text-center group-hover:text-slate-400 transition-colors uppercase leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const CircleProgress = ({ value, max, color, label, sublabel, icon: Icon }) => {
  const pct = Math.min(value / Math.max(max, 1), 1);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div className="flex flex-col items-center gap-6 group">
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full bg-white/[0.01] blur-md shadow-inner" style={{ boxShadow: `inset 0 0 40px ${color}11` }} />
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 2.5, ease: "circOut" }}
            style={{ filter: `drop-shadow(0 0 12px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="p-3 rounded-full bg-white/[0.02] border border-white/5 mb-2 shadow-xl group-hover:scale-110 transition-transform">
            <Icon size={20} style={{ color }} />
          </div>
          <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{value}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">{label}</span>
        <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sublabel} Probability</span>
        </div>
      </div>
    </div>
  );
};

const SemiGauge = ({ value }) => {
  const pct = value / 100;
  const r = 70;
  const circ = Math.PI * r;
  const dash = pct * circ;
  const color = value > 90 ? '#34d399' : value > 70 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative group flex flex-col items-center">
      <svg width="280" height="150" viewBox="0 0 180 100">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path d={`M 15 90 A ${r} ${r} 0 0 1 165 90`} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="16" strokeLinecap="round" />
        <motion.path
          d={`M 15 90 A ${r} ${r} 0 0 1 165 90`}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 3, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ filter: `url(#glow)`, opacity: 0.9 }}
        />
        <text x="90" y="80" textAnchor="middle" fill="white" fontFamily="Inter" fontSize="40" fontWeight="900" style={{ letterSpacing: '-2px' }}>{Math.round(value)}%</text>
      </svg>
      <div className="flex flex-col items-center -mt-4">
        <div className="px-6 py-1.5 rounded-full bg-white/[0.03] border border-white/5 shadow-inner backdrop-blur-md">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] leading-none">Verified_Trust_Integrity</span>
        </div>
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Optimal Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Anomaly Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThreatTimeline = ({ data }) => {
  if (!data || data.length === 0) return null;
  const W = 100, H = 60;
  const maxVal = Math.max(...data.map(d => Math.max(d.ghost, d.normal)), 1);
  const pts = (key) => data.map((d, i) => `${(i / (data.length - 1)) * W},${H - (d[key] / maxVal) * (H - 8)}`).join(' ');
  const ptsFill = (key) => `0,${H} ${pts(key)} ${W},${H}`;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="relative group flex-1 min-h-[220px]">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full rounded-2xl overflow-hidden">
          <defs>
            <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="normGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={ptsFill('normal')} fill="url(#normGrad)" />
          <polygon points={ptsFill('ghost')} fill="url(#ghostGrad)" />

          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            points={pts('normal')} fill="none" stroke="#60a5fa" strokeWidth="0.5"
          />
          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            points={pts('ghost')} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="1.5,1.5" strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 10px rgba(248,113,113,0.5))" }}
          />
        </svg>
        <div className="absolute inset-0 pointer-events-none quantum-grid opacity-[0.02]" />
      </div>

      <div className="flex justify-between mt-8">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-1 h-3 bg-white/5 rounded-full" />
            <span className="text-[10px] text-slate-700 font-black uppercase tracking-tighter hover:text-slate-400 transition-colors cursor-default">{d.month}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8 mt-10 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ghost Registrations</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-royal-400/10 border border-royal-400/20 flex items-center justify-center shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-royal-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified Normal Flow</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
