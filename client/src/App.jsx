import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LayoutDashboard, Database, AlertCircle, RefreshCw,
  Layers, Cpu, Radio, Target, Wifi, WifiOff, ChevronDown,
  Clock, Globe, ShieldAlert, MapPin, FileText, Upload, Activity,
  Settings, 
  Search, 
  Bell, 
  ExternalLink,
  Menu,
  X,
  Terminal, Share2, Scan, Fingerprint, Lock
} from 'lucide-react';

import NetworkGraph from './components/NetworkGraph';
import AnalyticsPanel from './components/AnalyticsPanel';
import ForensicsPanel from './components/ForensicsPanel';
import TimelinePanel from './components/TimelinePanel';
import CrossConstituencyPanel from './components/CrossConstituencyPanel';
import WhistleblowerPanel from './components/WhistleblowerPanel';
import GeoMapPanel from './components/GeoMapPanel';
import AuditTrailPanel from './components/AuditTrailPanel';
import BatchUploadPanel from './components/BatchUploadPanel';
import GlobalSidebar from './components/GlobalSidebar';
import Sidebar from './components/Sidebar';
import './index.css';

const API_BASE = 'http://localhost:8000';

// ─── Backend Connectivity Protocol ──────────────────────────────────────────

const DataStream = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * 100 + '%' }}
                animate={{ y: '100vh' }}
                transition={{ 
                    duration: 10 + Math.random() * 20, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: Math.random() * 20
                }}
                className="absolute w-px h-20 bg-gradient-to-b from-transparent via-royal-400 to-transparent"
            />
        ))}
    </div>
  );
};

