import { useCallback, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

const NetworkGraph = ({ graphData, onNodeClick, selectedNode }) => {
  const graphRef = useRef();

  // Dark Theme Palette - Quantum/Neural Aesthetic
  const COLORS = {
    VOTER: '#64748b',    // Slate 500
    GHOST: '#f43f5e',    // Rose 500
    BOOTH: '#60a5fa',    // Royal 400
    ADDRESS: '#a78bfa',  // Purple 400
    PIN: '#94a3b8',      // Slate 400
    SELECTED: '#ffffff', // White
    BG: '#0b1021',       // Obsidian 900
    LINK: 'rgba(255, 255, 255, 0.05)',
    PARTICLE: 'rgba(244, 63, 94, 0.4)'
  };

  const getColor = (node) => {
    const isSelected = selectedNode && selectedNode.id === node.id;
    if (isSelected) return COLORS.SELECTED;
    
    if (node.group === 'Pins') return COLORS.PIN;
    if (node.group === 'TargetBooths') return COLORS.BOOTH;
    if (node.group === 'Addresses') return COLORS.ADDRESS;
    
    if (node.isHighRisk) return COLORS.GHOST;
    return COLORS.VOTER;
  };

  const getRadius = (node) => {
    if (node.group === 'Pins') return 7;
    if (node.group === 'TargetBooths') return 9;
    if (node.group === 'Addresses') return 6;
    return 3.5; 
  };

  useEffect(() => {
    if (graphRef.current) {
      // Stronger repulsive force for 1000+ nodes to ensure visibility
      graphRef.current.d3Force('charge').strength(-3000); 
      graphRef.current.d3Force('link').distance(120);
      graphRef.current.d3Force('center').strength(1.2); 

      // Warm up ticks to pre-calculate layout and avoid 'explosion'
      graphRef.current.d3ReheatSimulation();
      
      const timer = setTimeout(() => {
        // Robust fitting and centering after simulation stabilizes
        graphRef.current.zoomToFit(1200, 200);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [graphData]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent cursor-crosshair">
      {/* ── Corner Intelligence HUD ── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top Right: System Metrics */}
        <div className="absolute top-10 right-10 flex flex-col items-end gap-1 px-4 py-3 rounded-2xl bg-obsidian-950/40 border border-white/5 backdrop-blur-md">
            <span className="text-[8px] font-black text-royal-500 uppercase tracking-[0.3em]">Evidence_Verification</span>
            <span className="text-[12px] font-display font-black text-white tabular-nums">99.9% Secured</span>
            <div className="w-20 h-0.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="h-full w-1/2 bg-royal-400"
                />
            </div>
        </div>

        {/* Bottom Left: Spatial Coordinates */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-1 px-4 py-3 rounded-2xl bg-obsidian-950/40 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Lat_Ref</span>
                    <span className="text-[10px] font-mono text-royal-400 font-bold">28.6139° N</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Long_Ref</span>
                    <span className="text-[10px] font-mono text-royal-400 font-bold">77.2090° E</span>
                </div>
            </div>
        </div>

        {/* Bottom Right: Algorithm Status */}
        <div className="absolute bottom-10 right-10 flex items-center gap-4 px-5 py-3 rounded-2xl bg-obsidian-950/40 border border-white/5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Forensic_Engine</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Netra_Integrity_Verify</span>
            </div>
        </div>

        {/* Radar Scan Circle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <motion.div 
                animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-[800px] h-[800px] border border-royal-500/30 rounded-full flex items-center justify-center"
            >
                <div className="w-[600px] h-[600px] border border-royal-500/20 rounded-full flex items-center justify-center">
                    <div className="w-[400px] h-[400px] border border-royal-500/10 rounded-full" />
                </div>
            </motion.div>
            
            {/* Rotating Beam */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute w-[1000px] h-[1000px] rounded-full overflow-hidden"
                style={{ background: 'conic-gradient(from 0deg at 50% 50%, rgba(59, 113, 247, 0.15) 0%, transparent 10%)' }}
            />
        </div>
      </div>

      {graphData.nodes.length === 0 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8">
                <Radio size={40} className="text-slate-700 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white/40 uppercase tracking-[0.3em] mb-4">No Electoral Data Identified</h3>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest max-w-sm leading-relaxed">
                Connect to TigerGraph or use the <span className="text-royal-400">Database Manager</span> module to ingest electoral rolls.
            </p>
            <div className="mt-12 flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">Scanner_Idle</span>
                </div>
            </div>
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        backgroundColor="transparent"
        warmupTicks={200}
        cooldownTicks={150}
        minZoom={0.1} // Allow zooming out very far to see the 1000-node network
        maxZoom={15}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.4} // Faster cooling for stability
        nodeLabel={(node) => `
          <div style="
            background: rgba(11, 16, 33, 0.95); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            color: #f8fafc; 
            padding: 12px; 
            border-radius: 12px; 
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            font-family: 'Inter', sans-serif;
            min-width: 160px;
          ">
            <div style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 900; margin-bottom: 4px;">
              ${node.group === 'Voters' ? 'Voter Detail' : node.group === 'Addresses' ? 'Residence Info' : 'Polling Station'} 
            </div>
            <div style="font-weight: 900; font-size: 14px; letter-spacing: -0.01em; color: #ffffff;">
              ${node.name}
            </div>
            ${node.riskScore ? `
              <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 8px 0;"></div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Confidence</span>
                <span style="font-size: 11px; font-weight: 900; color: ${node.isHighRisk ? '#f43f5e' : '#60a5fa'}">
                  ${Math.round(node.riskScore * 100)}% Match
                </span>
              </div>
            ` : ''}
          </div>
        `}
        
        linkColor={() => COLORS.LINK}
        linkWidth={1}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.003}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => COLORS.PARTICLE}
        
        onNodeClick={onNodeClick}
        
        nodeCanvasObject={(node, ctx, globalScale) => {
          if (node.x === undefined || node.y === undefined) return;
          const r = getRadius(node);
          const color = getColor(node);
          const isSelected = selectedNode && selectedNode.id === node.id;

          // Clean, sharp nodes for Big Data (no heavy shadows at high node counts)
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();

          // Selection Ring
          if (isSelected) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 2.5 / globalScale, 0, 2 * Math.PI, false);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5 / globalScale;
            ctx.stroke();
          }

          // Optimized Labels
          const isHighRisk = (node.riskScore || 0) > 0.95;
          const shouldShowLabel = globalScale > 5 || isHighRisk || isSelected;

          if (shouldShowLabel) {
            const labelSize = 10 / globalScale;
            ctx.font = `${(isHighRisk || isSelected) ? '900' : '700'} ${labelSize}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = isSelected ? '#ffffff' : isHighRisk ? '#f43f5e' : '#94a3b8';
            ctx.fillText(node.name, node.x, node.y + r + 3 / globalScale);
          }
        }}
        nodeCanvasObjectMode={() => 'replace'}
      />
    </div>
  );
};

export default NetworkGraph;
