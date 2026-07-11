# Solar Gear Kenya AI Operations & Cockpit Dashboard

Welcome to the **Solar Gear Kenya AI Dashboard**—a highly polished, production-ready full-stack control cockpit engineered for **Solar Gear Kenya** (`solargear.co.ke`).

This system centralizes local organic visibility, automated content creation, PR guest-blogging outreach, reputation growth (Google My Business), and dynamic n8n Model Context Protocol (MCP) automation pipelines into a high-performance web dashboard.

---

## 🎨 Visual Identity & Theme: *Sleek Interface*

The application is styled using the custom **Sleek Interface** theme—a dark, immersive workspace designed to mimic high-performance terminal cockpits and industrial control panels:
- **Obsidian Dark Palette**: Styled with a solid `#0b0e14` workspace background and deep `#0f121a` sidebar panels.
- **Obsidian Graphite Cards**: Elevated workspace components are housed in high-contrast `#151921` containers featuring double-border details and subtle drop shadows.
- **Unix Log Terminal**: Uses a specialized true-black console (`#050608`) with code-aligned syntax coloring to display active agent routines.
- **Solar Amber & Emerald Highlights**: Interactive controls, success metrics, and live stream connection states are bound to vibrant custom brand colors.

---

## 🚀 Key Modules & Capabilities

The cockpit is segmented into four distinct workspaces, accessible via the high-contrast sidebar navigator:

### 1. Unified Command Dashboard (Overview)
A high-level health center showing the performance indices of active agents:
- **Agent Load Monitor**: Displays active server thread utilization (e.g., 68% capacity load).
- **Core Operational Cards**: Displays active counters and status badges for individual agent groups.
- **Live Competitor SERP Tracker**: Visualizes search share rankings across Nairobi and Coast sub-sectors compared against top regional competitors (*SolarLux East Africa*, *Davis & Shirtliff*, and *Chloride Exide*).
- **Real-Time Log Stream (SSE)**: Streams telemetry logs directly from the backend via standard HTTP Server-Sent Events (SSE). Includes live filters for individual agent entities (SEO, Content, Link, GMB, n8n).

### 2. Autonomous Agent Pillars
Enables the user to trigger complex, LLM-orchestrated operational procedures on demand:
- **SEO Strategist**: Scrapes local Search Engine Result Pages (SERPs) and synthesizes actionable suggested landing page enhancements. Features a **GEO (Generative Engine Optimization) Citation Audit** module to guarantee Solar Gear dominates LLM summaries (Gemini, ChatGPT, Perplexity) for Kenyan clean-tech queries.
- **Content Factory**: Generates long-form SEO articles focused on East African solar economics (e.g. commercial solar ROI, grid-hybrid sizing) and automatically chunks them into ready-to-publish promotional posts for LinkedIn and X.
- **PR Outreach (Link Builder)**: Maps and analyzes regional eco-tech and construction blog domains (monitoring Domain Authority), and writes highly personal, customized guest placement pitches.
- **GMB Growth**: Analyzes incoming Google My Business reviews and drafts professional responses adhering to strict brand-voice rules.

### 3. n8n MCP Workflow Synthesizer
Rather than programming workflows manually, our model interfaces with an n8n MCP server to build pipelines on the fly:
- **Natural Language Intent Input**: Enter a prompt describing an integration (e.g., *"Sync Facebook Lead Ads to Google Sheets, classify with Gemini, and send custom Gmail quotes"*).
- **Dynamic visual Canvas**: Maps compiled nodes (Webhooks, Gemini LLM, Google Sheets, Twilio, etc.) into an interactive flow chart. Click nodes to open a structural **Node Parameters Inspector**.
- **Raw Schema Console**: View and copy compliant n8n JSON schemas for instant imports.

### 4. Architectural Operations Blueprint
A comprehensive technical proposal and guide mapping out the production-grade physical infrastructure recommended for scaling the MVP. It covers database choices, message queues, and prioritized Google Business API endpoints.

---

## 🛠️ The Technical Stack

The dashboard is built using modern, type-safe full-stack architectural components:

### Frontend (Client-Side)
- **Vite + React (TypeScript)**: Core build toolchain and component framework.
- **Tailwind CSS v4**: Utility-first CSS compiling premium border effects, dark colors, and responsive layouts.
- **Framer Motion**: Smooth entry and staggered micro-animations for terminal logs and active menus.
- **Lucide React**: Crisp SVG icons.

### Backend (Server-Side Node.js)
- **Express.js**: Low-latency web server hosting static resources and serving API endpoints.
- **Google GenAI SDK (`@google/genai`)**: Interfacing natively with server-side `gemini-3.5-flash` model engines to prevent client-side API key exposures.
- **HTTP Server-Sent Events (SSE)**: One-to-many event broadcast pipeline to stream system logs in real-time.

---

## ⚙️ Workflows & External Integrations Needed

To shift the cockpit from an interactive prototype to full production, the following API connections and external workflows are required:

| Target Integration | Scope | Priority | Purpose |
| :--- | :--- | :--- | :--- |
| **Google Business Profile API (v4.0)** | `mybusiness.googleapis.com` | **P1 (Critical)** | Real-time review discovery triggers and automated response publication. |
| **n8n REST API (v1)** | `/api/v1/workflows` | **P1 (Critical)** | Standard programmatic interface for receiving and executing JSON schemas from the MCP compiler. |
| **Google Sheets API** | `/v4/spreadsheets` | **P2 (High)** | Securely appending leads generated from Facebook Lead Ads and n8n capture webhooks. |
| **Twilio SMS / WhatsApp API** | `/2010-04-01` | **P2 (High)** | Dispatching automated notifications to operations team or welcome messages to leads. |
| **LinkedIn & X Platform APIs** | Custom Post Graph | **P3 (Normal)** | Automating post scheduling queues compiled by the Content Factory. |

---

## 🏃‍♂️ Getting Started (Local Development)

Follow these instructions to boot the dashboard in your local container or development environment:

### 1. Configure Secrets & Keys
Create a `.env` file at the root of the project (using `.env.example` as a template):
```env
# Gemini API Access
GEMINI_API_KEY=your_google_ai_studio_api_key_here

# Mode
NODE_ENV=development
```

### 2. Install Dependencies
Run the package installation command to pull Vite, Tailwind, Express, and Google GenAI SDK:
```bash
npm install
```

### 3. Launch Development Server
Boot the Express micro-server and mount Vite's hot development middleware:
```bash
npm run dev
```
Once booted, the app will be live at: `http://localhost:3000`

### 4. Build for Production Deployment
Bundle both static frontend assets (under `/dist`) and compile the backend TypeScript server into a self-contained CommonJS target (`/dist/server.cjs`):
```bash
npm run build
```
Start the production container:
```bash
npm run start
```
