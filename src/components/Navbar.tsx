import React, { useState } from "react";
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
  Palette,
  Check,
  Sparkles,
} from "lucide-react";
import { Project, Episode, ThemeKey, THEME_CONFIGS } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (proj: Project) => void;
  currentEpisode: Episode | null;
  onOpenCreateModal: () => void;
  credits: number;
  currentTheme: ThemeKey;
  onSelectTheme: (theme: ThemeKey) => void;
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
  currentTheme,
  onSelectTheme,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const themeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.amber_daylight;

  const tabs = [
    { id: "studio", label: "项目沙盒", icon: Film },
    { id: "publishing", label: "全网分发", icon: Share2 },
    { id: "marketplace", label: "撮合大厅", icon: Briefcase },
    { id: "compliance", label: "资质合规", icon: ShieldCheck },
    { id: "assets", label: "爆款资产", icon: Flame },
    { id: "compute", label: "智算引擎", icon: Cpu },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs transition-colors">
      {/* Top Global Scope Breadcrumb Bar (超清爽明亮微灰条) */}
      <div className="px-6 py-2 bg-slate-50/80 border-b border-slate-200/60 text-xs flex items-center justify-between text-slate-600 flex-wrap gap-2">
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
          <span className="font-bold text-slate-500 flex items-center gap-1.5 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            项目沙盒隔离:
          </span>
          <button
            onClick={() => setActiveTab("studio")}
            className="hover:text-slate-900 font-semibold transition-colors flex items-center gap-1 text-slate-700 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            项目大厅
          </button>

          {currentProject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <div className="relative group">
                <select
                  value={currentProject.id}
                  onChange={(e) => {
                    const found = projects.find((p) => p.id === e.target.value);
                    if (found) setCurrentProject(found);
                  }}
                  className="bg-white text-slate-800 font-bold px-2.5 py-0.5 rounded-md border border-slate-300 focus:outline-none focus:border-slate-800 cursor-pointer hover:bg-slate-50 transition-all text-xs shadow-2xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-800">
                      🎬 {p.title} ({p.aspect_ratio})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {currentProject && currentEpisode && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-bold bg-white px-2.5 py-0.5 rounded-md border border-slate-300 text-xs shadow-2xs">
                当前: 第 {currentEpisode.episode_number.toString().padStart(2, "0")} 集 - {currentEpisode.title}
              </span>
            </>
          )}
        </div>

        {/* Right side Theme Switcher, Stats & Credit Pill */}
        <div className="flex items-center space-x-2.5 relative">
          {/* 🎨 明亮风格选择器下拉 */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
              title="切换明亮美学风格"
            >
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>风格: {themeConfig.badge}</span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 space-y-1.5 animate-fadeIn">
                <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    明亮现代美学风格
                  </span>
                  <span className="text-[10px] text-slate-400">实时生效</span>
                </div>

                {Object.values(THEME_CONFIGS).map((t) => {
                  const isSelected = currentTheme === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => {
                        onSelectTheme(t.key);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-slate-100 border border-slate-300 font-bold"
                          : "hover:bg-slate-50 border border-transparent font-medium"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${t.accentGradient} shadow-xs`} />
                        <div>
                          <div className="text-xs text-slate-900 font-bold">{t.name}</div>
                          <div className="text-[10px] text-slate-500">{t.tag}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1.5 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-orange-800 text-xs font-bold font-mono shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>智算: {credits.toLocaleString()} PTS</span>
          </div>

          <button
            onClick={onOpenCreateModal}
            className={`flex items-center space-x-1.5 ${themeConfig.buttonBg} ${themeConfig.buttonHover} font-bold px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建漫剧</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation Tabs (极简明亮导航) */}
      <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${themeConfig.accentGradient} flex items-center justify-center text-white font-extrabold text-base shadow-sm`}>
              M
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
                漫剧工场
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                  v2.5
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Pill Nav Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? themeConfig.primaryColor : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
