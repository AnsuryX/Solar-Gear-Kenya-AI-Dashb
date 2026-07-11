import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import AgentPillars from './components/AgentPillars';
import N8nIntegrator from './components/N8nIntegrator';
import ArchitecturalBlueprint from './components/ArchitecturalBlueprint';
import { LogEntry, ActiveTab, BlogAsset, GmbReviewDraft, N8nWorkflow } from './types';
import { Clock, Globe, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "initial-setup",
      timestamp: new Date().toLocaleTimeString(),
      agent: "System Controller",
      level: "info",
      message: "Ready to establish EventSource connection to backend server."
    }
  ]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Dynamic generated assets states
  const [latestBlog, setLatestBlog] = useState<BlogAsset | null>(null);
  const [latestGmbResponse, setLatestGmbResponse] = useState<GmbReviewDraft | null>(null);
  const [latestWorkflow, setLatestWorkflow] = useState<N8nWorkflow | null>(null);

  // Time state for live display
  const [timeStr, setTimeStr] = useState<string>("");

  // Setup live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hook up SSE log receiver
  useEffect(() => {
    const eventSource = new EventSource('/api/logs/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
      setLogs(prev => [
        ...prev,
        {
          id: "sse-established-" + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          agent: "System Controller",
          level: "success",
          message: "REAL_TIME_STREAMING_ONLINE: Secure channel established with operations cockpit."
        }
      ]);
    };

    eventSource.onmessage = (event) => {
      try {
        const logData = JSON.parse(event.data);
        
        // Handle specialized broadcast payloads
        if (logData.message === "NEW_BLOG_ASSET_AVAILABLE" && logData.payload) {
          setLatestBlog(logData.payload);
          setActiveTab('agents'); // Switch view so they can see the blog write results
        } 
        else if (logData.message === "NEW_REVIEW_RESPONSE_DRAFT" && logData.payload) {
          setLatestGmbResponse(logData.payload);
          setActiveTab('agents');
        }
        else if (logData.message === "NEW_WORKFLOW_SYNTHESIZED" && logData.payload) {
          setLatestWorkflow(logData.payload.workflowJson);
          setIsLoading(false);
          setActiveTab('n8n');
        }

        setLogs(prev => [...prev, logData]);
      } catch (e) {
        console.error("Failed to parse incoming log SSE event stream", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      setIsConnected(false);
      setLogs(prev => [
        ...prev,
        {
          id: "sse-error-" + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          agent: "System Controller",
          level: "error",
          message: "SSE connection lost. Reconnecting in background..."
        }
      ]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Handler to post agent trigger requests
  const triggerAgent = async (agentId: string, action: string, payload?: any) => {
    if (agentId === "n8n-mcp" && action === "synthesize-workflow") {
      setIsLoading(true);
    }

    try {
      const res = await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action, payload })
      });
      const data = await res.json();
      console.log(`Triggered ${agentId} - ${action}`, data);
    } catch (e: any) {
      console.error("Failed to trigger agent operation", e);
      setLogs(prev => [
        ...prev,
        {
          id: "trigger-err-" + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          agent: "System Controller",
          level: "error",
          message: `Trigger execution failure: ${e.message || e}`
        }
      ]);
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="flex h-screen w-screen bg-sleek-bg font-sans text-slate-300 overflow-hidden" id="solar-cockpit-shell">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isConnected={isConnected} 
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full bg-sleek-bg overflow-hidden" id="workspace-viewport">
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between shrink-0 bg-sleek-sidebar/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500 font-mono flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-solar-500 animate-pulse" /> Target Domain:
            </span>
            <span className="text-sm font-semibold text-slate-200 font-mono">
              solargear.co.ke
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Clock */}
            <div className="flex items-center gap-2 bg-sleek-card/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400">
              <Clock className="h-3.5 w-3.5 text-solar-500" />
              <span>{timeStr || "00:00:00 UTC"}</span>
            </div>

            {/* Shield Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure Session</span>
            </div>
          </div>
        </header>

        {/* Active Tab Screen Area */}
        <div className="flex-1 overflow-y-auto p-8" id="active-viewport-scroll">
          {activeTab === 'overview' && (
            <DashboardOverview 
              logs={logs} 
              clearLogs={clearLogs} 
              triggerAgent={triggerAgent} 
            />
          )}

          {activeTab === 'agents' && (
            <AgentPillars 
              triggerAgent={triggerAgent} 
              latestBlog={latestBlog}
              latestGmbResponse={latestGmbResponse}
            />
          )}

          {activeTab === 'n8n' && (
            <N8nIntegrator 
              triggerAgent={triggerAgent} 
              latestWorkflow={latestWorkflow}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'blueprint' && (
            <ArchitecturalBlueprint />
          )}
        </div>
      </main>
    </div>
  );
}
