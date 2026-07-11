import React, { useState, useEffect } from 'react';
import { 
  N8nWorkflow 
} from '../types';
import { 
  Workflow, 
  Code, 
  Layout, 
  Copy, 
  Check, 
  Play, 
  Sparkles, 
  HelpCircle,
  Cpu,
  ChevronRight,
  RefreshCw,
  Plus,
  Compass,
  ArrowRight,
  Settings,
  Link,
  AlertCircle,
  ExternalLink,
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react';

interface N8nIntegratorProps {
  triggerAgent: (agentId: string, action: string, payload?: any) => void;
  latestWorkflow: N8nWorkflow | null;
  isLoading: boolean;
}

export default function N8nIntegrator({ triggerAgent, latestWorkflow, isLoading }: N8nIntegratorProps) {
  const [prompt, setPrompt] = useState<string>("Sync newly captured Solar Leads from Facebook Ads to Google Sheets, then analyze the energy demand using Gemini and send a customized quote email via Gmail.");
  const [viewMode, setViewMode] = useState<'canvas' | 'json'>('canvas');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Live connection state
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('n8n_api_url') || "https://automate.ansurysystems.online";
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('n8n_api_key') || "";
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'connected' | 'failed'>('untested');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Export status
  const [isExporting, setIsExporting] = useState(false);
  const [exportedWorkflow, setExportedWorkflow] = useState<any | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Live active workflows from instance
  const [liveWorkflows, setLiveWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load server-side defaults on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/n8n/config');
        const data = await res.json();
        // Only set localStorage if the user has not configured anything yet
        if (data.serverUrl && !localStorage.getItem('n8n_api_url')) {
          setApiUrl(data.serverUrl);
          localStorage.setItem('n8n_api_url', data.serverUrl);
        }
      } catch (e) {
        console.error("Failed to load server n8n config defaults:", e);
      }
    };
    fetchConfig();
  }, []);

  // Save config changes
  const handleSaveConfig = (url: string, key: string) => {
    setApiUrl(url);
    setApiKey(key);
    localStorage.setItem('n8n_api_url', url);
    localStorage.setItem('n8n_api_key', key);
    setConnectionStatus('untested');
    setExportedWorkflow(null);
  };

  // Run test connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionError(null);
    try {
      const res = await fetch('/api/n8n/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiUrl, apiKey })
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus('connected');
        fetchLiveWorkflows();
      } else {
        setConnectionStatus('failed');
        setConnectionError(data.error || "Connection failed.");
      }
    } catch (e: any) {
      setConnectionStatus('failed');
      setConnectionError(e.message || "Failed to reach backend proxy.");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Fetch live workflows list
  const fetchLiveWorkflows = async () => {
    if (!apiUrl) return;
    setIsLoadingWorkflows(true);
    setConnectionError(null);
    try {
      const queryParams = new URLSearchParams({ apiUrl, apiKey });
      const res = await fetch(`/api/n8n/workflows?${queryParams.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Returned status ${res.status}`);
      }
      const data = await res.json();
      const workflows = Array.isArray(data) ? data : (data.data || []);
      setLiveWorkflows(workflows);
      setConnectionStatus('connected');
    } catch (e: any) {
      console.error("Failed to fetch live workflows:", e);
      setConnectionStatus('failed');
      setConnectionError(e.message || "Failed to fetch live workflows.");
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  // Attempt fetching workflows on mount if url is present
  useEffect(() => {
    if (apiUrl) {
      fetchLiveWorkflows();
    }
  }, [apiUrl]);

  // Export current workflow
  const handleExportWorkflow = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportedWorkflow(null);
    try {
      const res = await fetch('/api/n8n/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl,
          apiKey,
          workflow: activeWorkflow
        })
      });
      const data = await res.json();
      if (data.success) {
        setExportedWorkflow(data.workflow);
        fetchLiveWorkflows();
      } else {
        setExportError(data.error || "Failed to export workflow.");
      }
    } catch (e: any) {
      setExportError(e.message || "Failed to contact export proxy.");
    } finally {
      setIsExporting(false);
    }
  };

  // Default initial workflow template
  const defaultWorkflow: N8nWorkflow = {
    "name": "Solar Gear GMB Review Responder Sync",
    "nodes": [
      {
        "parameters": {
          "path": "gmb-review-webhook",
          "options": {}
        },
        "id": "node-gmb-trigger",
        "name": "Google My Business Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [100, 200]
      },
      {
        "parameters": {
          "model": "gemini-3.5-flash",
          "prompt": "You are Solar Gear Brand AI. Read review: {{ $json.body.comment }}. Draft a five-star response thanking them and mentioning solar panel warranties."
        },
        "id": "node-gemini-ai",
        "name": "Google Gemini LLM",
        "type": "n8n-nodes-base.googleGemini",
        "typeVersion": 1,
        "position": [320, 200]
      },
      {
        "parameters": {
          "operation": "append",
          "sheetId": "solargear-sheets-id-1"
        },
        "id": "node-sheets-append",
        "name": "Append Google Sheets",
        "type": "n8n-nodes-base.googleSheets",
        "typeVersion": 3,
        "position": [540, 200]
      },
      {
        "parameters": {
          "message": "Brand alert: New GMB review successfully processed for {{ $json.body.reviewer }}. Reply draft queued."
        },
        "id": "node-twilio-notify",
        "name": "Send WhatsApp Alert",
        "type": "n8n-nodes-base.twilio",
        "typeVersion": 1,
        "position": [760, 200]
      }
    ],
    "connections": {
      "Google My Business Webhook": {
        "main": [
          [
            {
              "node": "Google Gemini LLM",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Google Gemini LLM": {
        "main": [
          [
            {
              "node": "Append Google Sheets",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Append Google Sheets": {
        "main": [
          [
            {
              "node": "Send WhatsApp Alert",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  };

  const activeWorkflow = latestWorkflow || defaultWorkflow;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeWorkflow, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateWorkflow = () => {
    triggerAgent('n8n-mcp', 'synthesize-workflow', { description: prompt });
  };

  // Helper to get nice node icons/colors based on type
  const getNodeStyles = (type: string) => {
    if (type.includes('webhook')) return { bg: 'bg-indigo-950/20 border-indigo-500/30', text: 'text-indigo-400', badge: 'Trigger' };
    if (type.includes('Gemini')) return { bg: 'bg-solar-950/20 border-solar-500/30', text: 'text-solar-500', badge: 'AI Node' };
    if (type.includes('googleSheets') || type.includes('google')) return { bg: 'bg-emerald-950/20 border-emerald-500/30', text: 'text-emerald-400', badge: 'Database/Sheet' };
    if (type.includes('twilio') || type.includes('slack')) return { bg: 'bg-pink-950/20 border-pink-500/30', text: 'text-pink-400', badge: 'Action Alert' };
    return { bg: 'bg-sleek-card border-slate-850', text: 'text-slate-400', badge: 'Utility' };
  };

  const templates = [
    { title: "Facebook Lead -> WhatsApp Sync", prompt: "Sync Facebook Lead Ad submissions to a Google Sheets dashboard, classify solar KW requirement via Gemini, and send a structured welcome WhatsApp." },
    { title: "Competitor SERP Alert System", prompt: "Trigger a daily cron-job scraping competitor ranks for 'solar battery Mombasa'. If Solar Gear drops below #2, trigger a Slack notification alert." },
    { title: "Blogger Outreach Auto-Sequencer", prompt: "Monitor real estate guest blogging sites, draft customized guest pitches using Google Gemini, and launch a sequenced follow-up thread via Gmail." }
  ];

  return (
    <div className="space-y-6" id="n8n-integrator-container">
      {/* Top Description Panel */}
      <div className="bg-sleek-card p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-solar-500" />
            <h2 className="text-base font-display font-bold text-slate-200">n8n Live-Sync Orchestrator</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Live Connection Status Badge */}
            {connectionStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wifi className="h-3 w-3" /> Connected: {apiUrl.replace(/https?:\/\//, '').split('/')[0]}
              </span>
            ) : connectionStatus === 'failed' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20" title={connectionError || ""}>
                <WifiOff className="h-3 w-3" /> Offline (Credentials Error)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                <AlertCircle className="h-3 w-3" /> Live n8n Sync Untested
              </span>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 bg-sleek-terminal text-slate-300 hover:text-white hover:border-slate-500 transition"
              id="toggle-settings-btn"
            >
              <Settings className={`h-3.5 w-3.5 ${showSettings ? 'animate-spin' : ''}`} />
              Configure Instance
            </button>
          </div>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Programmatically generate, preview, and deploy optimized n8n integration workflows. Configure your active n8n credentials below to push the synthesized nodes straight to your dashboard!
        </p>

        {/* Collapsible Connection Settings Form */}
        {showSettings && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-left animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Link className="h-3 w-3" /> n8n Server Base URL (or REST API URL)
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => handleSaveConfig(e.target.value, apiKey)}
                className="w-full p-2 text-xs bg-sleek-terminal rounded border border-slate-800 text-slate-200 focus:outline-none focus:border-solar-500 font-mono"
                placeholder="https://automate.ansurysystems.online"
              />
              <span className="text-[9px] text-slate-500">The primary domain of your self-hosted or cloud n8n instance.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                Lock API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveConfig(apiUrl, e.target.value)}
                className="w-full p-2 text-xs bg-sleek-terminal rounded border border-slate-800 text-slate-200 focus:outline-none focus:border-solar-500 font-mono"
                placeholder="Paste your personal n8n api-key..."
              />
              <span className="text-[9px] text-slate-500">Used securely via local storage to authorize workflow uploads.</span>
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-slate-800/50">
              <div className="text-xs text-slate-400">
                {connectionStatus === 'connected' && (
                  <span className="text-emerald-400 font-medium">✓ Credentials valid! Connected successfully.</span>
                )}
                {connectionStatus === 'failed' && (
                  <span className="text-rose-400 text-[11px] block max-w-md truncate">✗ Error: {connectionError}</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !apiUrl}
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-solar-500 hover:bg-solar-600 disabled:opacity-50 text-white font-bold text-xs shadow transition cursor-pointer"
                  id="test-connection-btn"
                >
                  {isTestingConnection ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
                  Test Connection & Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interface Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="n8n-main-workspace">
        
        {/* Left Input & Presets Column */}
        <div className="space-y-5" id="n8n-inputs">
          {/* AI Generator Input */}
          <div className="bg-sleek-terminal rounded-xl border border-slate-800 p-5 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-solar-500/10 text-solar-500 border border-solar-500/20">
              <Sparkles className="h-3 w-3" /> AI Node Schema Architect
            </span>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">Natural Language Intent</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full p-3 text-xs bg-sleek-card rounded-lg border border-slate-800 text-slate-200 focus:outline-none focus:border-solar-500 resize-none leading-relaxed"
                placeholder="Describe what automation flow you want n8n to execute..."
                id="n8n-intent-prompt"
              />
            </div>

            <button
              onClick={handleGenerateWorkflow}
              disabled={isLoading || !prompt}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-solar-500 hover:bg-solar-600 text-white font-bold text-xs shadow-md shadow-solar-500/10 transition"
              id="n8n-synthesize-btn"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Synthesizing Schema...
                </>
              ) : (
                <>
                  <Workflow className="h-4 w-4" /> Synthesize n8n Workflow JSON
                </>
              )}
            </button>
          </div>

          {/* Quick-load Templates Presets */}
          <div className="p-5 bg-sleek-card rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Operational Templates</div>
            <div className="space-y-2">
              {templates.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(tpl.prompt)}
                  className="w-full text-left p-2.5 rounded-lg bg-sleek-terminal hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center justify-between text-xs group"
                  id={`template-load-${idx}`}
                >
                  <span className="truncate max-w-[200px] font-medium">{tpl.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-solar-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Live n8n Workspace Workflows */}
          <div className="p-5 bg-sleek-card rounded-xl border border-slate-800 space-y-3 text-left">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-solar-500" /> Live n8n Workflows ({liveWorkflows.length})
              </div>
              {apiUrl && (
                <button
                  onClick={fetchLiveWorkflows}
                  disabled={isLoadingWorkflows}
                  className="p-1 rounded text-slate-500 hover:text-solar-500 transition"
                  title="Refresh Live Workflows"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingWorkflows ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {isLoadingWorkflows ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-500 gap-2 text-[11px]">
                <RefreshCw className="h-4 w-4 animate-spin text-solar-500" />
                Retrieving active dashboard...
              </div>
            ) : liveWorkflows.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {liveWorkflows.map((wk, idx) => (
                  <div
                    key={wk.id || idx}
                    className="p-2.5 rounded-lg bg-sleek-terminal border border-slate-800 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="truncate flex-1 space-y-0.5">
                      <div className="font-medium text-slate-200 truncate" title={wk.name}>{wk.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">ID: {wk.id}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {wk.active ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Paused
                        </span>
                      )}
                      <a
                        href={`${apiUrl.replace(/\/api\/v1\/?$/, '')}/workflow/${wk.id}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="text-slate-500 hover:text-solar-500 transition-colors"
                        title="Open in n8n editor"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-[10px] text-slate-500 leading-normal">
                {connectionStatus === 'connected' 
                  ? "No workflows found on this n8n instance yet."
                  : "Sync credentials to fetch live status updates from your active dashboard."}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Visualizer & Schema View Column */}
        <div className="lg:col-span-2 flex flex-col justify-between h-full min-h-[450px]" id="n8n-output">
          <div className="bg-sleek-terminal rounded-xl border border-slate-800 p-5 flex-1 flex flex-col">
            
            {/* Nav Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-200 uppercase">
                <Compass className="h-4 w-4 text-solar-500" /> Active Workflow: <span className="text-solar-500 lowercase">"{activeWorkflow.name || "unnamed"}"</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Direct Live Deploy Button */}
                <button
                  onClick={handleExportWorkflow}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition shadow cursor-pointer"
                  id="direct-deploy-btn"
                >
                  {isExporting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  Deploy to Live n8n
                </button>

                <div className="flex items-center bg-sleek-card p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setViewMode('canvas')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold transition ${
                      viewMode === 'canvas' ? 'bg-solar-500 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="view-canvas-btn"
                  >
                    <Layout className="h-3 w-3" /> Visual Flow
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold transition ${
                      viewMode === 'json' ? 'bg-solar-500 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="view-json-btn"
                  >
                    <Code className="h-3 w-3" /> Raw JSON Schema
                  </button>
                </div>
              </div>
            </div>

            {/* Content Renders */}
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Export Success/Error Banner */}
              {exportedWorkflow && (
                <div className="mb-4 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-left space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Workflow Exported Successfully!
                    </span>
                    <button
                      onClick={() => setExportedWorkflow(null)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    The workflow <strong className="text-emerald-300">"{exportedWorkflow.name}"</strong> has been compiled and saved directly on your live n8n instance.
                  </p>
                  <div className="flex gap-3 pt-1">
                    <a
                      href={`${apiUrl.replace(/\/api\/v1\/?$/, '')}/workflow/${exportedWorkflow.id}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded transition"
                    >
                      <ExternalLink className="h-3 w-3" /> Open in n8n Editor
                    </a>
                  </div>
                </div>
              )}

              {exportError && (
                <div className="mb-4 p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl text-left space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> Export Failed
                    </span>
                    <button
                      onClick={() => setExportError(null)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    {exportError}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Make sure your n8n credentials are correct, your instance allows external CORS requests, and the API Key is active.
                  </span>
                </div>
              )}

              {viewMode === 'canvas' ? (
                /* Dynamic Interactive Node Flowchart Canvas */
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-6 relative" id="nodes-canvas">
                  <div className="absolute top-0 right-0 text-[10px] text-slate-600 font-mono">
                    Click nodes to inspect metadata parameters
                  </div>

                  {activeWorkflow.nodes && activeWorkflow.nodes.map((node, index) => {
                    const styles = getNodeStyles(node.type);
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <React.Fragment key={node.id}>
                        {/* Connecting Arrow */}
                        {index > 0 && (
                          <div className="hidden md:flex flex-col items-center justify-center text-solar-500/40">
                            <ArrowRight className="h-5 w-5" />
                            <span className="text-[8px] font-mono mt-0.5 uppercase tracking-widest text-slate-600">Main</span>
                          </div>
                        )}

                        {/* Node Card */}
                        <button
                          onClick={() => setSelectedNode(node)}
                          className={`p-4 rounded-xl border text-left transition-all max-w-[170px] flex-1 ${styles.bg} ${
                            isSelected 
                              ? 'border-solar-500 ring-1 ring-solar-500/20 shadow-lg shadow-solar-500/10 scale-105' 
                              : 'hover:border-slate-700 hover:bg-slate-900/20'
                          }`}
                          id={`canvas-node-${node.id}`}
                        >
                          <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full ${styles.text} bg-sleek-bg border border-slate-800`}>
                            {styles.badge}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-200 mt-2.5 truncate">{node.name}</h4>
                          <div className="text-[9px] text-slate-500 mt-1 font-mono truncate">{node.type.split('.').pop()}</div>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                /* RAW JSON schema view */
                <div className="flex-1 relative">
                  <button
                    onClick={handleCopyJson}
                    className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] bg-sleek-terminal hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded border border-slate-800 transition"
                    id="copy-schema-btn"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied Workflow!' : 'Copy Workflow'}
                  </button>
                  <pre className="p-4 bg-sleek-card rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
                    {JSON.stringify(activeWorkflow, null, 2)}
                  </pre>
                </div>
              )}

              {/* Node Inspector Side drawer/bottom row */}
              {selectedNode && (
                <div className="mt-4 p-4 bg-sleek-card rounded-xl border border-slate-800 space-y-2 text-left" id="node-inspector">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-solar-500">NODE PARAMETERS INSPECTOR</span>
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Close Inspector
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Node Name:</span>
                      <div className="text-slate-300 font-semibold">{selectedNode.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Node ID:</span>
                      <div className="text-slate-400 font-mono">{selectedNode.id}</div>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px]">
                    <span className="text-slate-500 block mb-1">Parameters (JSON Schema):</span>
                    <pre className="p-2 bg-sleek-terminal rounded border border-slate-800 text-slate-300 font-mono text-[10px] overflow-x-auto">
                      {JSON.stringify(selectedNode.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
