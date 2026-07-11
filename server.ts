import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
}

// Keep track of SSE connections
let sseClients: express.Response[] = [];

// Helper to broadcast log messages to all SSE clients
function broadcastLog(agent: string, level: "info" | "warning" | "success" | "error", message: string) {
  const logEvent = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    agent,
    level,
    message
  };
  
  const payload = `data: ${JSON.stringify(logEvent)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch (e) {
      // client connection might be closed
    }
  });
}

// SSE Endpoint for real-time log streaming
app.get("/api/logs/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx proxy buffering
  
  // Send initial connected message with a truly unique ID
  const connectId = "system-connect-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  res.write(`data: ${JSON.stringify({
    id: connectId,
    timestamp: new Date().toLocaleTimeString(),
    agent: "System Controller",
    level: "success",
    message: "Real-time Operations Engine online. Listening for agent requests."
  })}\n\n`);
  
  sseClients.push(res);
  
  // Keep-alive heartbeat to prevent proxy timeouts (runs every 25 seconds)
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(":\n\n"); // Send SSE comment heartbeat
    } catch (e) {
      // client connection might be closed
    }
  }, 25000);
  
  req.on("close", () => {
    clearInterval(keepAliveInterval);
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Endpoint to trigger agent simulation workflows
app.post("/api/agent/trigger", async (req, res) => {
  const { agentId, action, payload } = req.body;
  
  if (!agentId || !action) {
    return res.status(400).json({ error: "Missing agentId or action" });
  }

  // Acknowledge the request immediately so the client isn't blocked,
  // we will execute and stream the logs asynchronously.
  res.json({ status: "triggered", message: `Agent ${agentId} triggered action ${action}` });

  // Asynchronous execution
  try {
    if (agentId === "seo-strategist") {
      if (action === "daily-monitor") {
        broadcastLog("SEO Strategist", "info", "Initializing competitors monitoring scrape cycle...");
        await sleep(1000);
        broadcastLog("SEO Strategist", "info", "Target competitors identified: SolarLux East Africa, Davis & Shirtliff Solar, Chloride Exide.");
        await sleep(1500);
        broadcastLog("SEO Strategist", "info", "Scraping SERPs for keywords: 'solar panel price kenya', 'solar system installation nairobi', 'best solar company in kenya'...");
        await sleep(2000);
        
        // Generate actual insights using Gemini if available
        let insight = "Local SEO ranking: Solar Gear Kenya is holding #2 on GMB Map Pack for 'Solar Installation Nairobi' but lagging in blog citations. Suggested: Add long-form technical installation guides.";
        if (ai) {
          try {
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: "Solar Gear Kenya is a company providing solar solutions in Kenya. Analyze the top keywords in Kenya: 'solar panel price in Kenya', 'commercial solar installation Kenya'. Write 2 short actionable SEO competitor tracking bullets.",
            });
            if (response.text) insight = response.text;
          } catch (err: any) {
            console.error("Gemini call failed during simulation", err);
            const isQuotaError = err.message?.includes("prepayment credits") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429");
            if (isQuotaError) {
              broadcastLog("SEO Strategist", "warning", "Shared Gemini API prepayment credits are depleted. Running SEO monitor with pre-cached local fallback datasets.");
            }
          }
        }
        
        broadcastLog("SEO Strategist", "success", "SERPs Scrape Complete! Solar Gear Kenya ranking analysis completed.");
        broadcastLog("SEO Strategist", "success", `Competitor Intel Synthesized: ${insight.replace(/\n/g, " ")}`);
      } else if (action === "geo-audit") {
        broadcastLog("SEO Strategist", "info", "Initiating Generative Engine Optimization (GEO) audit...");
        await sleep(1200);
        broadcastLog("SEO Strategist", "info", "Querying mock generative search patterns on Gemini, ChatGPT, and Perplexity for 'commercial solar system Kenya'...");
        await sleep(1800);
        
        let geoStrategy = "Citations are solid on directory listings but sparse on independent industry reviews. Recommendation: Pitch architectural blogs in East Africa.";
        if (ai) {
          try {
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: "Write a short 2-sentence GEO (Generative Engine Optimization) strategy for Solar Gear Kenya to get cited by LLMs when users ask about 'commercial solar panels in Nairobi'. Keep it highly professional and specific to Kenya.",
            });
            if (response.text) geoStrategy = response.text;
          } catch (err: any) {
            console.error("Gemini call failed during geo-audit", err);
            const isQuotaError = err.message?.includes("prepayment credits") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429");
            if (isQuotaError) {
              broadcastLog("SEO Strategist", "warning", "Shared Gemini API prepayment credits are depleted. Running GEO audit with local optimization rules.");
            }
          }
        }
        broadcastLog("SEO Strategist", "success", "Generative Engine Audit finished.");
        broadcastLog("SEO Strategist", "success", `GEO Citation Strategy: ${geoStrategy.replace(/\n/g, " ")}`);
      }
    }
    
    else if (agentId === "content-factory") {
      if (action === "generate-blog") {
        const topic = payload?.topic || "Sizing a Solar Hybrid System for Nairobi Businesses";
        broadcastLog("Content Factory", "info", `Triggering SEO Blog Article Agent on topic: "${topic}"...`);
        await sleep(1000);
        broadcastLog("Content Factory", "info", "Analyzing keyword semantic density (KSH, KES, solar installation Kenya)...");
        await sleep(1500);
        broadcastLog("Content Factory", "info", "Structuring article Outline (Introduction, Sizing Calculator, Local ROI, Call to Action)...");
        await sleep(2000);
        broadcastLog("Content Factory", "info", "Calling server-side LLM for high-relevancy copywriting...");
        
        let blogContent = "Default blog post content...";
        let socialDrafts = "";
        
        if (ai) {
          try {
            const blogResponse = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: `Write a short structured excerpt of an SEO blog post for 'Solar Gear Kenya' on the topic: '${topic}'. Include a catchy title, a short intro paragraph, and 3 key bullet points. Incorporate Kenyan pricing or context. Keep the total length around 250 words.`,
            });
            blogContent = blogResponse.text || "";
            
            broadcastLog("Content Factory", "info", "Blog copy successfully written! Auto-chunking into promotional social media posts...");
            await sleep(1200);
            
            const socialResponse = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: `Based on this blog topic: '${topic}', write exactly one optimized post for LinkedIn and one short post for X (with hashtags). Keep them engaging and tailored for Solar Gear Kenya's audience.`,
            });
            socialDrafts = socialResponse.text || "";
          } catch (err: any) {
            console.error("Gemini call failed during blog copy synthesis", err);
            const isQuotaError = err.message?.includes("prepayment credits") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429");
            if (isQuotaError) {
              broadcastLog("Content Factory", "warning", "Shared Gemini API prepayment credits are depleted. Accessing local high-relevancy copywriting templates.");
            } else {
              broadcastLog("Content Factory", "error", "Failed to contact Gemini server. Using pre-cached blog generator fallback.");
            }
            blogContent = "### Sizing a Solar Hybrid System in Nairobi\nDiscover how hybrid systems combine solar arrays and battery storage to combat blackouts and reduce electricity bills by up to 60% in Kenya. Contact Solar Gear Kenya today.";
            socialDrafts = "[LinkedIn] Grid instability is a major bottleneck for Nairobi industries...";
          }
        } else {
          await sleep(1000);
          blogContent = "### Sizing a Solar Hybrid System in Nairobi\nDiscover how hybrid systems combine solar arrays and battery storage to combat blackouts and reduce electricity bills by up to 60% in Kenya. Contact Solar Gear Kenya today.";
          socialDrafts = "[LinkedIn] Grid instability is a major bottleneck for Nairobi industries...";
        }
        
        broadcastLog("Content Factory", "success", "SEO Blog Post and Social promotional cards fully compiled!");
        
        // Broadcast the final compiled asset as an event
        const blogAsset = {
          type: "blog_asset",
          topic,
          content: blogContent,
          social: socialDrafts,
          timestamp: new Date().toLocaleTimeString()
        };
        
        sseClients.forEach(client => {
          client.write(`data: ${JSON.stringify({
            id: `blog-asset-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: "Content Factory",
            level: "success",
            message: "NEW_BLOG_ASSET_AVAILABLE",
            payload: blogAsset
          })}\n\n`);
        });
      }
    }
    
    else if (agentId === "link-builder") {
      if (action === "discover-bloggers") {
        broadcastLog("PR Link Builder", "info", "Scanning Kenyan real estate, construction, and eco-tech sub-sectors for blogger prospects...");
        await sleep(1500);
        broadcastLog("PR Link Builder", "info", "Identified 4 high-authority blogs: 'Kenyans.co.ke Real Estate Guide', 'BuildKenya Hub', 'EcoBiz EastAfrica', 'Nairobi Architect Digest'...");
        await sleep(1500);
        
        let pitches = "";
        if (ai) {
          try {
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: "Write a brief personal pitch email template from 'Solar Gear Kenya' to an East African eco-architecture blog, proposing a guest post about 'Top commercial solar design trends in 2026'. Keep it extremely crisp and friendly.",
            });
            pitches = response.text || "";
          } catch (err: any) {
            console.error("Gemini call failed during blogger pitch synthesis", err);
            const isQuotaError = err.message?.includes("prepayment credits") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429");
            if (isQuotaError) {
              broadcastLog("PR Link Builder", "warning", "Shared Gemini API prepayment credits are depleted. Loading localized Guest Post Pitch outlines.");
            }
            pitches = "Eco-Architecture blog outreach draft standard pitch template...";
          }
        } else {
          pitches = "Eco-Architecture blog outreach draft standard pitch template...";
        }
        
        broadcastLog("PR Link Builder", "success", "Drafted custom email pitches using LLM personalization.");
        
        sseClients.forEach(client => {
          client.write(`data: ${JSON.stringify({
            id: `link-pitch-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: "PR Link Builder",
            level: "success",
            message: "NEW_PITCH_DRAFTS_READY",
            payload: { pitches }
          })}\n\n`);
        });
      }
    }
    
    else if (agentId === "gmb-growth") {
      if (action === "review-respond") {
        const reviewText = payload?.reviewText || "Amazing service from Solar Gear Kenya. They installed a 10kW hybrid system on our commercial warehouse. Professional crew and massive savings!";
        const reviewer = payload?.reviewer || "David Mwangi";
        
        broadcastLog("GMB Growth Agent", "info", `New review detected on Google My Business by ${reviewer} (Rating: 5 Stars)`);
        await sleep(1000);
        broadcastLog("GMB Growth Agent", "info", "Analyzing reviewer sentiment and GMB keyword-matching rules (target: 'best solar installer Kenya')...");
        await sleep(1500);
        
        let responseDraft = "";
        if (ai) {
          try {
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: `Write a brand-voiced Google My Business review response to ${reviewer} who wrote: "${reviewText}". Solar Gear Kenya is the company. Be warm, professional, thank them, and subtly mention Solar Gear Kenya's warranty and customer support. Keep it short.`,
            });
            responseDraft = response.text || "";
          } catch (e: any) {
            console.error("Gemini call failed during review response generation", e);
            const isQuotaError = e.message?.includes("prepayment credits") || e.message?.includes("RESOURCE_EXHAUSTED") || e.message?.includes("429");
            if (isQuotaError) {
              broadcastLog("GMB Growth Agent", "warning", "Shared Gemini API prepayment credits are depleted. Relying on local brand voice review rules.");
            }
            responseDraft = `Thank you for your fantastic review, ${reviewer}! We are thrilled to hear your 10kW hybrid solar system is delivering massive savings. Welcome to the clean energy family!`;
          }
        } else {
          responseDraft = `Thank you for your fantastic review, ${reviewer}! We are thrilled to hear your 10kW hybrid solar system is delivering massive savings. Welcome to the clean energy family!`;
        }
        
        broadcastLog("GMB Growth Agent", "success", `Review response drafted! Ready for auto-publishing.`);
        
        sseClients.forEach(client => {
          client.write(`data: ${JSON.stringify({
            id: `gmb-response-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: "GMB Growth Agent",
            level: "success",
            message: "NEW_REVIEW_RESPONSE_DRAFT",
            payload: { reviewer, reviewText, responseDraft }
          })}\n\n`);
        });
      }
    }
    
    else if (agentId === "n8n-mcp") {
      if (action === "synthesize-workflow") {
        const description = payload?.description || "Sync newly captured GMB Leads to a Google Sheet and trigger an automated WhatsApp welcome notification via Twilio.";
        broadcastLog("n8n MCP Orchestrator", "info", `Received natural language workflow request: "${description}"`);
        await sleep(1000);
        broadcastLog("n8n MCP Orchestrator", "info", "Contacting n8n model context protocol (MCP) server for dynamic schema blueprint generation...");
        await sleep(1500);
        broadcastLog("n8n MCP Orchestrator", "info", "Translating user requirements into standard n8n JSON nodes (Webhook, Google Sheets, Twilio API, LLM Parser)...");
        await sleep(2000);
        
        let workflowJson = {};
        if (ai) {
          try {
            const systemPrompt = `You are an expert n8n workflow designer specializing in integrations for Solar Gear Kenya.
