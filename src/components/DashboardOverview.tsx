import React, { useState, useEffect, useRef } from 'react';
import { 
  LogEntry, 
  CompetitorRanking 
} from '../types';
import { 
  Terminal, 
  Activity, 
  TrendingUp, 
  Award, 
  Clock, 
  Play, 
  Sparkles,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DashboardOverviewProps {
  logs: LogEntry[];
  clearLogs: () => void;
  triggerAgent: (agentId: string, action: string, payload?: any) => void;
}

export default function DashboardOverview({ logs, clearLogs, triggerAgent }: DashboardOverviewProps) {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [isSimulatingAll, setIsSimulatingAll] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs to bottom on new logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle filtered logs
  const filteredLogs = logs.filter(log => {
    if (selectedAgentFilter === 'all') return true;
    if (selectedAgentFilter === 'system') return log.agent.includes('System');
    if (selectedAgentFilter === 'seo') return log.agent.includes('SEO');
    if (selectedAgentFilter === 'content') return log.agent.includes('Content');
    if (selectedAgentFilter === 'link') return log.agent.includes('PR') || log.agent.includes('Link');
    if (selectedAgentFilter === 'gmb') return log.agent.includes('GMB');
    if (selectedAgentFilter === 'n8n') return log.agent.includes('n8n');
    return true;
  });

  // Keywords tracked state (mock rankings for solar sector in Kenya)
  const rankings: CompetitorRanking[] = [
    { keyword: 'solar panel price kenya', solarGear: 1, competitorA: 3, competitorB: 2, competitorC: 4 },
    { keyword: 'commercial solar installation kenya', solarGear: 2, competitorA: 1, competitorB: 4, competitorC: 3 },
    { keyword: 'hybrid solar systems nairobi', solarGear: 1, competitorA: 4, competitorB: 2, competitorC: 5 },
    { keyword: 'solar companies in kenya', solarGear: 3, competitorA: 2, competitorB: 1, competitorC: 6 },
    { keyword: 'industrial solar microgrids east africa', solarGear: 1, competitorA: 5, competitorB: 3, competitorC: 2 },
  ];

  // Helper to trigger all agents sequence
  const runFullOperationalCheck = async () => {
    setIsSimulatingAll(true);
    triggerAgent('seo-strategist', 'daily-monitor');
    await new Promise(r => setTimeout(r, 4000));
    triggerAgent('content-factory', 'generate-blog', { topic: "Grid-Tied vs Hybrid Solar Sizing in Kenya" });
    await new Promise(r => setTimeout(r, 4500));
    triggerAgent('link-builder', 'discover-bloggers');
    await new Promise(r => setTimeout(r, 4000));
    triggerAgent('gmb-growth', 'review-respond', { reviewer: "Mwangi Kamau", reviewText: "Solar Gear did an outstanding job installing our solar mini-grid." });
    await new Promise(r => setTimeout(r, 3000));
    setIsSimulatingAll(false);
  };

  return (
    <div className="space-y-6" id="dashboard-overview-container">
      {/* Dynamic Status Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-grid">
        {/* SEO STRATEGIST */}
        <div className="bg-sleek-card border border-slate-800 p-5 rounded-xl flex flex-col gap-3 shadow-2xl hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">SEO STRATEGIST</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold font-mono">ACTIVE</span>
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
            92.4 <span className="text-xs font-normal text-emerald-400 font-mono">+4.2%</span>
          </div>
          <div className="text-[10px] text-slate-500 italic">Scanning competitors for "Solar Hybrid Kenya"</div>
        </div>

        {/* CONTENT FACTORY */}
        <div className="bg-sleek-card border border-slate-800 p-5 rounded-xl flex flex-col gap-3 shadow-2xl hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">CONTENT FACTORY</span>
            <span className="text-[10px] bg-solar-500/10 text-solar-500 px-2 py-0.5 rounded border border-solar-500/20 font-bold font-mono">WRITING</span>
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
            18 <span className="text-xs font-normal text-slate-500 font-semibold">Posts</span>
          </div>
          <div className="text-[10px] text-slate-500 italic">Drafting: "Commercial Solar ROI - Nairobi 2024"</div>
        </div>

        {/* PR OUTREACH */}
        <div className="bg-sleek-card border border-slate-800 p-5 rounded-xl flex flex-col gap-3 shadow-2xl hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">PR OUTREACH</span>
            <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold font-mono">IDLE</span>
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
            12 <span className="text-xs font-normal text-emerald-400 font-mono">8 Reaches</span>
          </div>
          <div className="text-[10px] text-slate-500 italic">Waiting for MCP link verification loop</div>
        </div>

        {/* GMB GROWTH */}
        <div className="bg-sleek-card border border-slate-800 p-5 rounded-xl flex flex-col gap-3 shadow-2xl hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">GMB GROWTH</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold font-mono">STABLE</span>
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
            4.9 <span className="text-xs font-normal text-slate-500 uppercase tracking-tighter">Rating</span>
          </div>
          <div className="text-[10px] text-slate-500 italic">3 Reviews auto-responded today</div>
        </div>
      </div>

      {/* Main Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
        {/* Real-time SSE Log Terminal Console */}
        <div className="lg:col-span-2 bg-sleek-terminal rounded-xl border border-slate-800 flex flex-col h-[500px]" id="log-terminal">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-sleek-sidebar rounded-t-xl">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-solar-500" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Live Agent Execution Logs</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={clearLogs}
                className="text-[10px] px-2.5 py-1 rounded bg-sleek-card hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
                id="clear-logs-btn"
              >
                Clear Console
              </button>
            </div>
          </div>

          {/* Terminal Filters */}
          <div className="flex items-center gap-1.5 p-2 bg-[#050608] border-b border-slate-800 overflow-x-auto">
            {['all', 'system', 'seo', 'content', 'link', 'gmb', 'n8n'].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedAgentFilter(filter)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded transition uppercase ${
                  selectedAgentFilter === filter 
                    ? 'bg-solar-500/10 text-solar-500 border border-solar-500/30 font-bold' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                id={`filter-${filter}-btn`}
              >
                {filter === 'link' ? 'PR Outreach' : filter === 'gmb' ? 'GMB Local' : filter}
              </button>
            ))}
          </div>

          {/* Logs body */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-2.5 bg-[#050608] shadow-inner">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Console is empty. Trigger an agent workspace routine or a full sequence check.
              </div>
            ) : (
              filteredLogs.map((log) => {
                let badgeColor = "text-slate-400";
                let logIcon = "▪";
                if (log.level === "success") { badgeColor = "text-emerald-500 font-semibold"; logIcon = "✔"; }
                if (log.level === "warning") { badgeColor = "text-amber-500"; logIcon = "▲"; }
                if (log.level === "error") { badgeColor = "text-red-500 font-semibold"; logIcon = "✖"; }
                
                return (
                  <div key={log.id} className="flex gap-4 leading-relaxed hover:bg-slate-900/20 p-0.5 rounded transition">
                    <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                    <span className="text-solar-500 font-bold uppercase">[{log.agent}]</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Prompt controls */}
          <div className="p-3 bg-sleek-sidebar border-t border-slate-800 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono">
              REAL-TIME SSE STREAM
            </span>
            <button
              onClick={runFullOperationalCheck}
              disabled={isSimulatingAll}
              className={`flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg font-bold transition ${
                isSimulatingAll 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-solar-500 hover:bg-solar-600 text-white shadow-md shadow-solar-500/10'
              }`}
              id="full-check-btn"
            >
              <Play className="h-3.5 w-3.5" />
              {isSimulatingAll ? "Running Cockpit Check..." : "Run Global Agent Run"}
            </button>
          </div>
        </div>

        {/* Competitor SERP Intelligence Tracker */}
        <div className="bg-sleek-card rounded-xl border border-slate-800 p-5 space-y-4 flex flex-col" id="serp-tracker">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="h-4.5 w-4.5 text-solar-500" />
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">Kenyan Solar Search Share</h3>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed mb-1">
            Real-time daily SERP ranks for key queries comparing <strong className="text-solar-500">Solar Gear Kenya</strong> against local solar giants.
          </div>

          <div className="flex-1 space-y-4">
            {rankings.map((rank) => (
              <div key={rank.keyword} className="space-y-1.5 p-2.5 rounded-lg bg-sleek-terminal/40 border border-slate-800">
                <div className="flex justify-between text-[11px]">
                  <span className="font-mono text-slate-300 font-medium truncate max-w-[160px]">{rank.keyword}</span>
                  <span className="text-[10px] text-slate-500">Targeting Nairobi</span>
                </div>
                
                {/* Ranking Bar visualizer */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-[9px] font-mono text-center">
                  <div className="space-y-1">
                    <div className="text-slate-500">Solar Gear</div>
                    <div className={`p-1 rounded font-bold ${
                      rank.solarGear === 1 ? 'bg-solar-500/20 text-solar-500 border border-solar-500/30' : 'bg-slate-900 text-slate-400'
                    }`}>#{rank.solarGear}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 truncate font-sans">SolarLux EA</div>
                    <div className="p-1 rounded bg-sleek-bg text-slate-400">#{rank.competitorA}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 truncate font-sans">Davis & S</div>
                    <div className="p-1 rounded bg-sleek-bg text-slate-400">#{rank.competitorB}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 truncate font-sans">Chloride Ex</div>
                    <div className="p-1 rounded bg-sleek-bg text-slate-400">#{rank.competitorC}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1 font-mono">
            <RefreshCw className="h-3 w-3 animate-spin text-solar-500/60" /> Live polling every 24 hours
          </div>
        </div>
      </div>
    </div>
  );
}
