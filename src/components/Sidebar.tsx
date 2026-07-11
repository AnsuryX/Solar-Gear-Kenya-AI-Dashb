import React from 'react';
import { 
  Sun, 
  LayoutDashboard, 
  Cpu, 
  Workflow, 
  FileText, 
  Radio, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isConnected: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, isConnected }: SidebarProps) {
  const menuItems = [
    { id: 'overview' as ActiveTab, name: 'Operations Center', icon: LayoutDashboard, desc: 'Live execution cockpit & stats' },
    { id: 'agents' as ActiveTab, name: 'Multi-Agent Core', icon: Cpu, desc: 'Pillars of solar automation' },
    { id: 'n8n' as ActiveTab, name: 'n8n MCP Designer', icon: Workflow, desc: 'Dynamic workflow synthesizer' },
    { id: 'blueprint' as ActiveTab, name: 'Architectural Blueprint', icon: FileText, desc: 'Integration specifications' },
  ];

  return (
    <aside className="w-64 bg-sleek-sidebar border-r border-slate-800 flex flex-col h-full shrink-0" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-solar-500 flex items-center justify-center text-white shadow-lg shadow-solar-500/20 shrink-0">
          <Sun className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white tracking-tight leading-none text-base">
            SOLAR GEAR
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1 uppercase">
            OPERATIONS HQ
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${
                isActive 
                  ? 'bg-solar-500/10 border border-solar-500/20 text-white' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-sleek-card border border-transparent'
              }`}
              id={`nav-tab-${item.id}`}
            >
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 transition-colors ${
                isActive ? 'text-solar-500' : 'text-slate-500 group-hover:text-slate-400'
              }`} />
              <div>
                <div className="font-semibold text-sm leading-none">{item.name}</div>
                <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Connection Indicator Footer */}
      <div className="p-4 border-t border-slate-800 bg-sleek-sidebar space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-sleek-card border border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-solar-500 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-medium">SSE Log Stream</span>
          </div>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-[9px] font-bold text-red-500 uppercase font-mono">Offline</span>
              </>
            )}
          </div>
        </div>
        
        <div className="text-[9px] text-slate-500 text-center leading-relaxed">
          Operational Control Center v1.0.0 <br />
          Targeting: <a href="https://solargear.co.ke/" target="_blank" rel="noreferrer" className="text-solar-500/90 hover:underline">solargear.co.ke</a>
        </div>
      </div>
    </aside>
  );
}
