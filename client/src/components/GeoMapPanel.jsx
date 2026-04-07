import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, AlertTriangle, Users, Shield, Layers, 
  Crosshair, Activity, Globe, Zap, Search, 
  Target, Info, ChevronRight, ShieldAlert, Navigation,
  X, Cpu, Radar, MousePointer2, Maximize2, Camera,
  Fingerprint, Scan, Eye, LayoutGrid
} from 'lucide-react';

const INDIA_STATES = [
  { id: 'DL', name: 'Delhi',        cx: 370, cy: 230, r: 10 },
  { id: 'MH', name: 'Maharashtra',  cx: 310, cy: 370, r: 16 },
  { id: 'TN', name: 'Tamil Nadu',   cx: 350, cy: 490, r: 14 },
  { id: 'WB', name: 'West Bengal',  cx: 470, cy: 310, r: 13 },
  { id: 'KA', name: 'Karnataka',    cx: 310, cy: 430, r: 15 },
  { id: 'UP', name: 'Uttar Pradesh',cx: 390, cy: 250, r: 18 },
  { id: 'RJ', name: 'Rajasthan',    cx: 290, cy: 230, r: 17 },
  { id: 'GJ', name: 'Gujarat',      cx: 240, cy: 300, r: 15 },
  { id: 'MP', name: 'Madhya Pradesh',cx: 340, cy: 300, r: 17 },
  { id: 'AP', name: 'Andhra Pradesh',cx: 370, cy: 420, r: 15 },
  { id: 'KL', name: 'Kerala',       cx: 310, cy: 500, r: 10 },
];

