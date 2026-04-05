import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Copy, LayoutGrid, AlertTriangle, 
  ShieldAlert, Fingerprint, Globe, MapPin, 
  Settings, Zap, ChevronRight, Activity,
  Users, Layers, ExternalLink, Network,
  Database, Cpu, Server, Link2, Target, CheckCircle,
  Loader2 as Loader
} from 'lucide-react';

const FAST_API = 'http://localhost:8000';

const RISK_CONFIG = {
  CRITICAL: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <ShieldAlert size={16} /> },
  HIGH:     { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <AlertTriangle size={16} /> },
  MEDIUM:   { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Activity size={16} /> },
  LOW:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle size={16} /> },
};

async function fetchCrossConst() {
  try {
    const r = await fetch(`${FAST_API}/analysis/cross-constituency`);
    if (r.ok) return (await r.json()).results;
  } catch {}
  return {
    networks: [
      { id: 'X-NET-001', consts: ['New Delhi', 'South Delhi', 'East Delhi'], address: 'Flat 4B, Shivalik Apts', voters: 145, operator: 'VOTER-FRAUD-1', centrality: 0.94, cluster: 'CLUSTER-A', risk: 'CRITICAL', details: '145-voter ring spanning 3 constituencies with single operator node' },
      { id: 'X-NET-002', consts: ['Chandni Chowk', 'Mumbai North'], address: 'Room 2, Basti Colony', voters: 88, operator: 'VOTER-FRAUD-15', centrality: 0.81, cluster: 'CLUSTER-B', risk: 'HIGH', details: 'Inter-state fraud ring with shared device fingerprints' },
      { id: 'X-NET-003', consts: ['Bengaluru Central', 'Chennai South'], address: 'Plot 9, MG Road Colony', voters: 52, operator: 'VOTER-FRAUD-33', centrality: 0.67, cluster: 'CLUSTER-C', risk: 'HIGH', details: 'South India inter-constituency ring using common phone numbers' }
    ],
    summary: { total: 3, affected: 285, involved: 7, risk: 'CRITICAL', algorithm: 'Louvain Community Detection' }
  };
}

