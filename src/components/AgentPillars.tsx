import React, { useState } from 'react';
import { 
  BlogAsset, 
  GmbReviewDraft 
} from '../types';
import { 
  Globe, 
  BookOpen, 
  Mail, 
  MapPin, 
  Compass, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  PenTool, 
  Users, 
  MessageSquare,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface AgentPillarsProps {
  triggerAgent: (agentId: string, action: string, payload?: any) => void;
  latestBlog: BlogAsset | null;
  latestGmbResponse: GmbReviewDraft | null;
}

export default function AgentPillars({ triggerAgent, latestBlog, latestGmbResponse }: AgentPillarsProps) {
  const [activePillar, setActivePillar] = useState<'seo' | 'content' | 'outreach' | 'gmb'>('seo');
  const [blogTopic, setBlogTopic] = useState<string>("Cost-Benefit Analysis of Commercial Solar Panels in Mombasa");
  const [customReview, setCustomReview] = useState<string>("Great solar company. The team installed a grid-tied inverter on our retail outlet in Nairobi. Very professional team!");
  const [customReviewer, setCustomReviewer] = useState<string>("Sarah Wanjiku");
  
  const [copiedState, setCopiedState] = useState<string | null>(null);

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(id);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const pillars = [
    { id: 'seo' as const, name: 'SEO Strategist', icon: Globe, tagline: 'Competitor tracker & GEO citation booster' },
    { id: 'content' as const, name: 'Content Factory', icon: BookOpen, tagline: 'AI blog writer & multi-channel scheduler' },
    { id: 'outreach' as const, name: 'PR & Link Builder', icon: Mail, tagline: 'Eco-blogger discovery & pitch sequence builder' },
    { id: 'gmb' as const, name: 'GMB Growth', icon: MapPin, tagline: 'Local Map Pack rank booster & GMB responder' },
  ];

  return (
    <div className="space-y-6" id="agent-pillars-container">
      {/* Sub-tabs for the 4 pillars */}
      <div className="flex overflow-x-auto border-b border-slate-800 pb-px gap-1">
        {pillars.map(pillar => {
          const Icon = pillar.icon;
          const isActive = activePillar === pillar.id;
          return (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(pillar.id)}
              className={`flex items-center gap-2.5 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-solar-500 text-solar-500 bg-solar-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
              id={`pillar-tab-${pillar.id}`}
            >
              <Icon className="h-4 w-4" />
              {pillar.name}
            </button>
          );
        })}
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="pillar-workspace-grid">
        
        {/* Core Controls & Info */}
        <div className="lg:col-span-1 space-y-5 flex flex-col justify-between" id="pillar-left-column">
          <div className="bg-sleek-card p-5 rounded-xl border border-slate-800 space-y-4">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-solar-500 tracking-wider">
              <Sparkles className="h-3 w-3 animate-spin" /> Autonomous Agent Engine
            </span>
            <h3 className="text-lg font-display font-bold text-slate-200">
              {pillars.find(p => p.id === activePillar)?.name}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {pillars.find(p => p.id === activePillar)?.tagline}
            </p>

            {/* Pillar specific bullet logs */}
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div className="text-[11px] font-semibold text-slate-300">Core Agent Directives:</div>
              {activePillar === 'seo' && (
                <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc leading-relaxed">
                  <li>Hourly monitoring of local solar competitor SERP changes in Kenya.</li>
                  <li>Real-time keyword optimization analysis for landing pages.</li>
                  <li>GEO (Generative Engine Optimization) schema injection so ChatGPT & Gemini cite Solar Gear first.</li>
                </ul>
              )}
              {activePillar === 'content' && (
                <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc leading-relaxed">
                  <li>Automatic SEO blog production targeting long-form search intent.</li>
                  <li>Instant translation/customization to Kenyan local economic contexts.</li>
                  <li>Automatic social micro-posts (X, LinkedIn) creation with scheduler metadata.</li>
                </ul>
              )}
              {activePillar === 'outreach' && (
                <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc leading-relaxed">
                  <li>Scrapes and filters regional sustainable tech, building, and real estate bloggers.</li>
                  <li>Personalizes outreach drafts using blogger's historic content via LLM.</li>
                  <li>Monitors domain authority and manages backlink status reporting.</li>
                </ul>
              )}
              {activePillar === 'gmb' && (
                <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc leading-relaxed">
                  <li>Instant GMB review listening with automated high-sentiment responder.</li>
                  <li>Auto-generates weekly Map Pack updates from the solar product inventory catalog.</li>
                  <li>Optimizes posts targeting local queries ("best solar installer near me").</li>
                </ul>
              )}
            </div>
          </div>

          {/* Quick Action Trigger Panel */}
          <div className="p-5 bg-sleek-terminal rounded-xl border border-slate-800 space-y-4">
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Execute Operations</div>
            
            {activePillar === 'seo' && (
              <div className="space-y-2.5">
                <button
                  onClick={() => triggerAgent('seo-strategist', 'daily-monitor')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-sleek-card hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs border border-slate-800 transition text-left"
                  id="seo-monitor-btn"
                >
                  <span className="font-semibold">Run Competitors SERP Monitor</span>
                  <ChevronRight className="h-4 w-4 text-solar-500" />
                </button>
                <button
                  onClick={() => triggerAgent('seo-strategist', 'geo-audit')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-sleek-card hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs border border-slate-800 transition text-left"
                  id="seo-geo-btn"
                >
                  <span className="font-semibold">Execute GEO Generative Audit</span>
                  <ChevronRight className="h-4 w-4 text-solar-500" />
                </button>
              </div>
            )}

            {activePillar === 'content' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Target Blog Topic</label>
                  <input 
                    type="text" 
                    value={blogTopic}
                    onChange={(e) => setBlogTopic(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sleek-card rounded border border-slate-800 text-slate-200 focus:outline-none focus:border-solar-500"
                    placeholder="Enter blog topic..."
                    id="blog-topic-input"
                  />
                </div>
                <button
                  onClick={() => triggerAgent('content-factory', 'generate-blog', { topic: blogTopic })}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-solar-500 hover:bg-solar-600 text-white font-bold text-xs shadow-md shadow-solar-500/10 transition"
                  id="content-generate-btn"
                >
                  <PenTool className="h-4 w-4" /> Synthesize Blog Article
                </button>
              </div>
            )}

            {activePillar === 'outreach' && (
              <div className="space-y-2.5">
                <button
                  onClick={() => triggerAgent('link-builder', 'discover-bloggers')}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-solar-500 hover:bg-solar-600 text-white font-bold text-xs shadow-md shadow-solar-500/10 transition"
                  id="outreach-trigger-btn"
                >
                  <Users className="h-4 w-4" /> Find Eco-Bloggers & Draft Emails
                </button>
              </div>
            )}

            {activePillar === 'gmb' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Mock GMB Reviewer</label>
                  <input 
                    type="text" 
                    value={customReviewer}
                    onChange={(e) => setCustomReviewer(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sleek-card rounded border border-slate-800 text-slate-200 focus:outline-none focus:border-solar-500 mb-2"
                    placeholder="Reviewer Name"
                    id="gmb-reviewer-input"
                  />
                  <label className="text-[10px] uppercase font-bold text-slate-500">GMB Review Content</label>
                  <textarea 
                    value={customReview}
                    onChange={(e) => setCustomReview(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sleek-card rounded border border-slate-800 text-slate-200 focus:outline-none focus:border-solar-500 h-20 resize-none"
                    placeholder="Google review text..."
                    id="gmb-review-textarea"
                  />
                </div>
                <button
                  onClick={() => triggerAgent('gmb-growth', 'review-respond', { reviewer: customReviewer, reviewText: customReview })}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-solar-500 hover:bg-solar-600 text-white font-bold text-xs shadow-md shadow-solar-500/10 transition"
                  id="gmb-generate-btn"
                >
                  <MessageSquare className="h-4 w-4" /> Synthesize Brand Reply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Output Visualizer (Rich Cards showing generated copy on demand) */}
        <div className="lg:col-span-2 flex flex-col h-full justify-between" id="pillar-right-column">
          <div className="bg-sleek-terminal rounded-xl border border-slate-800 p-6 flex-1 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-solar-500" /> Operational Output Viewer
              </span>
              <span className="text-[10px] text-slate-500 bg-sleek-card px-2 py-0.5 rounded border border-slate-800 font-mono">
                Updated in real-time
              </span>
            </div>

            {/* Dynamic content rendering based on active pillar and latest actions */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto max-h-[450px] space-y-4">
              {activePillar === 'seo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-sleek-card rounded-lg border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-solar-500">SEO Competitor Health Analysis</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Below are real-time Suggested Landing Page Optimizations generated by auditing top Kenyan competitor rankings:
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start p-2 bg-sleek-terminal rounded border border-slate-800 text-xs">
                        <span className="text-slate-400">Target Keyword: <code className="text-solar-500 font-bold font-mono">solar water heater price kenya</code></span>
                        <span className="text-emerald-500 font-mono font-bold">SEO Suggestion</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-2 border-l border-solar-500 leading-relaxed">
                        Davis & Shirtliff rank #1 using structured catalog pricing tables. Solar Gear can surpass them by introducing an interactive "Solar ROI & Mombasa/Nairobi Sizing Calculator" module on the main landing page to increase duration of visitor sessions.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-sleek-card rounded-lg border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-solar-500">GEO (Generative Engine Optimization) Citation Playbook</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ensuring Solar Gear Kenya dominates generative engine summaries (ChatGPT, Gemini, Perplexity) for East African clean tech searches:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc leading-relaxed">
                      <li><strong className="text-slate-300">Brand Citation Rule:</strong> Embed microdata JSON-LD tags detailing specific localized warranty and solar battery setups to allow LLM web crawlers to categorize Solar Gear Kenya accurately.</li>
                      <li><strong className="text-slate-300">Third-party Validation:</strong> Acquire backlinks on regional tech blogs like Techweez or EcoBiz EastAfrica explicitly associating "Solar Gear Kenya" with "commercial solar in Nairobi".</li>
                    </ul>
                  </div>
                </div>
              )}

              {activePillar === 'content' && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  {latestBlog ? (
                    <div className="space-y-4">
                      {/* Blog post copybox */}
                      <div className="space-y-2 p-4 bg-sleek-card rounded-lg border border-slate-800 relative">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-mono font-bold text-solar-500">GENERATED BLOG POST EXCERPT</span>
                          <button 
                            onClick={() => triggerCopy(latestBlog.content, 'blog-text')}
                            className="flex items-center gap-1 text-[10px] bg-sleek-terminal hover:bg-slate-850 text-slate-300 py-1 px-2 rounded transition border border-slate-800"
                          >
                            {copiedState === 'blog-text' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            Copy Excerpt
                          </button>
                        </div>
                        <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pt-2">
                          {latestBlog.content}
                        </div>
                      </div>

                      {/* Social posts copybox */}
                      <div className="space-y-2 p-4 bg-sleek-card rounded-lg border border-slate-800">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-mono font-bold text-solar-500">AUTO-CHUNKER SOCIAL PROMO</span>
                          <button 
                            onClick={() => triggerCopy(latestBlog.social, 'social-text')}
                            className="flex items-center gap-1 text-[10px] bg-sleek-terminal hover:bg-slate-850 text-slate-300 py-1 px-2 rounded transition border border-slate-800"
                          >
                            {copiedState === 'social-text' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            Copy Posts
                          </button>
                        </div>
                        <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pt-2">
                          {latestBlog.social}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center py-12">
                      <BookOpen className="h-12 w-12 mb-3 text-slate-700/60" />
                      <p className="text-xs italic">No blog article synthesized yet.</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Type a solar topic in the left column and click "Synthesize" to run the live agent on Gemini!</p>
                    </div>
                  )}
                </div>
              )}

              {activePillar === 'outreach' && (
                <div className="space-y-4">
                  <div className="p-4 bg-sleek-card rounded-lg border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white font-mono tracking-wider text-solar-500">Regional Blog Discovery</h4>
                    <p className="text-[11px] text-slate-400">
                      The automated discovery crawler has cataloged target East African blog resources:
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div className="p-2 bg-sleek-terminal rounded border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-300">EastAfricaEco.org</span>
                        <span className="text-emerald-500 font-mono font-bold">DA 42</span>
                      </div>
                      <div className="p-2 bg-sleek-terminal rounded border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-300">NairobiBuildHub.com</span>
                        <span className="text-emerald-500 font-mono font-bold">DA 35</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-sleek-card rounded-lg border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white font-mono tracking-wider text-solar-500">Backlink Tracking Metrics</h4>
                    <p className="text-[11px] text-slate-400">
                      Automated backlink checker tracking active guest placement campaigns for <code className="text-solar-500">solargear.co.ke</code>:
                    </p>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between p-1.5 bg-sleek-terminal rounded border border-slate-800">
                        <span className="text-slate-300 font-mono">/backlink-audit/eco-tech-kenya</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-1">ACTIVE (Do-Follow) <Check className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePillar === 'gmb' && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  {latestGmbResponse ? (
                    <div className="space-y-4">
                      {/* Incoming review details */}
                      <div className="p-4 bg-sleek-card rounded-lg border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-solar-500/10 text-solar-500 flex items-center justify-center font-bold text-[10px]">
                            {latestGmbResponse.reviewer[0]}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-200">{latestGmbResponse.reviewer}</span>
                            <span className="text-[9px] text-amber-500 ml-2">★★★★★ (5 Stars)</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 italic pl-8 leading-relaxed">
                          "{latestGmbResponse.reviewText}"
                        </p>
                      </div>

                      {/* Generated reply draft */}
                      <div className="p-4 bg-sleek-card rounded-lg border border-slate-800 relative">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-mono font-bold text-solar-500 uppercase">AUTO-GENERATED BRAND RESPONSE</span>
                          <button 
                            onClick={() => triggerCopy(latestGmbResponse.responseDraft, 'gmb-draft-text')}
                            className="flex items-center gap-1 text-[10px] bg-sleek-terminal hover:bg-slate-850 text-slate-300 py-1 px-2 rounded transition border border-slate-800"
                          >
                            {copiedState === 'gmb-draft-text' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            Copy Response
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap pt-3">
                          {latestGmbResponse.responseDraft}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center py-12">
                      <MessageSquare className="h-12 w-12 mb-3 text-slate-700/60" />
                      <p className="text-xs italic">No review responses drafted yet.</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Type or select a review in the left column and click "Synthesize" to write a brand-voiced reply using Gemini!</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
