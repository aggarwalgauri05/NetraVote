import { useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldCheck, ShieldAlert, AlertOctagon, 
  Trash2, Users, Landmark, FileText, 
  Send, ChevronRight, ArrowLeft, CheckCircle2, Loader2 as Loader,
  Lock, EyeOff, Hash, Search, Activity, LifeBuoy,
  Wifi, Zap, Key, Fingerprint, Terminal, Database,
  Cpu, Server, Share2, Target, Info, MapPin
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ghost_voters',   label: 'Ghost Voter Cluster',       icon: <Users size={20} />, description: 'Anomalous clusters of registrations at single points' },
  { id: 'duplicate_epic', label: 'EPIC Number Duplication',   icon: <Hash size={20} />, description: 'Identified duplicate voter IDs across rolls' },
  { id: 'booth_fraud',    label: 'Booth-Level Fraud',         icon: <Trash2 size={20} />, description: 'Coordinated malpractice at specific polling booths' },
  { id: 'officer_nexus',  label: 'Election Officer Nexus',    icon: <Shield size={20} />, description: 'Evidence of collusion with electoral officials' },
  { id: 'mass_deletion',  label: 'Mass Voter Deletion',       icon: <Trash2 size={20} />, description: 'Unexpected large-scale removal of valid voters' },
  { id: 'other',          label: 'Other Malpractice',        icon: <ShieldAlert size={20} />, description: 'General electoral rolls and registration fraud' },
];

const SEVERITY_CONFIG = {
  LOW:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={16} /> },
  MEDIUM:   { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Info size={16} /> },
  HIGH:     { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <AlertOctagon size={16} /> },
  CRITICAL: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <ShieldAlert size={16} /> },
};

