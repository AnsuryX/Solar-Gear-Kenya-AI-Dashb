# 🚀 Deploying Solar Gear Kenya AI Dashboard to Vercel

This guide provides simple instructions for deploying the **Solar Gear Kenya AI Dashboard** to production platforms (such as Vercel, Netlify, or custom servers), and details how to correctly establish connections to your **n8n** instance.

---

## 1. Understanding Deployment Environments

This application supports two distinct synchronization routing options for n8n workflows:

### Option A: Direct Browser Sync (Recommended for Vercel/Netlify)
When deployed on static front-end hosting providers like **Vercel** or **Netlify**, the backend custom Express server (`server.ts`) is **not** running (leading to `404 Not Found` errors on any `/api/*` proxy routes).
* **How it works:** The dashboard automatically detects this static host scenario and routes your n8n API traffic **directly** from your browser to your self-hosted n8n instance.
* **Requirements:** You must enable CORS on your self-hosted n8n instance to authorize incoming connections from your Vercel deployment URL.

### Option B: Server API Proxy (Default in Containers)
When run inside full-stack containers (such as Google Cloud Run or local dev servers), the Express proxy server routes all API traffic on your behalf.
* **How it works:** Traffic is securely proxied server-side, hiding credentials from the browser.

---

## 2. Setting Up n8n CORS (For Vercel Deployment)

To allow the dashboard to connect directly from your browser to your self-hosted n8n instance on Vercel, configure your self-hosted n8n environment variables to permit cross-origin requests.

Set the following environment variables on your **n8n hosting environment (Docker, CapRover, or VPS)**:

```bash
# Enable CORS for public API endpoints
N8N_ENFORCE_SETTINGS_FILE_FOR_USERS=true

# Allow specific origins (replace with your actual Vercel URL, or use '*' to allow any)
N8N_CORS_ALLOWED_ORIGINS="https://solar-gear-hq.vercel.app"
```

> 💡 **Tip:** If you are testing across multiple preview URLs, you can temporarily set `N8N_CORS_ALLOWED_ORIGINS="*"` to allow immediate connectivity.

---

## 3. Deploying to Vercel in 3 Steps

### Step 1: Push Code to GitHub
Ensure all your modified files are committed and pushed to a remote GitHub repository.

### Step 2: Import into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.

### Step 3: Configure Build Settings
* **Framework Preset:** Vite (Vercel will auto-detect this).
* **Build Command:** `npm run build`
* **Output Directory:** `dist`

Click **Deploy**! Once completed, open your deployed dashboard URL.

---

## 4. Connecting and Syncing

1. Open your deployed dashboard.
2. In the **n8n Live-Sync Orchestrator** section, click **Configure Instance**.
3. Toggle the **Sync Routing Mode** to **Direct Browser Sync**.
4. Paste your **n8n Server Base URL** (e.g. `https://automate.ansurysystems.online`).
5. Paste your personal **n8n API Key** (this is saved locally and securely inside your browser's local storage).
6. Click **Test Connection & Sync**. 

Your active workflows will now load in real time, and you can push newly synthesized blueprints straight to your n8n workspace with a single click! 🎉
