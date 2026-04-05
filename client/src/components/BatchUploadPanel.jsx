import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Loader2 as Loader, X, 
  Database, ChevronRight, File, Zap, ShieldCheck, 
  Binary, Globe, Cpu, Server, Activity, ArrowUpRight,
  Shield, Brain, Network, HardDrive, Share2, Terminal,
  Users, AlertTriangle, Layers
} from 'lucide-react';

const STATES = { IDLE: 'idle', UPLOADING: 'uploading', PROCESSING: 'processing', COMPLETE: 'complete', ERROR: 'error' };

const PIPELINE_STEPS = [
  { id: 'parse', label: 'PDF_STRUCTURE_ANALYSIS', detail: 'DEEP_SCAN: EXTRACTING SEMANTIC LAYERS' },
  { id: 'normalize', label: 'GEO_SPATIAL_ALIGNMENT', detail: 'MATRIX_MATCH: PINCODE & GPS COORDINATES' },
  { id: 'dedup', label: 'IDENTITY_RESOLUTION', detail: 'PHONETIC_HASH: LEVENSHTEIN CLUSTERING' },
  { id: 'score', label: 'SIGNAL_WEIGHTING', detail: 'PROBABILITY_MODEL: 7-FACTOR FRAUD DETECTION' },
  { id: 'graph', label: 'GRAPH_SYNCHRONIZATION', detail: 'UPSERT: TIGERGRAPH COLD_STORAGE SYNC' },
];