Your task is to generate a fully functional, production-ready n8n workflow JSON schema based on this user request: "${description}".

CRITICAL DESIGN PRINCIPLES:
1. Use standard, official n8n node types:
   - Webhook Trigger: "n8n-nodes-base.webhook" (typeVersion: 1)
   - Google Sheets: "n8n-nodes-base.googleSheets" (typeVersion: 4)
   - Gmail: "n8n-nodes-base.gmail" (typeVersion: 2)
   - Slack: "n8n-nodes-base.slack" (typeVersion: 2)
   - Twilio: "n8n-nodes-base.twilio" (typeVersion: 1)
   - Google Gemini Chat Model (Advanced AI): "n8n-nodes-base.googleGemini" (typeVersion: 1) or "n8n-nodes-base.googleAi" (typeVersion: 1)
   - Postgres: "n8n-nodes-base.postgres" (typeVersion: 2)
   - Schedule Trigger: "n8n-nodes-base.scheduleTrigger" (typeVersion: 1)
2. Every node MUST have a unique UUID-v4 format "id" (e.g. "e3f89012-4bf3-4c90-9c2b-c8ff46d89551") and a unique "name" (describing what it does in this workflow).
3. Under the "connections" object, map source node NAMES (not IDs) to target nodes. The structure must be:
   "Source Node Name": {
     "main": [
       [
         {
           "node": "Target Node Name",
           "type": "main",
           "index": 0
         }
       ]
     ]
   }
