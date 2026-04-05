import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, AlertTriangle, Users, Shield, Layers, 
  Crosshair, Activity, Globe, Zap, Search, 
  Target, Info, ChevronRight, ShieldAlert, Navigation,
  X, Cpu, Radar, MousePointer2, Maximize2
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
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-8 pb-10">
      
      {/* ── Top Level Context ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex items-center justify-between">
        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40 relative">
            <Globe size={32} className="text-royal-400" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-royal-400/30 rounded-full scale-150 border-dashed"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic leading-none">Geo-Spatial Intelligence</h1>
            <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Satellite Feed Active</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">National Topography Mesh v5.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 p-2 rounded-2.5xl bg-white/[0.03] border border-white/5">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(level => (
            <button
              key={level} onClick={() => setFilterLevel(level)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all relative overflow-hidden group ${filterLevel === level ? 'bg-royal-500 text-white shadow-xl shadow-royal-900/40 translate-y-[-2px]' : 'text-slate-500 hover:text-white'}`}
            >
              <span className="relative z-10">{level}</span>
              {filterLevel === level && (
                <motion.div layoutId="level-bg" className="absolute inset-0 bg-white/10 shimmer" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vital Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Clusters', val: filtered.length, icon: <MapPin size={18} />, color: 'text-royal-400', bg: 'bg-royal-500/10' },
          { label: 'Network Anomalies', val: filtered.reduce((s,h)=>s+h.ghostCount,0), icon: <Users size={18} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'System Alert Posture', val: criticalCount > 1 ? 'SEVERE_V1' : 'MODERATE', icon: <ShieldAlert size={18} />, color: criticalCount > 1 ? 'text-rose-500' : 'text-amber-400', bg: criticalCount > 1 ? 'bg-rose-500/10' : 'bg-amber-500/10' },
          { label: 'Datalink Bandwidth', val: '98.2 Gbps', icon: <Activity size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((k, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2.5rem] glass-panel flex flex-col group hover:bg-white/[0.04] transition-all hover:-translate-y-1 shadow-inner relative overflow-hidden"
          >
            <div className="absolute inset-0 quantum-grid opacity-[0.02] group-hover:opacity-[0.05]" />
            <div className="flex items-center justify-between mb-6 relative">
                <div className={`p-4 rounded-2.5xl transition-all shadow-inner ${k.bg} ${k.color}`}>{k.icon}</div>
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center opacity-40">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                </div>
            </div>
            <div className={`text-3xl font-black tabular-nums tracking-tighter italic mb-2 relative ${k.color}`}>{k.val}</div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-tight relative">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
        
        {/* ── Projection Engine ── */}
        <div className="xl:col-span-2 p-10 rounded-[4rem] glass-panel relative overflow-hidden bg-white/[0.01] border-white/10 group shadow-2xl">
            <div className="absolute inset-0 quantum-grid opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none self-start">
                <Radar size={300} className="text-royal-400" />
            </div>
            
            <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic mb-2">Theater_Scan_Zone</span>
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">National Grid Projection</h3>
                            <div className="px-3 py-1 rounded-full bg-royal-400/10 border border-royal-400/20">
                                <span className="text-[9px] font-black text-royal-400 uppercase tracking-widest">v5.2.0</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.02] border border-white/5">
                        <button className="p-3 rounded-xl bg-white/10 text-white"><Maximize2 size={16} /></button>
                        <button className="p-3 rounded-xl text-slate-500 hover:text-white"><Navigation size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="relative h-[600px] flex items-center justify-center">
                <AnimatePresence>
                    {isScanning && (
                        <motion.div 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-xl rounded-[3rem]"
                        >
                            <div className="flex flex-col items-center">
                                <div className="relative mb-10 w-24 h-24">
                                    <div className="absolute inset--8 bg-royal-500/20 blur-[40px] rounded-full" />
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-full h-full border-4 border-royal-500/20 border-t-royal-500 rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu size={28} className="text-royal-400" />
                                    </div>
                                </div>
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[1em] italic animate-pulse">Initializing_Spatial_Arrays</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg viewBox="150 150 450 400" className="w-full h-full overflow-visible drop-shadow-[0_0_50px_rgba(59,130,246,0.1)] relative z-10 transition-all duration-700">
                    <defs>
                        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(59,130,246,0.1)" />
                            <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
                        </linearGradient>
                    </defs>

                    {/* Enhanced India Path */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d="M330,160 Q350,155 370,160 L380,175 Q400,180 410,195 L420,210 Q440,220 455,240 L470,260 Q480,275 475,290 L470,310 Q475,330 470,350 L460,370 Q450,385 440,400 L420,420 Q405,440 390,450 L370,470 Q355,490 340,505 L330,510 Q320,510 310,505 L295,490 Q285,470 275,450 L265,430 Q255,410 260,395 L270,380 Q265,360 255,340 L245,315 Q235,295 240,275 L250,260 Q255,245 265,230 L280,215 Q295,200 305,185 L315,170 Z"
                        fill="url(#mapGradient)"
                        stroke="rgba(59,130,246,0.2)"
                        strokeWidth="2"
                    />

                    {/* State Nodes */}
                    {INDIA_STATES.map((state, i) => (
                        <motion.g 
                            key={state.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.05), type: "spring" }}
                            onMouseEnter={() => setHoveredState(state.id)} 
                            onMouseLeave={() => setHoveredState(null)}
                            className="cursor-crosshair"
                        >
                            <circle 
                                cx={state.cx} cy={state.cy} r={state.r} 
                                fill={hoveredState === state.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.02)'} 
                                stroke={hoveredState === state.id ? 'var(--royal-400)' : 'rgba(255,255,255,0.05)'} 
                                strokeWidth={1} 
                                className="transition-all duration-500"
                            />
                            <text 
                                x={state.cx} y={state.cy + 3} textAnchor="middle" 
                                className={`text-[9px] font-black tracking-tighter pointer-events-none transition-all duration-500 uppercase italic ${hoveredState === state.id ? 'fill-white text-[12px]' : 'fill-slate-700'}`}
                            >
                                {state.id}
                            </text>
                            {/* Scanning Pulse on state node */}
                            {hoveredState === state.id && (
                                <motion.circle 
                                    initial={{ r: state.r, opacity: 0.5 }}
                                    animate={{ r: state.r + 15, opacity: 0 }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    cx={state.cx} cy={state.cy} fill="none" stroke="var(--royal-500)" strokeWidth="1"
                                />
                            )}
                        </motion.g>
                    ))}

                    {/* Active Hotspot Pulses */}
                    {filtered.map((h, i) => {
                        const state = INDIA_STATES.find(s => s.id === h.stateId);
                        if(!state) return null;
                        const x = state.cx + (i % 2 === 0 ? 8 : -8);
                        const y = state.cy + (i % 2 === 0 ? 8 : -8);
                        const config = RISK_CONFIG[h.riskLevel];

                        return (
                            <g key={h.id} onClick={() => setSelectedHotspot(h)} className="cursor-pointer group/hotspot">
                                <motion.circle 
                                    initial={{ r: 0 }}
                                    animate={{ r: [8, 18, 8] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    cx={x} cy={y} fill={config.color} opacity={0.15}
                                />
                                <circle cx={x} cy={y} r={5} fill={config.color} className={`${config.glow} transition-transform group-hover/hotspot:scale-125`} />
                                <circle cx={x} cy={y} r={2} fill="#fff" />
                            </g>
                        );
                    })}
                </svg>

                {/* ── Overlay Indicators ── */}
                <div className="absolute bottom-10 inset-x-10 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Alert_Vector_Detected</span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <MousePointer2 size={12} className="text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Interactive Point Mesh Enabled</span>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-2.5xl bg-black/40 border border-white/10 backdrop-blur-2xl flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">LATITUDE</span>
                            <span className="text-[11px] font-black text-white tabular-nums italic">28.6139° N</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">LONGITUDE</span>
                            <span className="text-[11px] font-black text-white tabular-nums italic">77.2090° E</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ── Intelligence Deck ── */}
        <div className="flex flex-col gap-8">
            
            {/* Registry Hub */}
            <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden bg-white/[0.01]">
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
                            <Radar size={20} className="text-royal-400" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Threat Registry</h3>
                    </div>
                    <span className="text-[11px] font-black text-slate-700 italic tabular-nums">SCANNING...</span>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
                    {filtered.map((h, i) => (
                        <motion.div 
                            key={h.id} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedHotspot(h)}
                            className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden ${selectedHotspot?.id === h.id ? 'bg-royal-500/15 border-royal-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}
                        >
                            <div className="absolute inset-0 quantum-grid opacity-[0.02] group-hover:opacity-[0.05]" />
                            <div className="flex items-center justify-between mb-4 relative">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic transition-colors group-hover:text-royal-500">{h.id}</span>
                                <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest italic border backdrop-blur-md ${RISK_CONFIG[h.riskLevel].bg} ${RISK_CONFIG[h.riskLevel].border} ${h.riskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                                    {h.riskLevel}
                                </div>
                            </div>
                            <div className="text-[15px] font-black text-white mb-6 group-hover:text-royal-400 transition-colors uppercase tracking-tight italic leading-none">{h.constituency}</div>
                            <div className="flex items-center justify-between pt-5 border-t border-white/5 relative z-10">
                                <span className={`text-[11px] font-black tabular-nums transition-colors ${h.riskLevel === 'CRITICAL' ? 'text-rose-500' : 'text-slate-400'}`}>{h.ghostCount} Nodes Found</span>
                                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-royal-500/20 transition-all">
                                    <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-transform group-hover:translate-x-1" />
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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 1.05, y: 20 }}
                        className="p-10 rounded-[4rem] glass-panel relative overflow-hidden shadow-2xl border-white/20 bg-royal-400/[0.02]"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none self-start">
                            <ShieldAlert size={140} className="text-royal-400" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-royal-500 uppercase tracking-[0.5em] italic mb-2">Tactical_Briefing</span>
                                <h3 className="text-xl font-black text-white uppercase italic leading-none">{selectedHotspot.constituency}</h3>
                            </div>
                            <button onClick={() => setSelectedHotspot(null)} className="p-4 rounded-2xl bg-white/5 text-slate-500 hover:text-rose-500 transition-colors pointer-events-auto">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 italic">Threat Magnitude</div>
                                    <div className="text-4xl font-black text-rose-500 tabular-nums italic">{(selectedHotspot.threatScore * 100).toFixed(0)}%</div>
                                </div>
                                <div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 italic">Address Hubs</div>
                                    <div className="text-4xl font-black text-royal-400 tabular-nums italic">{selectedHotspot.addresses}</div>
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-inner">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 block italic">Raw Telemetry Data</span>
                                <p className="text-[13px] font-bold text-white leading-relaxed italic opacity-80 uppercase tracking-tight">
                                    "{selectedHotspot.description}"
                                </p>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-6 rounded-[2.5rem] bg-royal-600 text-[11px] font-black text-white uppercase tracking-[0.3em] italic shadow-2xl shadow-royal-900/40 flex items-center justify-center gap-4 transition-all"
                            >
                                <Target size={18} />
                                <span>Initialize Forensic Penetration Scan</span>
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="p-16 text-center rounded-[4rem] bg-white/[0.01] border border-white/5 border-dashed flex flex-col items-center justify-center group"
                    >
                        <div className="p-6 rounded-full bg-slate-900/50 border border-white/10 mb-8 relative">
                            <Search size={40} className="text-slate-800" />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 border border-white/5 rounded-full"
                            />
                        </div>
                        <h4 className="text-xl font-black text-slate-700 uppercase tracking-tight mb-4 italic">Zone Investigation Idle</h4>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed mx-auto">
                            Interact with map nodes to populate active intelligence feeds
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