export default function BatchUploadPanel({ constituency }) {
  const [uploadState, setUploadState] = useState(STATES.IDLE);
  const [files, setFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [pastUploads] = useState([
    { id: 'UP-990-X', filename: 'Electoral_Roll_ND_2024.pdf', constituency: 'New Delhi', date: '2024-03-15', voters: 1240, anomalies: 88, integrity: 94.2 },
    { id: 'UP-772-Q', filename: 'Voter_List_SD_Ward12.pdf', constituency: 'South Delhi', date: '2024-03-14', voters: 890, anomalies: 42, integrity: 91.8 },
  ]);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
      f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.name.endsWith('.csv')
    );
    if (droppedFiles.length > 0) setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const simulateUpload = async () => {
    if (files.length === 0) return;
    setUploadState(STATES.UPLOADING);
    setProgress(0);

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }

    setUploadState(STATES.PROCESSING);
    for (let s = 0; s < PIPELINE_STEPS.length; s++) {
      setCurrentStep(s);
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    }

    setResults({
      totalVoters: files.length * 1580,
      anomalies: Math.floor(files.length * 1580 * 0.056),
      processingTime: (4.2 + Math.random()).toFixed(1),
      nodes: files.length * 6200,
      edges: files.length * 12400
    });

    setUploadState(STATES.COMPLETE);
    setCurrentStep(PIPELINE_STEPS.length);
  };

  const resetUpload = () => {
    setUploadState(STATES.IDLE);
    setFiles([]);
    setCurrentStep(-1);
    setProgress(0);
    setResults(null);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-8 pb-14">
      
      {/* ── Ingestion Nexus Header ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Server size={200} className="text-royal-400" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-2xl shadow-royal-900/40 relative">
            <Database size={32} className="text-royal-400" />
            <motion.div 
               animate={{ opacity: [0.1, 0.4, 0.1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-royal-400/20 blur-xl rounded-full"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic leading-none">Data Ingestion Nexus</h1>
            <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Pipeline Connected</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">TigerGraph Savanna Core v6.2</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 relative z-10">
            {[
                { label: 'Active Pipeline', val: 'GEN_4_AI_PARSER', icon: <Cpu size={16} />, color: 'text-royal-400' },
                { label: 'Ingest Latency', val: '142ms / Cluster', icon: <Activity size={16} />, color: 'text-emerald-400' }
            ].map((k, i) => (
                <div key={i} className="flex flex-col items-end px-6 border-l border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`p-1.5 rounded-lg bg-white/5 ${k.color}`}>{k.icon}</span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{k.label}</span>
                    </div>
                    <div className="text-xl font-black text-white tabular-nums italic">{k.val}</div>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ── Main Processing Block ── */}
        <div className="xl:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {uploadState === STATES.IDLE && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Drop Zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative p-20 rounded-[4rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden group shadow-2xl ${dragOver ? 'bg-royal-500/10 border-royal-500/40 shadow-royal-900/20' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'}`}
                >
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.csv" onChange={(e) => setFiles(Array.from(e.target.files))} className="hidden" />
                  
                  <div className="absolute inset-0 quantum-grid opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
                  <div className="absolute -top-24 -right-24 w-80 h-80 bg-royal-500/10 rounded-full blur-[120px] pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-royal-400/5 rounded-full blur-[120px] pointer-events-none" />

                  <div className="relative flex flex-col items-center text-center">
                    <div className={`p-8 rounded-[2.5rem] mb-10 transition-all duration-700 shadow-2xl relative ${dragOver ? 'bg-royal-500 scale-110 rotate-12' : 'bg-royal-400/10 border border-royal-400/20'}`}>
                        <Upload size={48} className={`transition-all duration-700 ${dragOver ? 'text-white' : 'text-royal-400'}`} />
                        <motion.div animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 border-2 border-royal-400/30 rounded-[2.5rem]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight italic">Initialize Electoral Document Stream</h3>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic max-w-sm leading-relaxed mx-auto opacity-60">
                        Drop high-definition PDF Rolls, CSV datasets, or regional XLS exports for neural processing
                    </p>
                    <div className="mt-12 flex items-center gap-10 opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                        <div className="flex flex-col items-center gap-2">
                            <FileText size={24} className="text-white" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">PDF-V1</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Binary size={24} className="text-white" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">RAW-CSV</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Database size={24} className="text-white" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">SQL-SYNC</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Queue Cluster */}
                <AnimatePresence>
                    {files.length > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-10 rounded-[3.5rem] glass-panel bg-white/[0.01] border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Terminal size={140} className="text-white" /></div>
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
                                    <Layers size={20} className="text-royal-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Active Cluster Cluster</h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{files.length} ITEMS PREPARED FOR SCAN</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setFiles([])} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-slate-600 hover:text-rose-500 uppercase tracking-[0.3em] transition-all italic">Clear All</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {files.map((f, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-5 rounded-[2.2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                                    <div className="flex items-center gap-5 overflow-hidden relative z-10">
                                        <div className="p-3 rounded-xl bg-royal-400/10 text-royal-400 flex-shrink-0 group-hover:bg-royal-500 group-hover:text-white transition-all shadow-inner"><File size={18} /></div>
                                        <div className="truncate">
                                            <div className="text-[13px] font-black text-white truncate italic uppercase tracking-tight">{f.name}</div>
                                            <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] mt-1 italic">{(f.size / 1024).toFixed(0)} KB · READY_FOR_SYNC</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="p-3 rounded-xl transition-all text-slate-800 hover:text-rose-500 hover:bg-rose-500/10 pointer-events-auto opacity-0 group-hover:opacity-100"><X size={16} /></button>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={simulateUpload} 
                            className="w-full mt-10 py-6 rounded-[2.5rem] bg-royal-600 text-[11px] font-black text-white uppercase tracking-[0.4em] italic shadow-2xl shadow-royal-900/40 hover:bg-royal-500 transition-all flex items-center justify-center gap-4 relative z-10"
                        >
                            <Zap size={20} fill="currentColor" /> Initialize Neural Ingestion Cycle
                        </motion.button>
                    </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            )}

            {(uploadState === STATES.UPLOADING || uploadState === STATES.PROCESSING) && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="p-14 rounded-[4rem] glass-panel bg-white/[0.01] border-white/10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5 animate-pulse-slow"><Cpu size={260} className="text-royal-400" /></div>
                <div className="absolute inset-0 quantum-grid opacity-[0.04]" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="p-5 rounded-3xl bg-royal-500/10 border border-royal-500/20 shadow-xl relative overflow-hidden">
                            <Brain size={32} className="text-royal-400 animate-pulse" />
                            <div className="absolute inset-0 shimmer opacity-20" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-royal-500 uppercase tracking-[0.6em] mb-2 italic">Neural_Stream_Synchronized</div>
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Matrix Processing</h2>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="text-6xl font-black text-white tabular-nums tracking-tighter italic leading-none mb-3 drop-shadow-xl">{progress}%</div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">GLOBAL_SEQUENCE</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                  </div>

                  <div className="h-4 rounded-full bg-white/[0.03] border border-white/5 overflow-hidden mb-16 relative shadow-inner p-1">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                        className="h-full bg-gradient-to-r from-royal-600 via-royal-400 to-royal-600 rounded-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 shimmer" />
                        <div className="absolute inset-y-0 right-0 w-20 bg-white/20 blur-xl" />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PIPELINE_STEPS.map((step, idx) => {
                      const isActive = idx === currentStep;
                      const isDone = idx < currentStep;
                      return (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-6 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden shadow-inner ${isActive ? 'bg-royal-500/10 border-royal-500/30' : isDone ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/[0.01] border-white/5 opacity-30 grayscale'}`}
                        >
                            <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
                            <div className="flex items-center gap-5 relative z-10">
                                <div className={`p-3 rounded-2xl border transition-all duration-500 ${isActive ? 'bg-royal-400/20 border-royal-400/40 shadow-xl' : isDone ? 'bg-emerald-400/20 border-emerald-400/40' : 'bg-white/5 border-white/10'}`}>
                                    {isDone ? <CheckCircle size={18} className="text-emerald-400" /> : isActive ? <Loader size={18} className="text-royal-400 animate-spin" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-700" />}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 italic ${isActive ? 'text-royal-400' : isDone ? 'text-emerald-500' : 'text-slate-600'}`}>{step.label}</div>
                                    <div className={`text-xs font-black transition-all font-mono tracking-tight ${isActive ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-800'}`}>{step.detail}</div>
                                </div>
                                {isDone && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic font-mono animate-pulse">PASSED</span>}
                            </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {uploadState === STATES.COMPLETE && results && (
                <motion.div 
                    key="complete"
                    initial={{ opacity: 0, scale: 0.9, y: 30 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="p-14 rounded-[4rem] glass-panel bg-emerald-500/5 border border-emerald-500/20 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 quantum-grid opacity-[0.05]" />
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none self-start">
                        <ShieldCheck size={260} className="text-emerald-400" />
                    </div>

                    <div className="flex flex-col items-center text-center mb-16 relative z-10">
                        <div className="p-8 rounded-[3.5rem] bg-emerald-500/10 border border-emerald-500/20 shadow-2xl shadow-emerald-900/40 mb-10 relative">
                            <ShieldCheck size={64} className="text-emerald-400" />
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 border-4 border-emerald-500/30 rounded-[3.5rem]" />
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">Sync finalized</h2>
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 bg-emerald-500/30" />
                            <p className="text-[11px] font-black text-emerald-500/60 uppercase tracking-[0.5em] italic">Ingestion_Sequence_End: {results.processingTime}s</p>
                            <div className="h-px w-8 bg-emerald-500/30" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14 relative z-10">
                        {[
                            { label: 'Identities Parsed', val: results.totalVoters.toLocaleString(), color: 'text-royal-400', bg: 'bg-royal-500/10', icon: <Users size={16} /> },
                            { label: 'Anomalies Filtered', val: results.anomalies, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: <AlertTriangle size={16} /> },
                            { label: 'Graph Hubs Synced', val: results.nodes.toLocaleString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <Network size={16} /> },
                            { label: 'Edge Verifications', val: results.edges.toLocaleString(), color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Share2 size={16} /> }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 text-center group hover:bg-white/[0.05] transition-all hover:scale-105 shadow-inner"
                            >
                                <div className={`p-2.5 rounded-xl border border-white/5 mx-auto mb-5 w-fit ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                                <div className={`text-3xl font-black tabular-nums transition-transform tracking-tighter italic mb-2 leading-none ${stat.color}`}>{stat.val}</div>
                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <button onClick={resetUpload} className="w-full py-6 rounded-[2.5rem] bg-emerald-600/10 border border-emerald-500/20 text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-4 relative z-10 shadow-xl group">
                        <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <span>Initialize Subsequent Ingestion Cluster</span>
                    </button>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Auxiliary Vault Segment ── */}
        <div className="space-y-8">
            {/* Vault Registry */}
            <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden bg-white/[0.01] border-white/10 shadow-2xl">
                <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
                            <HardDrive size={20} className="text-royal-400" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Ingestion Vault</h3>
                    </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
                    {pastUploads.map((up, i) => (
                        <motion.div 
                            key={up.id} 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all relative overflow-hidden"
                        >
                            <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-[10px] font-mono text-slate-700 tracking-tighter italic font-bold uppercase">{up.id}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest italic">ARCHIVED_V:7.4</span>
                                </div>
                            </div>
                            <div className="text-[14px] font-black text-white truncate mb-2 group-hover:text-royal-400 transition-colors uppercase italic tracking-tight leading-none">{up.filename}</div>
                            <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-6 italic">{up.date} · {up.constituency}</div>
                            
                            <div className="flex items-center justify-between pt-5 border-t border-white/5 relative z-10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Integrity_Coefficient</span>
                                    <div className="text-base font-black text-emerald-400 italic tabular-nums">{up.integrity}%</div>
                                </div>
                                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-royal-500/20 transition-all">
                                    <ChevronRight size={14} className="text-slate-800 group-hover:text-white transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Ingestion Specs */}
            <div className="p-10 rounded-[3.5rem] glass-panel bg-gradient-to-br from-royal-600/5 to-obsidian-950/20 border border-royal-500/10 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none self-start">
                    <Binary size={100} className="text-royal-400" />
                </div>
                <div className="p-4 rounded-3xl bg-royal-400/10 border border-royal-400/20 w-fit mb-6 relative z-10">
                    <Shield size={24} className="text-royal-400" />
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-6 italic relative z-10">Verification_Protocols</h4>
                <div className="flex flex-wrap gap-3 relative z-10">
                    {['PDF_V1.7+', 'OCR_ADV_V3', 'CSV_LATENCY_L1', 'GSQL_SAVANNA', 'SHA_HASH_256'].map(tag => (
                        <span key={tag} className="px-5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic hover:text-white hover:border-royal-500/20 transition-all cursor-default">{tag}</span>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