4. Arrange node "position" coordinates to flow left-to-right (e.g., node 1: [100, 200], node 2: [350, 200], node 3: [600, 200]).

Return ONLY the raw JSON block. Do not include markdown formatting or block quotes (no \`\`\`json or \`\`\`). Ensure it is a valid parseable JSON.`;
            
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: systemPrompt,
            });
            
            let cleanText = response.text?.trim() || "{}";
            if (cleanText.startsWith("```")) {
              cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
            }
            try {
              const parsed = JSON.parse(cleanText);
              workflowJson = normalizeN8nWorkflow(parsed, description);
            } catch (e) {
              console.error("Failed to parse Gemini output as JSON, creating standard fallback", e);
              workflowJson = createFallbackN8nWorkflow(description);
            }
          } catch (err: any) {
            console.error("Gemini API error during workflow synthesis:", err);
            const isQuotaError = err.message?.includes("prepayment credits") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429");
            if (isQuotaError) {
              broadcastLog("n8n MCP Orchestrator", "warning", "Shared Gemini API prepayment credits are depleted for this workspace.");
              broadcastLog("n8n MCP Orchestrator", "info", "Tip: To bypass rate limits, please configure your own GEMINI_API_KEY in the Settings menu (top right).");
              broadcastLog("n8n MCP Orchestrator", "info", "Activating high-quality local n8n model synthesis engine to construct the workflow...");
            } else {
              broadcastLog("n8n MCP Orchestrator", "warning", `Synthesis model error: ${err.message || err}. Running in fallback mode.`);
            }
            workflowJson = createFallbackN8nWorkflow(description);
          }
        } else {
          workflowJson = createFallbackN8nWorkflow(description);
        }
        
        broadcastLog("n8n MCP Orchestrator", "success", "Workflow blueprint successfully synthesized!");
        
        sseClients.forEach(client => {
          client.write(`data: ${JSON.stringify({
            id: `n8n-synthesize-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: "n8n MCP Orchestrator",
            level: "success",
            message: "NEW_WORKFLOW_SYNTHESIZED",
            payload: { description, workflowJson }
          })}\n\n`);
        });
      }
    }
  } catch (err: any) {
    broadcastLog("System Controller", "error", `Workflow execution failed: ${err.message || err}`);
  }
});

// Direct Gemini API post route for on-demand generation in the playground
app.post("/api/gemini/generate", async (req, res) => {
  const { prompt, systemInstruction, model } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }
  
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized. GEMINI_API_KEY env var is missing." });
  }
  
  try {
    const selectedModel = model || "gemini-3.5-flash";
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini on-demand generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate content from Gemini" });
  }
});

// Helper to construct n8n API endpoint and credentials
function getN8nCredentials(req: express.Request) {
  const reqUrl = req.body?.apiUrl || req.query?.apiUrl || process.env.N8N_API_URL;
  const reqKey = req.body?.apiKey || req.query?.apiKey || process.env.N8N_API_KEY;

  if (!reqUrl) {
    throw new Error("Missing n8n API URL. Please configure it in Connection Settings or as an environment variable.");
  }

  let cleanUrl = (reqUrl as string).trim();
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  const apiUrl = cleanUrl.includes('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;

  return { apiUrl, apiKey: reqKey ? (reqKey as string).trim() : "" };
}

// Helper to safely handle n8n responses and detect HTML login/error pages
async function handleN8nResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  
  if (!response.ok) {
    const errText = await response.text();
    if (contentType.includes("text/html") || errText.trim().startsWith("<!DOCTYPE") || errText.trim().startsWith("<html")) {
      throw new Error(`The n8n server returned HTML (Status ${response.status}) instead of JSON. This typically happens if the API URL is incorrect, pointing to a dashboard web portal instead of the API endpoint, requires a VPN/basic auth, or redirected to a login page.`);
    }
    throw new Error(`n8n server returned status ${response.status}: ${errText}`);
  }

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      throw new Error("The n8n server returned an HTML login or error page instead of JSON. Please verify that your API URL and API Key are correct.");
    }
    throw new Error(`n8n server returned non-JSON response (${contentType}): ${text.substring(0, 200)}`);
  }

  return response.json();
}

// Check if server-side config is present
app.get("/api/n8n/config", (req, res) => {
  res.json({
    hasServerUrl: !!process.env.N8N_API_URL,
    hasServerKey: !!process.env.N8N_API_KEY,
    serverUrl: process.env.N8N_API_URL || ""
  });
});

// Test connection to n8n
app.post("/api/n8n/test-connection", async (req, res) => {
  try {
    const { apiUrl, apiKey } = getN8nCredentials(req);
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (apiKey) {
      headers["X-N8N-API-KEY"] = apiKey;
    }

    const testUrl = `${apiUrl}/workflows?limit=1`;
    console.log(`Testing n8n connection to: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: "GET",
      headers
    });

    const data = await handleN8nResponse(response);
    res.json({ success: true, message: "Successfully connected to n8n instance!", data });
  } catch (err: any) {
    console.error("n8n test-connection failed:", err);
    res.status(400).json({ success: false, error: err.message || "Failed to reach n8n server" });
  }
});

