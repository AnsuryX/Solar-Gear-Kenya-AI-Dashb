import React, { useState } from 'react';
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
  ArrowRight
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
      <div className="bg-sleek-card p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-solar-500" />
          <h2 className="text-base font-display font-bold text-slate-200">n8n MCP Workflow Synthesizer</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          The Solar Gear control center features a native Model Context Protocol (MCP) server integration. Rather than programming flows manually, our core AI can programmatically generate, inspect, and deploy optimized n8n workflow schemas. Describe your integration requirements below to see the schema generated.
        </p>
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
        </div>

        {/* Dynamic Visualizer & Schema View Column */}
        <div className="lg:col-span-2 flex flex-col justify-between h-full min-h-[450px]" id="n8n-output">
          <div className="bg-sleek-terminal rounded-xl border border-slate-800 p-5 flex-1 flex flex-col">
            
            {/* Nav Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-200 uppercase">
                <Compass className="h-4 w-4 text-solar-500" /> Active Workflow: <span className="text-solar-500 lowercase">"{activeWorkflow.name || "unnamed"}"</span>
              </div>
              
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

            {/* Content Renders */}
            <div className="flex-1 flex flex-col justify-between">
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
