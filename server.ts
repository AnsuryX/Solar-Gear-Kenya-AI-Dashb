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
  
  // Send initial connected message
  res.write(`data: ${JSON.stringify({
    id: "system-connect",
    timestamp: new Date().toLocaleTimeString(),
    agent: "System Controller",
    level: "success",
    message: "Real-time Operations Engine online. Listening for agent requests."
  })}\n\n`);
  
  sseClients.push(res);
  
  req.on("close", () => {
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
          } catch (err) {
            console.error("Gemini call failed during simulation", err);
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
          } catch (err) {
            console.error("Gemini call failed", err);
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
          } catch (err) {
            console.error(err);
            broadcastLog("Content Factory", "error", "Failed to contact Gemini server. Using pre-cached blog generator fallback.");
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
          } catch (err) {
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
          } catch (e) {
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
            const systemPrompt = `You are an expert n8n workflow designer.
Generate a valid, compact JSON schema representing an n8n workflow that fulfills this user request: "${description}".
Output ONLY the raw JSON block representing the nodes and connections of the workflow. Do not include markdown codeblocks (no \`\`\`json) or other text, just the raw valid JSON.`;
            
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: systemPrompt,
            });
            
            let cleanText = response.text?.trim() || "{}";
            if (cleanText.startsWith("```")) {
              cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
            }
            try {
              workflowJson = JSON.parse(cleanText);
            } catch (e) {
              console.error("Failed to parse Gemini output as JSON, creating standard fallback", e);
              workflowJson = createFallbackN8nWorkflow(description);
            }
          } catch (err) {
            console.error(err);
            workflowJson = createFallbackN8nWorkflow(description);
          }
        } else {
          workflowJson = createFallbackN8nWorkflow(description);
        }
        
        broadcastLog("n8n MCP Orchestrator", "success", "Workflow blueprint successfully synthesized and registered with n8n local instance!");
        
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

// Helper sleep function for nice staggered logs
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fallback n8n workflow creator
function createFallbackN8nWorkflow(description: string) {
  return {
    "name": "Solar Gear Kenya Generated Workflow",
    "nodes": [
      {
        "parameters": {},
        "id": "node-1",
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
        "id": "node-2",
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
        "id": "node-3",
        "name": "Store Lead",
        "type": "n8n-nodes-base.googleSheets",
        "typeVersion": 3,
        "position": [650, 300]
      },
      {
        "parameters": {
          "message": "Habari! Thank you for contacting Solar Gear Kenya regarding " + description + ". We are compiling your custom solar quote."
        },
        "id": "node-4",
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
    }
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
