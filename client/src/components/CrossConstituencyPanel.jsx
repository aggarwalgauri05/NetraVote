import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Copy, LayoutGrid, AlertTriangle, 
  ShieldAlert, Fingerprint, Globe, MapPin, 
  Settings, Zap, ChevronRight, Activity,
  Users, Layers, ExternalLink, Network,
  Database, Cpu, Server, Link2, Target, CheckCircle,
  Loader2 as Loader, Eye, Download, Info
} from 'lucide-react';

const FAST_API = 'http://localhost:8000';

const RISK_CONFIG = {
  CRITICAL: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <ShieldAlert size={16} /> },
  HIGH:     { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <AlertTriangle size={16} /> },
  MEDIUM:   { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Activity size={16} /> },
  LOW:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle size={16} /> },
};

async function fetchCrossConst(c) {
  const cName = c || 'New Delhi';
  const cHash = cName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  try {
    const r = await fetch(`${FAST_API}/analysis/cross-constituency?constituency=${encodeURIComponent(cName)}`);
    if (r.ok) {
        const data = await r.json();
        // Backend returns { results: { networks: [...], summary: {...} } }
        return data.results;
    }
  } catch (err) {
      console.error("Cross-Constituency Fetch Error:", err);
  }
  
  // Fallback / Seed with constituency name hash for deterministic demo variety
  const seed1 = (cHash % 50) + 10;
  const seed2 = (cHash % 30) + 5;
  const seed3 = (cHash % 20) + 2;

  return {
    networks: [
      { id: `X-NET-${cHash}-01`, consts: [cName, 'South Delhi', 'East Delhi'], address: 'Flat 4B, Shivalik Apts', voters: 100 + seed1, operator: `OP-${cHash}-1`, centrality: 0.85 + (seed3 / 100), cluster: 'CLUSTER-A', risk: 'CRITICAL', details: `${100 + seed1}-voter ring spanning constituencies near ${cName}` },
      { id: `X-NET-${cHash}-02`, consts: ['Chandni Chowk', cName, 'Mumbai North'], address: 'Room 2, Basti Colony', voters: 50 + seed2, operator: `OP-${cHash}-2`, centrality: 0.70 + (seed3 / 100), cluster: 'CLUSTER-B', risk: 'HIGH', details: `Inter-state fraud ring sharing phone numbers in ${cName}` }
    ],
    summary: { total: 2, affected: 150 + seed1 + seed2, involved: 4, risk: 'CRITICAL', algorithm: 'Louvain Community Detection' }
  };
}