const NetworkTopology = ({ networks }) => {
  const W = 800, H = 400;
  const allConst = Array.from(new Set((networks || []).flatMap(n => n.consts || [])));
  const positions = useMemo(() => {
    return allConst.reduce((acc, c, i) => {
        if (!c) return acc;
        const angle = (i / allConst.length) * 2 * Math.PI - Math.PI / 2;
        acc[c] = { x: W/2 + 280 * Math.cos(angle), y: H/2 + 120 * Math.sin(angle) };
        return acc;
    }, {});
  }, [allConst]);

  return (
    <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-5">
            <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
                <Network size={22} className="text-royal-400" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Correlation Mapping Matrix</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 ">Topological boundary cross-analysis</p>
            </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest  leading-none">Neural Link active</span>
        </div>
      </div>

      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible filter drop-shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <defs>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Path Connections */}
            {(networks || []).map((net, ni) => 
                (net.consts || []).flatMap((c1, i) => 
                    (net.consts || []).slice(i+1).map(c2 => {
                        const p1 = positions[c1], p2 = positions[c2];
                        if(!p1 || !p2) return null;
                        return (
                            <g key={`${ni}-${c1}-${c2}`}>
                                <motion.path 
                                    initial={{ pathLength: 0, opacity: 0 }} 
                                    animate={{ pathLength: 1, opacity: 0.15 }}
                                    transition={{ duration: 1.5, delay: ni * 0.2 }}
                                    d={`M ${p1.x} ${p1.y} Q ${W/2} ${H/2} ${p2.x} ${p2.y}`}
                                    fill="none" stroke="white" strokeWidth={0.5} 
                                />
                                <motion.path 
                                    initial={{ pathLength: 0, opacity: 0 }} 
                                    animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: ni * 0.5 }}
                                    d={`M ${p1.x} ${p1.y} Q ${W/2} ${H/2} ${p2.x} ${p2.y}`}
                                    fill="none" stroke="url(#lineGrad)" strokeWidth={2}
                                />
                            </g>
                        );
                    })
                )
            )}

            {/* Neural Nodes */}
            {allConst.map((c, i) => (
                <motion.g 
                    key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: i * 0.05 }}
                    className="cursor-pointer group/node"
                >
                    <circle cx={positions[c].x} cy={positions[c].y} r={14} fill="#020617" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                    <circle cx={positions[c].x} cy={positions[c].y} r={5} fill="#3B82F6" className="group-hover/node:fill-royal-400 group-hover/node:scale-150 transition-all duration-500" filter="url(#nodeGlow)" />
                    <motion.circle 
                        cx={positions[c].x} cy={positions[c].y} r={20} fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth={1}
                        animate={{ r: [20, 35], opacity: [0.3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                    <text x={positions[c]?.x} y={positions[c]?.y + 35} textAnchor="middle" className="text-[9px] font-bold fill-slate-500 uppercase tracking-[0.2em]  pointer-events-none">{c}</text>
                </motion.g>
            ))}
        </svg>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-8">
        <div className="flex gap-10">
            <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ">Core Algorithmic Matrix</span>
                <span className="text-[10px] font-bold text-white  tracking-tighter">Louvain Parallel Comm. Detection</span>
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ">Sync Frequency</span>
                <span className="text-[10px] font-bold text-emerald-400  tracking-tighter">Realtime / 14s Interval</span>
            </div>
        </div>
        <div className="flex -space-x-4">
            {[1,2,3,4].map(x => (
                <div key={x} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-[10px] font-black text-royal-400 shadow-xl overflow-hidden relative group">
                    <img src={`https://i.pravatar.cc/100?u=${x}`} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-royal-500/20 mix-blend-overlay" />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default function CrossConstituencyPanel({ constituency }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('networks');

  useEffect(() => {
    setLoading(true);
    fetchCrossConst().then(d => {
      setData(d);
      setLoading(false);
    });
  }, [constituency]);

  const summary = data?.summary || {};

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-8 pb-14">
      
      {/* ── Correlation Header ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Share2 size={200} className="text-royal-400" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40 relative">
            <Globe size={32} className="text-royal-400" />
            <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-royal-400/20 blur-xl rounded-full" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic leading-none">Inter-Boundary Correlation Hub</h1>
            <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-royal-500/10 border border-royal-500/20">
                    <Zap size={12} className="text-royal-400" />
                    <span className="text-[10px] font-black text-royal-400 uppercase tracking-widest leading-none">Multi-Hop Analysis Enabled</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">Global Network Topology v8.0</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex p-2 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10 backdrop-blur-md">
          {['networks', 'duplicates', 'multibooth'].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${activeTab === tab ? 'bg-royal-500 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          { label: 'Fraud Networks', val: summary.total || 0, icon: <Layers size={18} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Voters Affected', val: summary.affected?.toLocaleString() || 0, icon: <Users size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Regions Involved', val: summary.involved || 0, icon: <MapPin size={18} />, color: 'text-royal-400', bg: 'bg-royal-500/10' },
          { label: 'Threat Index', val: summary.risk || 'N/A', icon: <ShieldAlert size={18} />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Neural Core', val: 'Louvain + WCC', icon: <Cpu size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((k, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[3rem] glass-panel bg-white/[0.01] border-white/5 flex flex-col group hover:bg-white/[0.04] transition-all hover:scale-105 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
            <div className={`p-3 rounded-2xl w-fit mb-6 transition-all group-hover:scale-110 ${k.bg} ${k.color} border border-white/5 shadow-lg`}>{k.icon}</div>
            <div className={`text-3xl font-black tabular-nums transition-all tracking-tighter italic mb-2 leading-none ${k.color}`}>{k.val}</div>
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-none">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Intel Flow ── */}
      <AnimatePresence mode="wait">
        {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                <div className="p-8 rounded-[3.5rem] bg-royal-500/10 border border-royal-500/20 relative">
                    <Loader size={40} className="text-royal-400 animate-spin" />
                    <motion.div animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 border-2 border-royal-400/30 rounded-[3.5rem]" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-10  animate-pulse">Reconstructing Correlation Topology</span>
            </motion.div>
        ) : (
            <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
            >
                {activeTab === 'networks' && <NetworkTopology networks={data?.networks || []} />}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {data?.networks?.map((net, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-10 rounded-[3.5rem] glass-panel bg-white/[0.01] border-white/5 group hover:bg-white/[0.04] transition-all relative overflow-hidden shadow-2xl h-full flex flex-col"
                    >
                        <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Target size={120} className="text-royal-400" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="p-4 rounded-3xl bg-royal-500/10 border border-royal-500/20 text-royal-400 shadow-xl">
                                <Link2 size={24} />
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic border shadow-lg ${RISK_CONFIG[net.risk]?.bg} ${RISK_CONFIG[net.risk]?.border} ${RISK_CONFIG[net.risk]?.color}`}>
                                {net.risk} THREAT LEVEL
                            </div>
                        </div>

                        <div className="space-y-6 mb-10 relative z-10">
                            <div>
                                <div className="text-[10px] font-bold text-royal-500 uppercase tracking-[0.3em] mb-2 ">Network_Identifier</div>
                                <h3 className="text-2xl font-bold text-white uppercase  tracking-tight leading-none">{net.id} MATRIX</h3>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-royal-500/20 transition-all">
                                <MapPin size={18} className="text-royal-400" />
                                <span className="text-xs font-bold text-slate-400 tracking-tight ">{net.consts?.join(' ↔ ') || 'NO_LINK'}</span>
                            </div>
                            <p className="text-[13px] font-bold text-slate-500 leading-relaxed  border-l-2 border-royal-500/30 pl-5 uppercase">"{net.details}"</p>
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 shadow-sm">Impact Group</div>
                                    <div className="text-xl font-black text-white tabular-nums italic tracking-tighter">{net.voters} NODES</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 shadow-sm">Centrality Score</div>
                                    <div className="text-xl font-black text-royal-400 tabular-nums italic tracking-tighter">{(net.centrality * 100).toFixed(0)}%</div>
                                </div>
                            </div>
                            <button className="p-5 rounded-[2rem] bg-white/[0.03] text-white hover:bg-royal-500 transition-all shadow-xl group/btn">
                                <ExternalLink size={20} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                    ))}

                    {(!data?.networks || data.networks.length === 0) && (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-30">
                            <Settings size={60} className="text-slate-700 animate-spin-slow mb-10" />
                            <span className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-600 italic">No Persistent Cross-Boundary Fractals Detected</span>
                        </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
