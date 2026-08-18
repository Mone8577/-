import React, { useState } from "react";
import {
  Sparkles,
  Link,
  Upload,
  Bot,
  Check,
  ArrowRight,
  Loader2,
  Lock,
  Layers,
  CheckCircle2,
  FileCode2,
  Globe2,
  Plus,
  Film,
  Clock,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Zap,
} from "lucide-react";
import { Project, Episode } from "../../types";

interface ScriptImporterProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (proj: Project, targetStage?: "central_control" | "episode_studio") => void;
  onOpenCreateProjectModal: () => void;
  onStartScriptGeneration: (payload: {
    genre: string;
    prompt: string;
    targetEpisodes: number;
    rawText?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  generationStepText?: string;
}

export const ScriptImporter: React.FC<ScriptImporterProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onOpenCreateProjectModal,
  onStartScriptGeneration,
  isGenerating,
  generationStepText,
}) => {
  const [channel, setChannel] = useState<"ai" | "text" | "url">("ai");

  // AI Incubator state
  const [genre, setGenre] = useState("玄幻重生");
  const [aiPrompt, setAiPrompt] = useState("仙尊重生到高中时期，拯救家族破产并痛击豪门仇敌，开局融合九幽帝火");
  const [targetEpisodes, setTargetEpisodes] = useState(3);

  // Text Paste state
  const [rawText, setRawText] = useState("");

  // URL state
  const [webUrl, setWebUrl] = useState("https://book.qidian.com/info/1028392102/");

  // Preset quick fill templates
  const presets = [
    {
      name: "🔥 仙尊都市重生",
      genre: "玄幻重生",
      prompt: "一代仙尊遭背叛陨落，重生回到十八岁高三家族破产前夕，随手医治首富千金，横扫四大家族！",
    },
    {
      name: "⚡ 战神龙王归来",
      genre: "都市战神",
      prompt: "北境战神隐姓埋名入赘三年，遭百般欺辱，女儿病危一声令下，十万退役将士奔赴江城！",
    },
    {
      name: "👑 豪门真假少爷",
      genre: "甜宠豪门",
      prompt: "被养父母嫌弃的穷小子实为全球首富唯一继承人，手撕绿茶假少爷，全家跪求原谅！",
    },
    {
      name: "👻 规则怪谈降临",
      genre: "悬疑惊悚",
      prompt: "规则怪谈侵蚀现实，主角觉醒看破隐藏规则的深红之眼，在诡异深夜便利店绝地通关！",
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setGenre(p.genre);
    setAiPrompt(p.prompt);
    setChannel("ai");
  };

  const handleSubmit = async () => {
    if (channel === "text" && !rawText.trim()) return;
    await onStartScriptGeneration({
      genre,
      prompt: aiPrompt,
      targetEpisodes,
      rawText: channel === "text" ? rawText : undefined,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Breadcrumb Hero */}
      <div className="bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="bg-orange-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                STAGE 01
              </span>
              <span className="text-xs text-orange-400 font-semibold tracking-wide">
                漫剧创作大厅 · 剧本归一化与立项
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              从灵感到剧本，开启原生多模态漫剧流水线
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              输入新题材或选择已有项目，通过 Gemini 3.6 预处理引擎将长文本归一化为标准 AST 分集大纲与角色原型，一键生成后即可直通【阶段二：中央控制台】进行资产确权！
            </p>
          </div>

          <button
            onClick={onOpenCreateProjectModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-bold px-5 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-orange-500/25 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>新建漫剧工程</span>
          </button>
        </div>
      </div>

      {/* Module 1 (Now Placed on Top): 3-Channel Script Importer & AI Incubator */}
      <div
        id="script-input-workbench"
        className="bg-[#16161A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
      >
        {/* Header & Channel Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h2 className="text-base font-bold text-white">
                新剧本输入通道 (统一归一化为短剧 AST)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              支持 AI 灵感孵化、文本粘贴或 URL 抓取，解析后将自动立项并跳转至【阶段二：中央控制台】
            </p>
          </div>

          {/* Switcher Buttons */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 space-x-1">
            <button
              onClick={() => setChannel("ai")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                channel === "ai"
                  ? "bg-white/10 text-white font-semibold border border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${channel === "ai" ? "text-orange-400" : ""}`} />
              <span>AI 原创孵化</span>
            </button>
            <button
              onClick={() => setChannel("text")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                channel === "text"
                  ? "bg-white/10 text-white font-semibold border border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className={`w-3.5 h-3.5 ${channel === "text" ? "text-orange-400" : ""}`} />
              <span>文本/文件导入</span>
            </button>
            <button
              onClick={() => setChannel("url")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                channel === "url"
                  ? "bg-white/10 text-white font-semibold border border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Link className={`w-3.5 h-3.5 ${channel === "url" ? "text-orange-400" : ""}`} />
              <span>网文 URL 抓取</span>
            </button>
          </div>
        </div>

        {/* Quick Presets for Instant One-Click Generation */}
        <div className="space-y-2 bg-[#0C0C0F] p-3.5 rounded-2xl border border-white/5">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>爆款短剧灵感预设（点击直接填入并体验一键生成）：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="bg-white/5 hover:bg-orange-500/15 hover:border-orange-500/30 border border-white/10 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channel Form Body */}
        <div>
          {/* Channel 1: AI Prompt Generator */}
          {channel === "ai" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    题材与世界观基准
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#0C0C0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="玄幻重生">玄幻重生 / 仙尊无敌 / 3D国风</option>
                    <option value="都市战神">都市战神 / 龙王赘婿 / 写实韩漫</option>
                    <option value="甜宠豪门">豪门甜宠 / 真假少爷 / 日系二次元</option>
                    <option value="悬疑惊悚">悬疑推理 / 规则怪谈 / 赛博厚涂</option>
                    <option value="科幻赛博">赛博朋克 / 机械降神 / 虚幻引擎5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    规划短剧集数 (1~3分钟/集)
                  </label>
                  <select
                    value={targetEpisodes}
                    onChange={(e) => setTargetEpisodes(Number(e.target.value))}
                    className="w-full bg-[#0C0C0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value={1}>1 集 (极速试看高潮篇)</option>
                    <option value={3}>3 集 (标准黄金开局三连击)</option>
                    <option value={5}>5 集 (完整起承转合单元剧)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    灵感关键词 / 剧情核心爽点
                  </label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="输入主角设定、金手指能力与核心冲突..."
                    className="w-full bg-[#0C0C0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Channel 2: Raw Text Paste */}
          {channel === "text" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                小说正文 / 剧本大纲粘贴
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="在此直接粘贴长篇小说片段、剧本大纲或对白脚本... 系统将智能进行对白提取与场次切分。"
                className="w-full bg-[#0C0C0F] border border-white/10 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 leading-relaxed"
              />
            </div>
          )}

          {/* Channel 3: URL Scraper */}
          {channel === "url" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                正版小说/爆款剧本 URL 链接
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="输入正版授权小说章节链接..."
                  className="flex-1 bg-[#0C0C0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Big Action Footer Button (Primary Entry to Stage 2) */}
        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              点击后将由 Gemini 3.6 抽取世界观、角色三视图原型与黄金卡点目录，随后<strong>整页跳转至阶段二</strong>
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isGenerating}
            className="w-full md:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:from-orange-400 hover:to-purple-500 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-orange-500/25 cursor-pointer disabled:opacity-50 transform hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{generationStepText || "Gemini 3.6 剧本解析与立项中..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>🚀 一键生成漫剧剧本 ➔ 进入阶段二中央确权</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Module 2 (Now Placed Below): Existing Manga Projects Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              已有漫剧项目库 ({projects.length})
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              点击卡片可按状态智能跳转对应阶段
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((proj) => {
            const isCurrent = currentProject?.id === proj.id;
            const isLocked = proj.is_assets_locked;
            return (
              <div
                key={proj.id}
                onClick={() =>
                  onSelectProject(
                    proj,
                    isLocked ? "episode_studio" : "central_control"
                  )
                }
                className={`group bg-[#16161A] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between ${
                  isCurrent
                    ? "border-orange-500 ring-2 ring-orange-500/20 shadow-orange-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Cover & Badges */}
                <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                  <img
                    src={
                      proj.cover_url ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"
                    }
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 backdrop-blur-md ${
                        isLocked
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          已确权 · 制作中
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          草稿 · 待锁资产
                        </>
                      )}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-mono bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10 text-orange-400">
                      {proj.aspect_ratio || "9:16"}
                    </span>
                    <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
                      {proj.episodes?.length || 0} 集
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {proj.description || "Seedance 2.5 原生多模态漫剧工程"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{proj.characters?.length || 0} 位解耦角色</span>
                    <span className="text-orange-400 flex items-center gap-0.5 font-semibold group-hover:translate-x-0.5 transition-transform">
                      {isLocked ? "进入阶段三制作" : "进入阶段二确权"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
