import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Code, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Database,
  Workflow,
  Zap,
  Network
} from 'lucide-react';

export default function ArchitecturalBlueprint() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const payloadExample = `{
  "action": "workflow.create",
  "name": "GMB Lead to WhatsApp Sync",
  "schema": {
    "nodes": [
      {
        "name": "GMB Review Webhook",
        "type": "n8n-nodes-base.webhook",
        "parameters": { "path": "gmb-reviews", "httpMethod": "POST" },
        "position": [100, 200]
      },
      {
        "name": "Gemini Multi-Agent Parser",
        "type": "n8n-nodes-base.googleGemini",
        "parameters": {
          "model": "gemini-3.5-flash",
          "prompt": "Analyze GMB review: {{ $json.body.comment }}. Categorize sentiment and draft a response adhering to Solar Gear brand voice."
        },
        "position": [300, 200]
      },
      {
        "name": "Post Auto Response",
        "type": "n8n-nodes-base.httpRequest",
        "parameters": {
          "url": "https://mybusiness.googleapis.com/v4/{{ $json.name }}/reviews/{{ $json.reviewId }}/reply",
          "method": "POST",
          "body": { "comment": "{{ $json.text }}" }
        },
        "position": [500, 200]
      }
    ],
    "connections": {
      "GMB Review Webhook": {
        "main": [[{ "node": "Gemini Multi-Agent Parser", "type": "main", "index": 0 }]]
      },
      "Gemini Multi-Agent Parser": {
        "main": [[{ "node": "Post Auto Response", "type": "main", "index": 0 }]]
      }
    }
  }
}`;

  return (
    <div className="space-y-8 pb-16" id="architectural-blueprint-container">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 p-8 border border-slate-800/80">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-solar-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-solar-500/10 text-solar-500 border border-solar-500/20 mb-4">
            <Zap className="h-3 w-3" /> System Architecture Document v1.0
          </span>
          <h1 className="text-3xl font-display font-bold text-slate-100 tracking-tight">
            Solar Gear Kenya Operations Blueprint
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl leading-relaxed">
            A comprehensive, high-performance integration proposal linking multi-agent systems, real-time WebSocket/SSE notifications, and native n8n Model Context Protocol (MCP) workflows.
          </p>
        </div>
      </div>

      {/* 1. Tech Stack Selection */}
      <section className="bg-slate-900/60 rounded-xl border border-slate-800/60 p-6 space-y-4" id="tech-stack-section">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="h-5 w-5 text-solar-500" />
          <h2 className="text-xl font-display font-semibold text-slate-100">1. Recommended Tech Stack</h2>
        </div>
        
        <p className="text-slate-300 text-sm leading-relaxed">
          The Solar Gear Kenya dashboard requires a robust, responsive environment that minimizes operational friction and optimizes background job handling.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/60 space-y-2">
            <div className="flex items-center gap-2 text-solar-500 font-semibold text-sm">
              <Server className="h-4 w-4" /> Backend & Automation Engine
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li><strong className="text-slate-300">FastAPI or Node.js (Express/Nest):</strong> Ideal for handling high-volume HTTP routing and asynchronous tasks cleanly.</li>
              <li><strong className="text-slate-300">Server-Sent Events (SSE) or WebSockets (ws):</strong> SSE is recommended for read-only agent logging streams (lower resource overhead, automatic reconnection), while WebSockets handles bi-directional workflow mutations.</li>
              <li><strong className="text-slate-300">n8n Host:</strong> Run self-hosted n8n in Docker alongside the main backend with public webhooks exposed securely via reverse proxy.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
              <Database className="h-4 w-4" /> Persistence & Caching
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li><strong className="text-slate-300">PostgreSQL (Prisma/Drizzle ORM):</strong> Durable database of record for tracking competitor keywords history, social scheduling grids, GMB reviews, and agent analytics.</li>
              <li><strong className="text-slate-300">Redis:</strong> Serving as a message broker for pub/sub WebSocket channels, locking mechanism for scrape routines, and transient session caching.</li>
              <li><strong className="text-slate-300">InfluxDB/ClickHouse (Optional):</strong> For high-frequency rank/domain authority historical tracking over long horizons.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Architectural Design Pattern */}
      <section className="bg-slate-900/60 rounded-xl border border-slate-800/60 p-6 space-y-4" id="design-pattern-section">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="h-5 w-5 text-solar-500" />
          <h2 className="text-xl font-display font-semibold text-slate-100">2. LLM Orchestration & n8n MCP Design Pattern</h2>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          The integration follows the <strong className="text-solar-500">Model Context Protocol (MCP)</strong> paradigm. MCP establishes a secure, standardized bridge allowing LLMs (like Gemini) to safely execute commands, read schemas, and generate workflow JSON files natively on the self-hosted n8n instance.
        </p>

        {/* CSS-based Visual Diagram */}
        <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs">
            <div className="p-3 bg-slate-900 rounded border border-slate-700/80 font-semibold text-slate-200">
              Solar Gear Dashboard
              <div className="text-[10px] font-normal text-slate-400 mt-1">Vite + React UI</div>
            </div>
            
            <div className="flex justify-center text-solar-500 font-mono text-[10px]">
              <span className="hidden md:inline">── WebSocket/SSE Logs ──▶</span>
              <span className="md:hidden">▼ SSE Logs ▼</span>
            </div>

            <div className="p-3 bg-solar-950/40 rounded border border-solar-500/40 font-semibold text-solar-500">
              Orchestrator Backend
              <div className="text-[10px] font-normal text-slate-300 mt-1">Node.js + Gemini SDK</div>
            </div>

            <div className="flex justify-center text-solar-500 font-mono text-[10px]">
              <span className="hidden md:inline">── MCP JSON payload ──▶</span>
              <span className="md:hidden">▼ MCP Schema ▼</span>
            </div>

            <div className="p-3 bg-emerald-950/40 rounded border border-emerald-500/40 font-semibold text-emerald-500">
              Self-Hosted n8n Instance
              <div className="text-[10px] font-normal text-emerald-400 mt-1">Executes & Runs JSON Nodes</div>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-400 max-w-lg mx-auto leading-relaxed">
            <strong>The Workflow Loop:</strong> When a user describes an automation intent, the <strong>Orchestrator</strong> prompts Gemini, which outputs a compliant n8n node JSON array. This is pushed directly to the n8n API via MCP, deploying the workflow in seconds without manual programming.
          </div>
        </div>
      </section>

      {/* 3. Programmatic JSON Payload Structures */}
      <section className="bg-slate-900/60 rounded-xl border border-slate-800/60 p-6 space-y-4" id="json-schema-section">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-solar-500" />
            <h2 className="text-xl font-display font-semibold text-slate-100">3. Example n8n MCP Workflow JSON</h2>
          </div>
          <button 
            onClick={() => handleCopy(payloadExample, 'json-payload')}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2.5 rounded transition"
            id="copy-payload-btn"
          >
            {copiedSection === 'json-payload' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedSection === 'json-payload' ? 'Copied' : 'Copy Schema'}
          </button>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          Below is the precise schema structured for Gemini to write or edit an automation workflow. The orchestrator backend submits this payload directly to n8n's REST API `/api/v1/workflows` to generate new services dynamically.
        </p>

        <div className="relative">
          <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
            {payloadExample}
          </pre>
        </div>
      </section>

      {/* 4. Next Actionable Steps to Spin up the MVP */}
      <section className="bg-slate-900/60 rounded-xl border border-slate-800/60 p-6 space-y-4" id="next-steps-section">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Workflow className="h-5 w-5 text-solar-500" />
          <h2 className="text-xl font-display font-semibold text-slate-100">4. Actions to Spin Up MVP</h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-solar-500/10 text-solar-500 text-xs font-bold border border-solar-500/20">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Deploy Self-Hosted n8n</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Run n8n in a Docker container on Cloud Run, VPS, or Render. Secure the API key and ensure the REST API endpoints are accessible by the Orchestrator with an API key.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-solar-500/10 text-solar-500 text-xs font-bold border border-solar-500/20">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Establish the Model Context Protocol (MCP) Server</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Configure a Node.js microservice representing the MCP backend. Initialize Gemini 3.5 Flash or Gemini 3.1 Pro utilizing the <code>@google/genai</code> SDK and map functions that translate natural language intentions directly into n8n JSON nodes.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-solar-500/10 text-solar-500 text-xs font-bold border border-solar-500/20">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Wire up Server-Sent Events (SSE)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Configure the log-broadcasting pipeline on the Express server. When n8n triggers or competitor scraping routines run, push structural status updates in real-time to the dashboard.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-solar-500/10 text-solar-500 text-xs font-bold border border-solar-500/20">
              4
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Configure OAuth Credential Stores</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Create Google OAuth credentials to securely interface with Google My Business reviews and Gmail API pipelines on behalf of Solar Gear Kenya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Prioritized List of Integration Endpoints */}
      <section className="bg-slate-900/60 rounded-xl border border-slate-800/60 p-6 space-y-4" id="endpoints-section">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Network className="h-5 w-5 text-solar-500" />
          <h2 className="text-xl font-display font-semibold text-slate-100">5. Prioritized Integration Endpoints</h2>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          These external endpoints are prioritized for immediate connection to guarantee full synchronization with Google, social platforms, and n8n pipelines:
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2.5 p-3 rounded bg-slate-950 border border-slate-800/60">
            <span className="mt-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PRIORITY 1</span>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Google My Business Business Profile API (v4.0)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Required for fetching reviews instantly and auto-posting weekly product catalog updates into Map Packs.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded bg-slate-950 border border-slate-800/60">
            <span className="mt-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PRIORITY 1</span>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">n8n Workflow Execution REST API (v1)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Enables programmatic injection of generated JSON workflows and live execution triggers from the dashboard.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded bg-slate-950 border border-slate-800/60">
            <span className="mt-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">PRIORITY 2</span>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Buffer or Social Graph APIs (LinkedIn, X)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Automates the publishing queue for the AI Content Factory's custom blog summaries.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded bg-slate-950 border border-slate-800/60">
            <span className="mt-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">PRIORITY 3</span>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Gmail Outreach API Sequencing</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Bridges the PR link-builder outreach agent directly with eco-tech bloggers for guest placement requests.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