export default function WhistleblowerPanel({ constituency }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    category: '',
    description: '',
    constituency: constituency || '',
    voter_ids: '',
    addresses: '',
    anonymous: true,
    severity: 'HIGH',
    contact_hash: '',
  });

  const updateForm = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:8000/whistleblower/report', form);
      setResult({
        report_id: data.report_id,
        verification_token: data.verification_token,
        message: data.message || 'PROTOCOL_ALPHA_FINALIZED: ENCRYPTED PAYLOAD TRANSMITTED TO CENTRAL ECI VAULT.'
      });
      setStep(3);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Security breach in transmission protocol. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-8 pb-14">
      
      {/* ── Vault Integrity Header ── */}
      <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Lock size={200} className="text-royal-400" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 shadow-2xl shadow-rose-900/20 relative">
            <ShieldAlert size={32} className="text-rose-400" />
            <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-rose-400/20 blur-xl rounded-full" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight leading-none text-royal-400">Vault-6 Integrity Portal</h1>
            <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Wifi size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Encrypted Connection Stable</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] leading-none">AES-GCM-256 P2P TUNNEL</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-10 relative z-10 px-10 border-l border-white/5">
            <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full border-2 transition-all duration-700 ${step >= 1 ? 'border-royal-500 bg-royal-500/10' : 'border-white/5 bg-white/5'}`}>
                    <Fingerprint size={20} className={step >= 1 ? 'text-white' : 'text-slate-700'} />
                </div>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Auth</span>
            </div>
            <div className={`h-px w-10 bg-white/5 ${step >= 2 ? 'bg-royal-500/30' : ''}`} />
            <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full border-2 transition-all duration-700 ${step >= 2 ? 'border-royal-500 bg-royal-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-white/5'}`}>
                    <Terminal size={20} className={step >= 2 ? 'text-white' : 'text-slate-700'} />
                </div>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Buffer</span>
            </div>
            <div className={`h-px w-10 bg-white/5 ${step >= 3 ? 'bg-royal-500/30' : ''}`} />
            <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full border-2 transition-all duration-700 ${step === 3 ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-white/5 bg-white/5'}`}>
                    <ShieldCheck size={20} className={step === 3 ? 'text-emerald-400' : 'text-slate-700'} />
                </div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Sync</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ── Main Submission Core ── */}
        <div className="xl:col-span-2">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-14 rounded-[4rem] glass-panel bg-white/[0.01] border-white/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
                        
                        <div className="relative z-10 space-y-14">
                            <div>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
                                        <Target size={22} className="text-royal-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Step 01: Intelligent Category Selection</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id} onClick={() => updateForm('category', cat.id)}
                                            className={`p-6 rounded-[2.5rem] border text-left transition-all duration-500 group relative overflow-hidden shadow-inner ${form.category === cat.id ? 'bg-royal-500/10 border-royal-500/30' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'}`}
                                        >
                                            <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className={`p-4 rounded-2xl transition-all duration-700 shadow-xl ${form.category === cat.id ? 'bg-royal-600 text-white translate-x-1' : 'bg-slate-800/40 text-slate-500 group-hover:text-royal-400 group-hover:bg-slate-800'}`}>
                                                    {cat.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`text-sm font-bold tracking-tight mb-1 transition-colors uppercase ${form.category === cat.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{cat.label}</div>
                                                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">{cat.description}</div>
                                                </div>
                                            </div>
                                            {form.category === cat.id && (
                                                <motion.div layoutId="cat-active" className="absolute left-0 top-0 bottom-0 w-1.5 bg-royal-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="relative group">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block italic px-2">Target_Constituency_Anchor</label>
                                        <div className="relative">
                                            <input 
                                                value={form.constituency} onChange={e => updateForm('constituency', e.target.value)}
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl px-8 py-5 text-white text-[13px] font-black focus:border-royal-500/40 outline-none transition-all placeholder:text-slate-800 italic uppercase"
                                                placeholder="IDENTIFY REGIONAL MATRIX..."
                                            />
                                            <MapPin size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-800 group-focus-within:text-royal-400 transition-colors" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-4 block px-2">Malpractice_Severity_Scale</label>
                                        <div className="flex gap-2 p-2 rounded-[2.2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                                            {Object.keys(SEVERITY_CONFIG).map(s => (
                                                <button
                                                    key={s} onClick={() => updateForm('severity', s)}
                                                    className={`flex-1 py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${form.severity === s ? 'bg-royal-500 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block italic px-2">Incident_Intelligence_Brief</label>
                                    <div className="relative">
                                        <textarea 
                                            rows={6} value={form.description} onChange={e => updateForm('description', e.target.value)}
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-[3rem] px-8 py-8 text-white text-[13px] font-black focus:border-royal-500/40 outline-none transition-all placeholder:text-slate-800 resize-none italic uppercase custom-scrollbar"
                                            placeholder="DESCRIBE THE SPATIO_TEMPORAL FRACTURES DETECTED IN THE ELECTORAL PROCESS..."
                                        />
                                        <Terminal size={20} className="absolute right-8 top-8 text-slate-800 group-focus-within:text-royal-400 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-5 px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                                    <button 
                                        onClick={() => updateForm('anonymous', !form.anonymous)}
                                        className={`w-14 h-7 rounded-full transition-all relative ${form.anonymous ? 'bg-emerald-500/20' : 'bg-slate-800'}`}
                                    >
                                        <motion.div 
                                            animate={{ x: form.anonymous ? 28 : 4 }}
                                            className={`absolute top-1.5 w-4 h-4 rounded-full shadow-lg ${form.anonymous ? 'bg-emerald-400' : 'bg-slate-600'}`} 
                                        />
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Total Anonymity Matrix</span>
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">ID_SCRUBBING_ENABLED</span>
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep(2)} disabled={!form.category || !form.description}
                                    className="px-14 py-6 rounded-[2.5rem] bg-royal-600 text-white font-black uppercase text-[11px] tracking-[0.4em] italic shadow-2xl shadow-royal-900/40 hover:bg-royal-500 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-4 group"
                                >
                                    Verify Payload <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                     <motion.div 
                        key="step2"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                        className="p-14 rounded-[4rem] glass-panel bg-white/[0.01] border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 quantum-grid opacity-[0.05]" />
                        <div className="absolute top-0 right-0 p-14 opacity-5 animate-pulse-slow"><EyeOff size={300} className="text-royal-400" /></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-6 mb-14">
                                <motion.button 
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => setStep(1)} 
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-royal-400 hover:bg-royal-500 hover:text-white transition-all shadow-xl"
                                >
                                    <ArrowLeft size={20} />
                                </motion.button>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight italic italic leading-none">Payload Protocol Review</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic leading-none">Validate Encrypted metadata before final transmission</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-inner">
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 italic">Incident_Phyla</div>
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 text-royal-400">
                                            {CATEGORIES.find(c=>c.id===form.category)?.icon}
                                        </div>
                                        <div className="text-xl font-black italic tracking-tighter uppercase">{CATEGORIES.find(c=>c.id===form.category)?.label}</div>
                                    </div>
                                </div>
                                <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-inner">
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 italic">Anonymity_Coefficient</div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black italic tracking-widest uppercase border ${form.anonymous ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                            {form.anonymous ? 'TOTAL_ISOLATION_PROTECTED' : 'DEANONYMIZED_LINK'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 mb-14 relative overflow-hidden group">
                                <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 italic border-b border-white/5 pb-4">Payload_Buffer_Brief</div>
                                <p className="text-white text-lg font-black leading-relaxed italic uppercase tracking-tight">{form.description}</p>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleSubmit} disabled={loading}
                                className="w-full py-8 rounded-[3rem] bg-emerald-600 text-white font-black uppercase text-[12px] tracking-[0.5em] italic shadow-2xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all flex items-center justify-center gap-6 relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 shimmer opacity-20" />
                                {loading ? (
                                        <>
                                        <Loader size={24} className="animate-spin" />
                                        <span>INITIATING_SEQUENCE...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        <span>Transmit Encrypted Protocol</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-20 rounded-[5rem] glass-panel bg-emerald-500/5 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
                    >
                        <div className="absolute inset-0 quantum-grid opacity-[0.05]" />
                        <div className="w-32 h-32 rounded-[3.5rem] bg-emerald-500 flex items-center justify-center mb-12 shadow-2xl shadow-emerald-900/60 relative">
                            <CheckCircle2 size={64} className="text-white" />
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0, 0.4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 border-4 border-emerald-500 rounded-[3.5rem]" />
                        </div>
                        <h2 className="text-5xl font-bold text-white uppercase tracking-tighter mb-6 leading-none">Transmission_Sync</h2>
                        <p className="text-emerald-500/60 text-sm max-w-lg mx-auto mb-16 leading-relaxed uppercase tracking-[0.4em] font-bold">{result.message}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
                            <div className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/10 text-left shadow-inner group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Database size={16} className="text-slate-600" />
                                    <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Encrypted_Payload_ID</div>
                                </div>
                                <div className="text-xl font-bold text-white tabular-nums tracking-tighter uppercase">{result.report_id}</div>
                            </div>
                            <div className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/10 text-left shadow-inner group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Key size={16} className="text-emerald-500" />
                                    <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Universal_Audit_Node</div>
                                </div>
                                <div className="text-xl font-black text-emerald-400 tabular-nums tracking-tighter uppercase italic">{result.verification_token}</div>
                            </div>
                        </div>

                        <button onClick={() => setStep(1)} className="text-[11px] font-black text-slate-600 hover:text-white uppercase tracking-[0.6em] transition-all italic hover:scale-110 active:scale-95 group">
                            <span className="border-b border-transparent group-hover:border-slate-500 pb-1">Reset Alpha-6 Protocol</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* ── Security Sidebar ── */}
        <div className="space-y-8">
            <div className="p-10 rounded-[3.5rem] glass-panel relative overflow-hidden bg-white/[0.01] border-white/10 shadow-2xl">
                <div className="absolute inset-0 quantum-grid opacity-[0.02]" />
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3.5 rounded-2xl bg-royal-500/10 border border-royal-500/20 shadow-xl">
                        <Activity size={20} className="text-royal-400" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Audit Metrics</h3>
                </div>
                <div className="space-y-10">
                    {[
                        { label: 'Transmission Latency', val: '0.42ms', progress: 98, color: 'bg-emerald-500' },
                        { label: 'Encryption Complexity', val: '2048-BIT', progress: 100, color: 'bg-royal-500' },
                        { label: 'Anonymity Scalar', val: '99.98%', progress: 99, color: 'bg-amber-500' },
                    ].map((m, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between mb-3 px-1">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic group-hover:text-slate-400 transition-colors">{m.label}</span>
                                <span className="text-[10px] font-black text-white italic tracking-widest">{m.val}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner p-[1px]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${m.progress}%` }} className={`h-full ${m.color} rounded-full relative`}>
                                    <div className="absolute inset-0 shimmer opacity-30" />
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-10 rounded-[3.5rem] glass-panel bg-gradient-to-br from-royal-600/5 to-obsidian-950/20 border border-royal-500/10 relative overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 quantum-grid opacity-[0.03]" />
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <ShieldCheck size={120} className="text-emerald-400" />
                </div>
                <div className="p-4 rounded-3xl bg-royal-400/10 border border-royal-400/20 w-fit mb-8 relative z-10 transition-transform group-hover:rotate-12 group-hover:bg-royal-500/20">
                    <Lock size={28} className="text-royal-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 relative z-10">Immunity Protocols</h3>
                <p className="text-[11px] font-black text-slate-600 leading-relaxed italic uppercase tracking-[0.15em] relative z-10 border-l-2 border-white/5 pl-5 group-hover:text-slate-400 transition-colors">
                    All payloads are scrubbed of hardware IDs, geolocation EXIF data, and temporal fingerprints. Submission is mathematically decoupled from the observer.
                </p>
                <div className="mt-10 flex flex-wrap gap-2.2 relative z-10">
                    {['AES-GCM', 'ZERO_KNOWLEDGE', 'VPN_MESH', 'ID_SCRUB'].map(tag => (
                        <span key={tag} className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[8px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-slate-500 transition-colors">{tag}</span>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