const ForensicAsset = ({ title, path, desc }) => (
    <div className="flex flex-col gap-6 md:flex-row items-center p-8 rounded-[3rem] glass-panel bg-white/[0.01] border border-white/5 shadow-2xl group hover:bg-white/[0.04] transition-all">
        <div className="w-full md:w-1/3 aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <img src={path} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-br from-royal-500/20 to-transparent mix-blend-overlay" />
        </div>
        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-royal-400/10 border border-royal-400/20">
                    <Fingerprint size={16} className="text-royal-400" />
                </div>
                <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{title}</h4>
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed border-l-2 border-white/5 pl-6 italic">{desc}</p>
            <div className="flex items-center gap-4 pt-4">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-[9px] font-black text-white uppercase tracking-widest transition-all">
                    Analyze Cluster <Target size={14} />
                </button>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] font-black text-royal-400 italic">ECI_STAMP_VERIFIED</span>
            </div>
        </div>
    </div>
);

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
    <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden group shadow-3xl border border-white/5">
      <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-2xl relative overflow-hidden">
                <Network size={24} className="text-royal-400" />
                <motion.div animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-royal-500/20 blur-xl rounded-full" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Correlation Mapping Matrix</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 block opacity-60">Topological boundary cross-analysis layer 7</p>
            </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md shadow-lg transition-transform group-hover:scale-105">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none italic">Neural_Link active</span>
        </div>
      </div>

      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible filter drop-shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            <defs>
                <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
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
                                    animate={{ pathLength: 1, opacity: 0.2 }}
                                    transition={{ duration: 2, delay: ni * 0.3 }}
                                    d={`M ${p1.x} ${p1.y} Q ${W/2} ${H/2} ${p2.x} ${p2.y}`}
                                    fill="none" stroke="white" strokeWidth={0.8} strokeDasharray="4 4"
                                />
                                <motion.path 
                                    initial={{ pathLength: 0, opacity: 0 }} 
                                    animate={{ pathLength: [0, 1, 0], opacity: [0, 0.6, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: ni * 0.8 }}
                                    d={`M ${p1.x} ${p1.y} Q ${W/2} ${H/2} ${p2.x} ${p2.y}`}
                                    fill="none" stroke="url(#lineGrad)" strokeWidth={3}
                                />
                            </g>
                        );
                    })
                )
            )}

            {/* Neural Nodes */}
            {allConst.map((c, i) => (
                <motion.g 
                    key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: i * 0.1 }}
                    className="cursor-pointer group/node"
                >
                    <circle cx={positions[c].x} cy={positions[c].y} r={18} fill="#020617" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />
                    <circle cx={positions[c].x} cy={positions[c].y} r={6} fill="#3B82F6" className="group-hover/node:fill-royal-400 group-hover/node:scale-150 transition-all duration-500 shadow-2xl" filter="url(#nodeGlow)" />
                    <motion.circle 
                        cx={positions[c].x} cy={positions[c].y} r={24} fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth={1}
                        animate={{ r: [24, 45], opacity: [0.4, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                    />
                    <text x={positions[c]?.x} y={positions[c]?.y + 45} textAnchor="middle" className="text-[10px] font-black fill-slate-500 uppercase tracking-[0.3em] italic pointer-events-none group-hover/node:fill-white transition-colors">{c}</text>
                </motion.g>
            ))}
        </svg>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-10">
        <div className="flex gap-12">
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Neural Engine State</span>
                <span className="text-xs font-black text-white italic tracking-tight uppercase">Parallel_Louvain_Comm_v.9</span>
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Sync Frequency</span>
                <span className="text-xs font-black text-emerald-400 italic tracking-tight uppercase">Realtime / 14s Protocol</span>
            </div>
        </div>
        <div className="flex -space-x-5">
            {[1,2,3,4,5].map(x => (
                <motion.div 
                    key={x} 
                    whileHover={{ y: -8, scale: 1.1, zIndex: 10 }}
                    className="w-12 h-12 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-[10px] font-black text-royal-400 shadow-2xl overflow-hidden relative group cursor-pointer"
                >
                    <img src={`https://i.pravatar.cc/100?u=${x + 50}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-royal-500/20 mix-blend-overlay" />
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                </motion.div>
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
    fetchCrossConst(constituency).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [constituency]);

  const summary = data?.summary || {};

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-10 pb-16 px-2">
      
      {/* ── Correlation Header ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex flex-col lg:flex-row items-center justify-between shadow-3xl border border-white/5 gap-8">
        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none scale-125">
            <Share2 size={240} className="text-royal-400" />
        </div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-6 rounded-[2.5rem] bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40 relative">
            <Globe size={36} className="text-royal-400" />
            <motion.div animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.4, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-royal-400/20 blur-2xl rounded-full" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight italic leading-none">Inter-Boundary Correlation Hub</h1>
            <div className="flex flex-wrap items-center gap-4 mt-5">
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-royal-500/10 border border-royal-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Zap size={14} className="text-royal-400 " />
                    <span className="text-[11px] font-black text-royal-400 uppercase tracking-[0.2em] leading-none italic">Multi-Hop Analysis Enabled</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic leading-none">Topology_V_8.4.1</span>
            </div>
          </div>
        </div>

        <div className="flex p-2 rounded-2.5xl bg-white/[0.03] border border-white/5 relative z-10 backdrop-blur-2xl shadow-2xl">
          {['networks', 'duplicates', 'multibooth'].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all italic ${activeTab === tab ? 'bg-royal-600 text-white shadow-2xl shadow-royal-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-8">
        {[
          { label: 'Fraud Networks', val: summary.total || 0, icon: <Layers size={20} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Voters Affected', val: summary.affected?.toLocaleString() || 0, icon: <Users size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Regions Linked', val: summary.involved || 0, icon: <MapPin size={20} />, color: 'text-royal-400', bg: 'bg-royal-500/10' },
          { label: 'Global Threat Index', val: summary.risk || 'N/A', icon: <ShieldAlert size={20} />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Spectral Core', val: 'Louvain + Parallel', icon: <Cpu size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((k, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="p-10 rounded-[3.5rem] glass-panel bg-white/[0.01] border border-white/5 flex flex-col group hover:bg-white/[0.04] transition-all shadow-2xl relative overflow-hidden h-full"
          >
            <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
            <div className={`p-4 rounded-2.5xl w-fit mb-8 transition-all group-hover:scale-110 group-hover:rotate-6 ${k.bg} ${k.color} border border-white/5 shadow-2xl`}>{k.icon}</div>
            <div className={`text-4xl font-black tabular-nums transition-all tracking-tighter italic mb-3 leading-none ${k.color}`}>{k.val}</div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Intel Flow ── */}
      <AnimatePresence mode="wait">
        {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-48">
                <div className="p-10 rounded-[4rem] bg-royal-500/10 border border-royal-500/20 relative shadow-3xl">
                    <Loader size={48} className="text-royal-400 animate-spin" />
                    <motion.div animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.4, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 border-2 border-royal-400/30 rounded-[4rem]" />
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.8em] mt-12 animate-pulse italic">Reconstructing_Global_Correlation_Topology...</span>
            </motion.div>
        ) : (
            <motion.div 
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-10"
            >
                {activeTab === 'networks' && (
                    <div className="space-y-10">
                        <NetworkTopology networks={data?.networks || []} />
                        
                        <div className="flex items-center gap-5 mt-14 mb-8">
                            <div className="p-3 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
                                <Database size={20} className="text-royal-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight italic">Forensic Diagnostic Snapshots</h3>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5 ">High-fidelity evidentiary visual data</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ForensicAsset 
                                title="EPIC Density Heatmap" 
                                path="/assets/threat_network.png"
                                desc="Spatial analysis of duplicate EPIC registrations identifying high-risk geographic clusters in the northern sector."
                            />
                            <ForensicAsset 
                                title="Community Link Topology" 
                                path="/assets/forensic_node_2.png"
                                desc="Graph-based visualization of Louvain community detected clusters sharing impossible demographic vectors."
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 pt-10">
                    {data?.networks?.map((net, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        whileHover={{ y: -15 }}
                        className="p-12 rounded-[4rem] glass-panel bg-white/[0.01] border border-white/5 group hover:bg-white/[0.04] transition-all relative overflow-hidden shadow-3xl h-full flex flex-col"
                    >
                        <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none group-hover:scale-110 duration-1000">
                            <Target size={140} className="text-royal-400" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div className="p-5 rounded-3xl bg-royal-500/10 border border-royal-500/20 text-royal-400 shadow-2xl group-hover:rotate-12 transition-transform">
                                <Link2 size={28} />
                            </div>
                            <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] italic border shadow-2xl group-hover:scale-105 transition-all ${RISK_CONFIG[net.risk]?.bg} ${RISK_CONFIG[net.risk]?.border} ${RISK_CONFIG[net.risk]?.color}`}>
                                {net.risk} THREAT LEVEL
                            </div>
                        </div>

                        <div className="space-y-8 mb-12 relative z-10">
                            <div>
                                <div className="text-[11px] font-black text-royal-500 uppercase tracking-[0.4em] mb-3 group-hover:translate-x-2 transition-transform italic">Network_Identifier</div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none italic">{net.id} MATRIX</h3>
                            </div>
                            <div className="flex items-center gap-5 p-5 rounded-2.5xl bg-white/[0.03] border border-white/5 group-hover:border-royal-500/20 transition-all shadow-inner">
                                <div className="p-2 rounded-xl bg-royal-500/10">
                                    <MapPin size={22} className="text-royal-400" />
                                </div>
                                <span className="text-[13px] font-black text-slate-400 tracking-tight uppercase italic">{net.consts?.join(' ↔ ') || 'NO_LINK'}</span>
                            </div>
                            <p className="text-[14px] font-black text-slate-500 leading-relaxed border-l-4 border-royal-500/20 pl-8 uppercase italic transition-all group-hover:border-royal-500/50">"{net.details}"</p>
                        </div>

                        <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 shadow-sm italic">Impact Weight</div>
                                    <div className="text-2xl font-black text-white tabular-nums italic tracking-tighter">{net.voters} NODES</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 shadow-sm italic">Centrality Sig</div>
                                    <div className="text-2xl font-black text-royal-400 tabular-nums italic tracking-tighter">{(net.centrality * 100).toFixed(0)}%</div>
                                </div>
                            </div>
                            <button className="p-6 rounded-[2.5rem] bg-white/[0.03] text-white hover:bg-royal-600 transition-all shadow-2xl group/btn active:scale-90 border border-white/5">
                                <ExternalLink size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                    ))}

                    {(!data?.networks || data.networks.length === 0) && (
                        <div className="col-span-full py-56 flex flex-col items-center justify-center opacity-30 bg-white/[0.01] rounded-[4rem] border border-dashed border-white/10">
                            <Settings size={80} className="text-slate-800 animate-spin-slow mb-12" />
                            <span className="text-sm font-black uppercase tracking-[0.8em] text-slate-600 italic">No Persistent Cross-Boundary Fractals Detected</span>
                        </div>
                    )}
                </div>
                
                {/* ── Status Bar ── */}
                <div className="p-8 rounded-[3rem] glass-panel bg-amber-500/5 border border-amber-500/10 flex items-center gap-6 shadow-2xl">
                    <div className="p-3 bg-amber-500/20 rounded-2xl">
                        <Info size={24} className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black text-amber-500 uppercase tracking-widest leading-loose italic">Strategic Advisory: Coordinated multi-region registrations detected in these networks often correlate with synthetic identity farming. Physical roll audits at the shared location hubs are highly recommended prior to the next legislative epoch.</p>
                    </div>
                    <button className="px-8 py-3 rounded-2xl bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-widest italic hover:bg-amber-400 transition-colors shadow-xl active:scale-95">
                        Initiate Protocol
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
