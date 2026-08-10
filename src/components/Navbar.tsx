import React from "react";
import {
  Film,
  Share2,
  Briefcase,
  ShieldCheck,
  Flame,
  Cpu,
  Plus,
  FolderOpen,
  Zap,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Project, Episode } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (proj: Project) => void;
  currentEpisode: Episode | null;
  onOpenCreateModal: () => void;
  credits: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  projects,
  currentProject,
  setCurrentProject,
  currentEpisode,
  onOpenCreateModal,
  credits,
}) => {
  const tabs = [
    { id: "studio", label: "项目沙盒", icon: Film },
    { id: "publishing", label: "全网分发", icon: Share2 },
    { id: "marketplace", label: "撮合大厅", icon: Briefcase },
    { id: "compliance", label: "资质合规", icon: ShieldCheck },
    { id: "assets", label: "爆款资产", icon: Flame },
    { id: "compute", label: "智算引擎", icon: Cpu },
  ];

  return (
    <header className="bg-[#111114] border-b border-white/10 text-slate-200 sticky top-0 z-50 shadow-2xl">
      {/* Top Global Scope Breadcrumb Bar */}
      <div className="px-6 py-2 bg-[#0A0A0C] border-b border-white/5 text-xs flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            项目沙盒隔离:
          </span>
          <button
            onClick={() => setActiveTab("studio")}
            className="hover:text-white font-medium transition-colors flex items-center gap-1 text-slate-300"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            项目大厅
          </button>

          {currentProject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <div className="relative group">
                <select
                  value={currentProject.id}
                  onChange={(e) => {
                    const found = projects.find((p) => p.id === e.target.value);
                    if (found) setCurrentProject(found);
                  }}
                  className="bg-[#16161A] text-orange-400 font-medium px-2.5 py-0.5 rounded border border-white/10 focus:outline-none focus:border-orange-500 cursor-pointer hover:bg-white/5 transition-all text-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111114] text-slate-200">
                      🎬 {p.title} ({p.aspect_ratio})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {currentProject && currentEpisode && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-orange-400 font-medium bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20 text-xs">
                当前: 第 {currentEpisode.episode_number.toString().padStart(2, "0")} 集 - {currentEpisode.title}
              </span>
            </>
          )}
        </div>

        {/* Right side stats & credit pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-orange-400 text-xs font-semibold font-mono">
            <Zap className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            <span>智算点数: {credits.toLocaleString()} PTS</span>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-3 py-1 rounded-full text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建漫剧项目</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation Tabs */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-500/20">
              M
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white leading-tight flex items-center gap-2">
                漫剧工场
                <span className="text-xs font-normal opacity-70 text-orange-400 font-mono">
                  Studio v2.5
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Pill Nav Tabs */}
        <nav className="flex items-center gap-1 text-sm bg-black/40 p-1.5 rounded-full border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white font-semibold border border-white/10 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