const DemoTour = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { 
            title: 'Election Integrity', 
            detail: 'Welcome to GhostWatch. We help identify recording errors and voter duplication using graph intelligence.', 
            icon: <Shield size={20} />,
            image: '/assets/threat_network.png'
        },
        { 
            title: 'Detection Engine', 
            detail: 'Our system scans thousands of records to find clusters of suspicious registrations at single addresses.', 
            icon: <Cpu size={20} />,
            image: '/assets/cluster_diagnostic.png'
        },
        { 
            title: 'Official Reports', 
            detail: 'Generate evidence reports with a single click to assist in official verification.', 
            icon: <FileText size={20} />,
            image: '/assets/verification_report.png'
        },
        { 
            title: 'Ready to Begin', 
            detail: 'Navigate through the maps or check active alerts to start your review.', 
            icon: <Target size={20} />,
            image: '/assets/booth_scan.webp'
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
            <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
                className="w-full max-w-2xl glass-panel p-8 rounded-[2.5rem] border border-coral-500/20 text-center relative shadow-2xl overflow-hidden flex flex-col md:flex-row gap-8 items-center"
            >
                <div className="w-full md:w-1/2 h-48 md:h-full min-h-[200px] rounded-2xl bg-obsidian-950/50 border border-white/5 relative overflow-hidden flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={step}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            src={steps[step].image} 
                            onError={(e) => e.target.style.display='none'}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/80 to-transparent" />
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-coral-500/10 border border-coral-500/20 flex items-center justify-center mb-6">
                        <div className="text-coral-600">{steps[step].icon}</div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 text-left relative z-10 flex flex-col h-full py-2">
                    <span className="text-[9px] font-bold text-coral-500 uppercase tracking-[0.4em] mb-3 block">SYSTEM_HELP_{step + 1}</span>
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight font-display italic uppercase">{steps[step].title}</h2>
                    <p className="text-slate-400 leading-relaxed text-sm mb-8 flex-1">{steps[step].detail}</p>
                    <div className="flex items-center justify-between gap-4 mt-auto border-t border-white/5 pt-6">
                        <div className="flex gap-1.5">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-coral-500 shadow-[0_0_8px_rgba(242,108,109,0.5)]' : 'w-2 bg-slate-700'}`} />
                            ))}
                        </div>
                        <button 
                            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onComplete()}
                            className="px-6 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-royal-500/30"
                        >
                            {step < steps.length - 1 ? 'Next Phase' : 'Initialize System'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [stats, setStats] = useState({ totalVoters: 0, ghostVoters: 0, highRisk: 0, mediumRisk: 0, addresses: 0, booths: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [constituency, setConstituency] = useState('New Delhi');
  const [constituencies, setConstituencies] = useState([]);
  const [activeTab, setActiveTab] = useState('network');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedNode, setSelectedNode] = useState(null);
  const [showTour, setShowTour] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchInit = async () => {
        try {
            const res = await axios.get(`${API_BASE}/constituencies`);
            const fetched = res.data.constituencies || [];
            setConstituencies(fetched);
            if (fetched.length > 0 && !constituency) {
                setConstituency(fetched[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch constituencies", err);
            const fallback = [
                { id: 'New Delhi', name: 'New Delhi', state: 'Delhi' },
                { id: 'South Delhi', name: 'South Delhi', state: 'Delhi' },
                { id: 'East Delhi', name: 'East Delhi', state: 'Delhi' },
            ];
            setConstituencies(fallback);
            setConstituency(fallback[0].id);
        }
    };
    fetchInit();
  }, []);

  const fetchGraph = useCallback(async (c) => {
    setLoading(true);
    try {
        const res = await axios.get(`${API_BASE}/graph/network/${c}`);
        const data = res.data;
        // The backend returns 'edges', frontend NetworkGraph expects 'links'
        setGraphData({ 
            nodes: data.nodes || [], 
            links: (data.edges || data.links || []).map(e => ({
                source: e.source,
                target: e.target,
                type: e.type
            }))
        });
        setStats(data.stats);
    } catch (err) {
        console.error("Graph Sync Failed", err);
        // We could show a toast here if we had one
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGraph(constituency); }, [constituency, fetchGraph]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-obsidian-900 font-sans text-slate-200 selection:bg-coral-500/20">
      
      {/* ── Background Decorative Layer ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 quantum-grid opacity-[0.05]" />
        <DataStream />
        <div className="scanline" />
        <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-coral-500/10 blur-[80px] rounded-full" 
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-navy-600/10 blur-[80px] rounded-full" 
        />
      </div>

      {/* ── Progress Loading Stage ── */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-obsidian-950"
          >
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mb-16"
            >
              <div className="absolute inset--12 bg-royal-500/20 blur-[60px] rounded-full animate-pulse-slow" />
              <motion.div 
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="relative w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-royal-400 to-royal-600 flex items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.4)]"
              >
                <Shield size={64} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
              </motion.div>
            </motion.div>
            <div className="flex flex-col items-center gap-8">
                <span className="text-[12px] font-bold tracking-[0.6em] text-royal-400/80 uppercase">Loading_GhostWatch_Engine</span>
                <div className="w-80 h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ x: '-100%' }} animate={{ x: '100%' }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full w-2/3 bg-gradient-to-r from-transparent via-royal-400 to-transparent shadow-[0_0_25px_rgba(59,130,246,0.8)]"
                    />
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 h-full min-h-0 bg-transparent flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian-950/40 via-transparent to-royal-950/20 pointer-events-none" />
        
        {/* ── Dashboard Header ── */}
        <header className="h-[100px] border-b border-white/5 flex items-center justify-between px-6 md:px-12 relative z-50 backdrop-blur-3xl bg-obsidian-950/50">
            <div className="flex items-center gap-4 md:gap-8">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <Menu size={20} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-[10px] font-black tracking-[0.6em] text-royal-500 uppercase italic mb-1">Administrative_Control</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-white italic tracking-tighter uppercase font-display">{activeTab === 'network' ? 'Voter Mapping' : activeTab === 'analytics' ? 'Voter Insights' : activeTab === 'forensics' ? 'Fraud Alerts' : activeTab === 'timeline' ? 'Registration Trends' : activeTab === 'crossnet' ? 'Boundary Checks' : activeTab === 'geomap' ? 'Booth Map' : activeTab === 'upload' ? 'Upload Lists' : activeTab === 'audit' ? 'Audit Log' : 'Official Feedback'}</span>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">System_Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
                <div className="hidden md:flex flex-col gap-0.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-coral-500 shadow-sm" />
                      Constituency Context
                    </span>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-coral-500" />
                        <select 
                            value={constituency} onChange={e => setConstituency(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm lg:text-base font-display font-bold text-white hover:text-coral-400 transition-all cursor-pointer uppercase tracking-tight appearance-none"
                        >
                            {constituencies.map(c => <option key={c.id} value={c.id} className="bg-obsidian-900">{c.name}</option>)}
                        </select>
                        <ChevronDown size={12} className="text-slate-400 -ml-1.5" />
                    </div>
                </div>
                
                <div className="w-px h-6 bg-white/10 hidden md:block" />

                <div className="hidden md:flex flex-col gap-0.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                       Engine Status
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">System-Active</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
                <div className="hidden sm:flex flex-col items-end gap-0.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Real-time Clock</span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                        <Clock size={12} className="text-royal-400" />
                        <span className="text-[11px] font-bold text-white tabular-nums font-display">
                            {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
                        </span>
                    </div>
                </div>
                
                <button 
                  onClick={() => setShowTour(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-bold hover:bg-coral-500 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Activity size={14} className="animate-pulse" />
                  <span>System Tour</span>
                </button>
            </div>
        </header>

        {/* ── Intelligence Content Area ── */}
        <div className="flex-1 flex min-h-0 relative">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} 
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                    exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full w-full overflow-hidden"
                >
                    {activeTab === 'network' && (
                        <div className="h-full w-full relative">
                            <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex flex-col gap-4 max-w-[200px] md:max-w-none">
                                <div className="px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl bg-obsidian-950/80 border border-white/10 backdrop-blur-3xl flex items-center gap-3 md:gap-4 shadow-2xl">
                                    <div className="p-2 rounded-xl bg-royal-500/20">
                                        <Scan size={16} className="text-royal-400" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[9px] md:text-[10px] font-bold text-royal-500 uppercase tracking-[0.2em]">Map_View</span>
                                        <span className="text-[10px] md:text-[12px] font-bold text-white tracking-widest truncate">ACTIVE_SURVEY</span>
                                    </div>
                                </div>
                                <div className="px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl bg-obsidian-950/80 border border-white/10 backdrop-blur-3xl flex items-center gap-3 md:gap-4 shadow-2xl">
                                    <div className="p-2 rounded-xl bg-rose-500/20">
                                        <Fingerprint size={16} className="text-rose-400" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[9px] md:text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">Verification</span>
                                        <span className="text-[10px] md:text-[12px] font-bold text-white tracking-widest truncate">HUB_ANALYSIS</span>
                                    </div>
                                </div>
                            </div>
                            <NetworkGraph 
                                graphData={graphData} 
                                onNodeClick={setSelectedNode}
                                selectedNode={selectedNode}
                            />
                        </div>
                    )}
                    <div className="h-full w-full overflow-y-auto custom-scrollbar px-4 md:px-10 py-6 md:py-10">
                        {activeTab === 'analytics' && <AnalyticsPanel graphData={graphData} stats={stats} constituency={constituency} />}
                        {activeTab === 'forensics' && <ForensicsPanel graphData={graphData} stats={stats} constituency={constituency} />}
                        {activeTab === 'timeline' && <TimelinePanel constituency={constituency} />}
                        {activeTab === 'crossnet' && <CrossConstituencyPanel constituency={constituency} />}
                        {activeTab === 'geomap' && <GeoMapPanel constituency={constituency} />}
                        {activeTab === 'upload' && <BatchUploadPanel constituency={constituency} />}
                        {activeTab === 'audit' && <AuditTrailPanel />}
                        {activeTab === 'whistleblower' && <WhistleblowerPanel constituency={constituency} />}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Sidebar Intel (Only visible on Network) */}
            <AnimatePresence>
                {activeTab === 'network' && (
                    <motion.div 
                        initial={{ x: 100, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="hidden lg:block w-[30rem] shrink-0 border-l border-white/5 bg-obsidian-950/20 backdrop-blur-md"
                    >
                        <Sidebar 
                            stats={stats} 
                            selectedNode={selectedNode}
                            onClearSelection={() => setSelectedNode(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {showTour && <DemoTour onComplete={() => setShowTour(false)} />}
      </main>
    </div>
  );
}

export default App;