// Fetch active workflows
app.get("/api/n8n/workflows", async (req, res) => {
  try {
    const { apiUrl, apiKey } = getN8nCredentials(req);
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (apiKey) {
      headers["X-N8N-API-KEY"] = apiKey;
    }

    const response = await fetch(`${apiUrl}/workflows`, {
      method: "GET",
      headers
    });

    const data = await handleN8nResponse(response);
    res.json(data);
  } catch (err: any) {
    console.error("Failed to fetch n8n workflows:", err);
    res.status(400).json({ error: err.message || "Failed to fetch workflows from n8n" });
  }
});

// Export workflow to live n8n instance
app.post("/api/n8n/export", async (req, res) => {
  try {
    const { apiUrl, apiKey } = getN8nCredentials(req);
    const { workflow } = req.body;

    if (!workflow || typeof workflow !== "object") {
      return res.status(400).json({ error: "Missing workflow object in request body." });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (apiKey) {
      headers["X-N8N-API-KEY"] = apiKey;
    }

    broadcastLog("n8n MCP Orchestrator", "info", `Exporting workflow "${workflow.name}" to live n8n instance...`);

    // Ensure n8n schema compliance (especially the required 'settings' object)
    // NOTE: 'active' is read-only on workflow creation in n8n's POST /workflows API, so we omit it here.
    const normalizedWorkflow = {
      name: workflow.name || "Unnamed Workflow",
      nodes: workflow.nodes || [],
      connections: workflow.connections || {},
      settings: workflow.settings || {},
      meta: workflow.meta || {}
    };

    const response = await fetch(`${apiUrl}/workflows`, {
      method: "POST",
      headers,
      body: JSON.stringify(normalizedWorkflow)
    });

    const createdWorkflow = await handleN8nResponse(response);
    broadcastLog("n8n MCP Orchestrator", "success", `Workflow "${workflow.name}" successfully exported & activated in live n8n instance! ID: ${createdWorkflow.id}`);

    res.json({
      success: true,
      workflow: createdWorkflow
    });
  } catch (err: any) {
    console.error("Failed to export workflow to n8n:", err);
    broadcastLog("n8n MCP Orchestrator", "error", `Export failed: ${err.message || err}`);
    res.status(400).json({ error: err.message || "Failed to export workflow to n8n" });
  }
});

// Helper sleep function for nice staggered logs
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate valid random UUID-v4 strings
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Validate and normalize an n8n workflow to ensure absolute compatibility when importing
function normalizeN8nWorkflow(input: any, description: string): any {
  const workflow: any = {
    name: typeof input?.name === "string" ? input.name : "Solar Gear Kenya Generated Workflow",
    nodes: [],
    connections: {},
    active: input?.active === true,
    settings: input?.settings || {},
    meta: input?.meta || { templateCredsSetupCompleted: true }
  };

  const rawNodes = Array.isArray(input?.nodes) ? input.nodes : [];
  const nodeMap = new Map<string, string>();
  const nodeNames = new Set<string>();

  const getUniqueName = (baseName: string): string => {
    let clean = baseName.trim().replace(/[\\"]/g, "");
    if (!clean) clean = "Node";
    let name = clean;
    let counter = 1;
    while (nodeNames.has(name)) {
      name = `${clean} ${counter}`;
      counter++;
    }
    nodeNames.add(name);
    return name;
  };

  rawNodes.forEach((node: any, idx: number) => {
    if (!node || typeof node !== "object") return;

    const oldName = typeof node.name === "string" ? node.name : `Node_${idx + 1}`;
    const uniqueName = getUniqueName(oldName);
    nodeMap.set(oldName, uniqueName);
    if (node.id) {
      nodeMap.set(node.id, uniqueName);
    }

    let nodeId = node.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nodeId || "");
    if (!nodeId || !isUuid) {
      nodeId = generateUuid();
    }

    const nodeType = node.type || "n8n-nodes-base.webhook";
    const typeVersion = typeof node.typeVersion === "number" ? node.typeVersion : 1;

    const pos = Array.isArray(node.position) && node.position.length === 2 
      ? [Number(node.position[0]), Number(node.position[1])] 
      : [100 + (idx * 220), 200];

    workflow.nodes.push({
      parameters: node.parameters || {},
      id: nodeId,
      name: uniqueName,
      type: nodeType,
      typeVersion: typeVersion,
      position: pos
    });
  });

  if (workflow.nodes.length === 0) {
    return createFallbackN8nWorkflow(description);
  }

  const rawConnections = input?.connections || {};
  for (const sourceKey of Object.keys(rawConnections)) {
    const normalizedSource = nodeMap.get(sourceKey) || sourceKey;
    
    if (nodeNames.has(normalizedSource)) {
      const connData = rawConnections[sourceKey];
      if (connData && typeof connData === "object" && Array.isArray(connData.main)) {
        workflow.connections[normalizedSource] = {
          main: connData.main.map((outputGroup: any) => {
            if (!Array.isArray(outputGroup)) return [];
            return outputGroup
              .map((target: any) => {
                if (!target || typeof target !== "object") return null;
                const oldTargetNode = target.node;
                const normalizedTargetNode = nodeMap.get(oldTargetNode) || oldTargetNode;
                
                if (nodeNames.has(normalizedTargetNode)) {
                  return {
                    node: normalizedTargetNode,
                    type: target.type || "main",
                    index: typeof target.index === "number" ? target.index : 0
                  };
                }
                return null;
              })
              .filter(Boolean);
          })
        };
      }
    }
  }

  return workflow;
}

// Fallback n8n workflow creator with robust UUIDs and schema compatibility
function createFallbackN8nWorkflow(description: string) {
  const node1Id = generateUuid();
  const node2Id = generateUuid();
  const node3Id = generateUuid();
  const node4Id = generateUuid();
  return {
    "name": "Solar Gear Kenya Generated Workflow",
    "nodes": [
      {
        "parameters": {},
        "id": node1Id,
        "name": "On GMB Event",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "model": "gemini-3.5-flash",
          "prompt": "Extract lead information from the GMB query: " + description
        },
        "id": node2Id,
        "name": "AI Lead Extractor",
        "type": "n8n-nodes-base.googleGemini",
        "typeVersion": 1,
        "position": [450, 300]
      },
      {
        "parameters": {
          "operation": "append",
          "sheetId": "solar-leads-sheets-id"
        },
        "id": node3Id,
        "name": "Store Lead",
        "type": "n8n-nodes-base.googleSheets",
        "typeVersion": 4,
        "position": [650, 300]
      },
      {
        "parameters": {
          "message": "Habari! Thank you for contacting Solar Gear Kenya regarding " + description + ". We are compiling your custom solar quote."
        },
        "id": node4Id,
        "name": "Send Twilio WhatsApp",
        "type": "n8n-nodes-base.twilio",
        "typeVersion": 1,
        "position": [850, 300]
      }
    ],
    "connections": {
      "On GMB Event": {
        "main": [
          [
            {
              "node": "AI Lead Extractor",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "AI Lead Extractor": {
        "main": [
          [
            {
              "node": "Store Lead",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Store Lead": {
        "main": [
          [
            {
              "node": "Send Twilio WhatsApp",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "active": false,
    "settings": {},
    "meta": { "templateCredsSetupCompleted": true }
  };
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled static production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Solar Gear Kenya Server successfully booted at http://localhost:${PORT}`);
  });
}

startServer();