const RISK_CONFIG = {
  CRITICAL: { color: '#f43f5e', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]' },
  HIGH:     { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
  MEDIUM:   { color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  LOW:      { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
};

const ReconAsset = ({ title, path, desc, type }) => (
    <div className="flex flex-col gap-6 p-8 rounded-[3rem] glass-panel bg-white/[0.01] border border-white/5 group hover:bg-white/[0.04] transition-all relative overflow-hidden group">
        <div className="absolute top-4 right-4 z-20">
            <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-royal-400 animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{type}</span>
            </div>
        </div>
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl relative">
            <img src={path} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-royal-500/20 backdrop-blur-md border border-royal-500/30">
                    <Camera size={14} className="text-royal-400" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">SENSOR_ARRAY_B_04</span>
            </div>
        </div>
        <div className="space-y-3">
            <h4 className="text-lg font-black text-white uppercase italic tracking-tight leading-none">{title}</h4>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed border-l-2 border-royal-500/20 pl-6 italic">{desc}</p>
        </div>
    </div>
);

function generateHotspots() {
  return [
    { id: 'HS-001', lat: 28.63, lng: 77.22, constituency: 'New Delhi', state: 'Delhi', stateId: 'DL', ghostCount: 88, riskLevel: 'CRITICAL', threatScore: 0.98, addresses: 12, description: 'High-density address duplication detected in central civic zones' },
    { id: 'HS-002', lat: 28.55, lng: 77.25, constituency: 'South Delhi', state: 'Delhi', stateId: 'DL', ghostCount: 42, riskLevel: 'HIGH', threatScore: 0.85, addresses: 8, description: 'Satellite registration clusters using proxy server signatures' },
    { id: 'HS-004', lat: 19.07, lng: 72.87, constituency: 'Mumbai North', state: 'Maharashtra', stateId: 'MH', ghostCount: 156, riskLevel: 'CRITICAL', threatScore: 0.94, addresses: 24, description: 'Inter-state node coordination matching historical fraud patterns' },
    { id: 'HS-007', lat: 12.97, lng: 77.59, constituency: 'Bengaluru Central', state: 'Karnataka', stateId: 'KA', ghostCount: 64, riskLevel: 'HIGH', threatScore: 0.79, addresses: 15, description: 'Coordinated move-in behavior spanning multi-district boundaries' },
  ];
}

export default function GeoMapPanel({ constituency }) {
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [hoveredState, setHoveredState] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const hotspots = useMemo(() => generateHotspots(), []);
  const filtered = filterLevel === 'ALL' ? hotspots : hotspots.filter(h => h.riskLevel === filterLevel);
  const criticalCount = hotspots.filter(h => h.riskLevel === 'CRITICAL').length;

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-8 pb-16 px-2">
      
      {/* ── Top Level Context ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-3xl border border-white/5">
        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-6 rounded-[2.5rem] bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40 relative">
            <Globe size={36} className="text-royal-400" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-royal-400/20 rounded-full scale-[1.8] border-dashed"
            />
             <motion.div 
              animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.4, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-royal-400/20 blur-2xl rounded-full"
            />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight italic leading-none">Geo-Spatial Intelligence Grid</h1>
            <div className="flex items-center gap-5 mt-5">
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none italic">Satellite_Active</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">National Topography Mesh v5.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 p-2.5 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-2xl shadow-2xl">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(level => (
            <button
              key={level} onClick={() => setFilterLevel(level)}
              className={`px-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] italic transition-all relative overflow-hidden group ${filterLevel === level ? 'bg-royal-600 text-white shadow-2xl shadow-royal-500/30' : 'text-slate-500 hover:text-white'}`}
            >
              <span className="relative z-10">{level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Vital Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Active Clusters', val: filtered.length, icon: <MapPin size={22} />, color: 'text-royal-400', bg: 'bg-royal-500/10' },
          { label: 'Network Anomalies', val: filtered.reduce((s,h)=>s+h.ghostCount,0), icon: <Users size={22} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Security Posture', val: criticalCount > 1 ? 'SEVERE_V1' : 'MODERATE', icon: <ShieldAlert size={22} />, color: criticalCount > 1 ? 'text-rose-500' : 'text-amber-400', bg: criticalCount > 1 ? 'bg-rose-500/10' : 'bg-amber-500/10' },
          { label: 'Scan Bandwidth', val: '98.2 Gbps', icon: <Activity size={22} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((k, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="p-10 rounded-[3.5rem] glass-panel bg-white/[0.01] border border-white/5 flex flex-col group hover:bg-white/[0.04] transition-all shadow-2xl relative overflow-hidden h-full"
          >
            <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
            <div className={`p-5 rounded-2.5xl w-fit mb-8 transition-all group-hover:scale-110 group-hover:rotate-6 ${k.bg} ${k.color} border border-white/5 shadow-2xl shadow-black/40`}>{k.icon}</div>
            <div className={`text-4xl font-black tabular-nums tracking-tighter italic mb-3 leading-none transition-all ${k.color}`}>{k.val}</div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* ── Projection Engine ── */}
        <div className="xl:col-span-2 p-12 rounded-[4rem] glass-panel relative overflow-hidden bg-white/[0.01] border-white/10 group shadow-3xl">
            <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none self-start scale-125">
                <Radar size={300} className="text-royal-400" />
            </div>
            
            <div className="flex items-center justify-between mb-14 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] italic mb-3">Theater_Scan_Zone</span>
                        <div className="flex items-center gap-5">
                            <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight uppercase leading-none">Spatial Neural Projection</h3>
                            <div className="px-4 py-1.5 rounded-full bg-royal-500/10 border border-royal-500/20 shadow-xl">
                                <span className="text-[10px] font-black text-royal-400 uppercase tracking-widest italic">Engine_v5.2.0</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 p-2 rounded-2.5xl bg-white/[0.02] border border-white/5 shadow-inner">
                        <button className="p-4 rounded-xl bg-royal-600 text-white shadow-2xl"><Maximize2 size={18} /></button>
                        <button className="p-4 rounded-xl text-slate-500 hover:text-white transition-colors"><Navigation size={18} /></button>
                    </div>
                </div>
            </div>

            <div className="relative h-[650px] flex items-center justify-center">
                <AnimatePresence>
                    {isScanning && (
                        <motion.div 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-obsidian-950/90 backdrop-blur-3xl rounded-[4rem]"
                        >
                            <div className="relative mb-14 w-32 h-32">
                                <div className="absolute inset--12 bg-royal-500/20 blur-[60px] rounded-full animate-pulse" />
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-full h-full border-4 border-royal-500/10 border-t-royal-500 rounded-full shadow-3xl shadow-royal-500/20"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu size={40} className="text-royal-400 " />
                                </div>
                            </div>
                            <span className="text-[12px] font-black text-slate-500 uppercase tracking-[1em] italic animate-pulse">Initializing_Spatial_Arrays</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg viewBox="150 150 450 400" className="w-full h-full overflow-visible transition-all duration-1000 filter drop-shadow-[0_0_60px_rgba(59,130,246,0.15)] relative z-10">
                    <defs>
                        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(59,130,246,0.15)" />
                            <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Enhanced India Path */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        d="M330,160 Q350,155 370,160 L380,175 Q400,180 410,195 L420,210 Q440,220 455,240 L470,260 Q480,275 475,290 L470,310 Q475,330 470,350 L460,370 Q450,385 440,400 L420,420 Q405,440 390,450 L370,470 Q355,490 340,505 L330,510 Q320,510 310,505 L295,490 Q285,470 275,450 L265,430 Q255,410 260,395 L270,380 Q265,360 255,340 L245,315 Q235,295 240,275 L250,260 Q255,245 265,230 L280,215 Q295,200 305,185 L315,170 Z"
                        fill="url(#mapGradient)"
                        stroke="rgba(59,130,246,0.3)"
                        strokeWidth="1.5"
                    />

                    {/* State Nodes */}
                    {INDIA_STATES.map((state, i) => (
                        <motion.g 
                            key={state.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + (i * 0.05), type: "spring", stiffness: 150 }}
                            onMouseEnter={() => setHoveredState(state.id)} 
                            onMouseLeave={() => setHoveredState(null)}
                            className="cursor-crosshair"
                        >
                            <circle 
                                cx={state.cx} cy={state.cy} r={state.r} 
                                fill={hoveredState === state.id ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.01)'} 
                                stroke={hoveredState === state.id ? '#3B82F6' : 'rgba(255,255,255,0.05)'} 
                                strokeWidth={1} 
                                className="transition-all duration-500"
                            />
                            <text 
                                x={state.cx} y={state.cy + 3} textAnchor="middle" 
                                className={`text-[9px] font-black tracking-tighter pointer-events-none transition-all duration-500 uppercase italic leading-none ${hoveredState === state.id ? 'fill-white text-[12px]' : 'fill-slate-700'}`}
                            >
                                {state.id}
                            </text>
                            {hoveredState === state.id && (
                                <motion.circle 
                                    initial={{ r: state.r, opacity: 0.6 }}
                                    animate={{ r: state.r + 20, opacity: 0 }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    cx={state.cx} cy={state.cy} fill="none" stroke="#3b82f6" strokeWidth="1"
                                />
                            )}
                        </motion.g>
                    ))}

                    {/* Active Hotspot Pulses */}
                    {filtered.map((h, i) => {
                        const state = INDIA_STATES.find(s => s.id === h.stateId);
                        if(!state) return null;
                        const x = state.cx + (i % 2 === 0 ? 10 : -10);
                        const y = state.cy + (i % 2 === 0 ? 10 : -10);
                        const config = RISK_CONFIG[h.riskLevel];

                        return (
                            <g key={h.id} onClick={() => setSelectedHotspot(h)} className="cursor-pointer group/hotspot">
                                <motion.circle 
                                    initial={{ r: 0 }}
                                    animate={{ r: [10, 24, 10], opacity: [0.3, 0.1, 0.3] }}
                                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                                    cx={x} cy={y} fill={config.color}
                                />
                                <circle cx={x} cy={y} r={6} fill={config.color} className="transition-all group-hover/hotspot:scale-150 shadow-3xl" filter="url(#glow)" />
                                <circle cx={x} cy={y} r={2} fill="#fff" />
                            </g>
                        );
                    })}
                </svg>

                {/* ── Overlay Indicators ── */}
                <div className="absolute bottom-12 inset-x-12 flex items-center justify-between pointer-events-none z-20">
                    <div className="flex items-center gap-8 px-8 py-5 rounded-[2.5rem] bg-black/60 border border-white/10 backdrop-blur-3xl shadow-3xl">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic leading-none">Global_Alert_Vector</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <MousePointer2 size={14} className="text-royal-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none italic">Interactive_Node_Mesh: Active</span>
                        </div>
                    </div>
                    
                    <div className="px-8 py-5 rounded-[2.5rem] bg-black/60 border border-white/10 backdrop-blur-3xl shadow-3xl flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 shadow-sm">LATITUDE</span>
                            <span className="text-[12px] font-black text-white tabular-nums italic tracking-tight">28.6139° N</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 shadow-sm">LONGITUDE</span>
                            <span className="text-[12px] font-black text-white tabular-nums italic tracking-tight">77.2090° E</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* ── Recon Assets Sub-Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-14">
                <ReconAsset 
                    type="SPATIAL_SCAN"
                    title="Neural Surface Survey" 
                    path="/assets/booth_scan.webp"
                    desc="High-resolution LiDAR analysis of voter registration clusters relative to physical housing capacity in central zones."
                />
                <ReconAsset 
                    type="GRAPH_TOPOLOGY"
                    title="Community Cluster Mesh" 
                    path="/assets/cluster_diagnostic.png"
                    desc="Multi-layer adjacency matrix showing the flow of synthetic identities across inter-state boundaries."
                />
            </div>
        </div>

        {/* ── Intelligence Deck ── */}
        <div className="flex flex-col gap-10">
            
            {/* Registry Hub */}
            <div className="p-12 rounded-[4rem] glass-panel relative overflow-hidden bg-white/[0.01] shadow-3xl border-white/5 h-fit">
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2.5xl bg-royal-500/10 border border-royal-500/20 shadow-2xl relative">
                            <Radar size={22} className="text-royal-400" />
                            <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-x-0 top-0 h-px bg-royal-400 shadow-[0_0_10px_#3B82F6]" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic leading-none">Threat Registry</h3>
                    </div>
                    <span className="text-[11px] font-black text-slate-700 italic tracking-[0.2em] animate-pulse">LIVE_SYNC...</span>
                </div>

                <div className="space-y-5 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                    {filtered.map((h, i) => (
                        <motion.div 
                            key={h.id} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedHotspot(h)}
                            whileHover={{ scale: 1.02 }}
                            className={`p-8 rounded-[3rem] border transition-all cursor-pointer group relative overflow-hidden shadow-2xl ${selectedHotspot?.id === h.id ? 'bg-royal-600/20 border-royal-400/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}
                        >
                            <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                            <div className="flex items-center justify-between mb-5 relative">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic group-hover:text-royal-400 transition-colors">{h.id}</span>
                                <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic border shadow-inner ${RISK_CONFIG[h.riskLevel].bg} ${RISK_CONFIG[h.riskLevel].border} ${h.riskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                                    {h.riskLevel}
                                </div>
                            </div>
                            <div className="text-lg font-black text-white mb-6 group-hover:text-royal-400 transition-colors uppercase tracking-tight italic leading-none">{h.constituency}</div>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                    <span className={`text-[11px] font-black tabular-nums italic ${h.riskLevel === 'CRITICAL' ? 'text-rose-500' : 'text-slate-500'}`}>{h.ghostCount} NODES</span>
                                </div>
                                <div className="p-2.5 rounded-2xl bg-white/5 group-hover:bg-royal-500/20 transition-all shadow-inner">
                                    <ChevronRight size={16} className="text-slate-700 group-hover:text-white transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tactical Briefing Overlay */}
            <AnimatePresence mode="wait">
                {selectedHotspot ? (
                    <motion.div 
                        key="briefing"
                        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 1.1, y: 40 }}
                        className="p-12 rounded-[4.5rem] glass-panel relative overflow-hidden shadow-3xl border-royal-500/30 bg-royal-500/[0.03]"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none scale-150">
                            <ShieldAlert size={140} className="text-royal-400" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-royal-500 uppercase tracking-[0.6em] italic mb-3">Tactical_Intelligence</span>
                                <h3 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">{selectedHotspot.constituency} SECTOR</h3>
                            </div>
                            <button onClick={() => setSelectedHotspot(null)} className="p-5 rounded-[2.5rem] bg-white/5 text-slate-500 hover:text-rose-500 transition-all active:scale-90 border border-white/10">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 rounded-[3.5rem] bg-white/[0.03] border border-white/5 shadow-2xl">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 italic">Threat Density</div>
                                    <div className="text-5xl font-black text-rose-500 tabular-nums italic tracking-tighter">{(selectedHotspot.threatScore * 100).toFixed(0)}%</div>
                                </div>
                                <div className="p-8 rounded-[3.5rem] bg-white/[0.03] border border-white/5 shadow-2xl">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 italic">Epicenter Hubs</div>
                                    <div className="text-5xl font-black text-royal-400 tabular-nums italic tracking-tighter">{selectedHotspot.addresses}</div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-inner">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-1 px-3 rounded-lg bg-royal-500/10 border border-royal-500/20">
                                        <span className="text-[9px] font-black text-royal-400 uppercase tracking-widest">LOG_V84</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Telemetry Summary</span>
                                </div>
                                <p className="text-[15px] font-bold text-slate-300 leading-relaxed italic uppercase tracking-tight transition-all">
                                    "{selectedHotspot.description}"
                                </p>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02, backgroundColor: '#3B82F6' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-8 rounded-[3rem] bg-royal-600 text-[12px] font-black text-white uppercase tracking-[0.4em] italic shadow-2xl shadow-royal-900/60 flex items-center justify-center gap-5 transition-all border border-royal-400/30 group"
                            >
                                <Target size={22} className="group-hover:rotate-45 transition-transform" />
                                <span>Initiate Neural Extraction Scan</span>
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="p-16 text-center rounded-[4.5rem] bg-white/[0.01] border border-white/5 border-dashed flex flex-col items-center justify-center group shadow-2xl"
                    >
                        <div className="p-8 rounded-[2.5rem] bg-slate-950/80 border border-white/5 mb-10 relative shadow-3xl">
                            <Search size={48} className="text-slate-800" />
                            <motion.div 
                                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 border-2 border-white/10 rounded-[2.5rem]"
                            />
                        </div>
                        <h4 className="text-2xl font-black text-slate-700 uppercase tracking-tight mb-5 italic">Sector Analysis Idle</h4>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] max-w-[240px] leading-loose mx-auto italic">
                            Select a high-risk zone from the spatial grid or registry to initialize deep telemetry.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
