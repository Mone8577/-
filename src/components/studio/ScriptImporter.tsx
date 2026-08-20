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
  Bookmark,
  FolderKanban,
  Wand2,
  Palette,
  CheckCircle,
} from "lucide-react";
import { Project, Episode, STYLE_PRESET_CARDS, StylePresetCard } from "../../types";

interface ScriptImporterProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (proj: Project, targetStage?: "central_control" | "episode_studio") => void;
  onOpenCreateProjectModal: () => void;
  onStartScriptGeneration: (payload: {
    genre: string;
    prompt: string;
    targetEpisodes: number;
    stylePresetId: string;
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

  // Style LoRA Preset selection (立项即绑定视觉基因，防 OOC)
  const [selectedStyleId, setSelectedStyleId] = useState<string>("3d_xianxia");

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
      styleId: "3d_xianxia",
      prompt: "一代仙尊遭背叛陨落，重生回到十八岁高三家族破产前夕，随手医治首富千金，横扫四大家族！",
    },
    {
      name: "⚡ 战神龙王归来",
      genre: "都市战神",
      styleId: "comic_noir",
      prompt: "北境战神隐姓埋名入赘三年，遭百般欺辱，女儿病危一声令下，十万退役将士奔赴江城！",
    },
    {
      name: "👑 豪门真假少爷",
      genre: "甜宠豪门",
      styleId: "webtoon_deluxe",
      prompt: "被养父母嫌弃的穷小子实为全球首富唯一继承人，手撕绿茶假少爷，全家跪求原谅！",
    },
    {
      name: "👻 规则怪谈降临",
      genre: "悬疑惊悚",
      styleId: "cyber_neon",
      prompt: "规则怪谈侵蚀现实，主角觉醒看破隐藏规则的深红之眼，在诡异深夜便利店绝地通关！",
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setGenre(p.genre);
    setAiPrompt(p.prompt);
    setSelectedStyleId(p.styleId);
    setChannel("ai");
  };

  const handleSubmit = async () => {
    if (channel === "text" && !rawText.trim()) return;
    await onStartScriptGeneration({
      genre,
      prompt: aiPrompt,
      targetEpisodes,
      stylePresetId: selectedStyleId,
      rawText: channel === "text" ? rawText : undefined,
    });
  };

  const currentStyleCard = STYLE_PRESET_CARDS.find((s) => s.id === selectedStyleId) || STYLE_PRESET_CARDS[0];

  return (
    <div className="flex-1 w-full bg-[#F8FAFC] flex flex-col font-sans select-none min-h-[calc(100vh-56px)] animate-fadeIn">
      {/* 1. TOP HEADER BANNER (全屏通栏明亮顶栏) */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center font-extrabold shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                STAGE 01
              </span>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                漫剧项目大厅 · 创作源头与画风立项
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              立项即锁死视觉风格 LoRA，杜绝 OOC 偏离，一键生成阶段二中央确权人景资产
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenCreateProjectModal}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold px-4 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-500" />
            <span>空白创建新漫剧</span>
          </button>
        </div>
      </div>

      {/* 2. STACKED TOP / BOTTOM WORKSPACE (上下模块垂直排版) */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* ========================================================================================= */}
        {/* TOP MODULE: SCRIPT INPUT & INCUBATION WORKBENCH (上方模块：剧本与画风输入通道)              */}
        {/* ========================================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Module Header & Channel Switcher */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <span>剧本输入与 AI 灵感孵化工坊</span>
              </h3>
              <p className="text-xs text-slate-500">选择输入通道并选定画风 LoRA，自动提炼同风格人设与分集黄金卡点</p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              {[
                { id: "ai", label: "AI 灵感孵化", icon: Bot },
                { id: "text", label: "文本直接粘贴", icon: Upload },
                { id: "url", label: "网络小说链接采集", icon: Globe2 },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = channel === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setChannel(t.id as any)}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content by Channel */}
          {channel === "ai" && (
            <div className="space-y-4">
              {/* 3-Column Parallel Configuration: Genre, Style LoRA, Episodes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">漫剧题材分类</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-black"
                  >
                    <option value="玄幻重生">🔥 玄幻修真 / 仙尊归来</option>
                    <option value="都市战神">⚡ 都市战神 / 隐形首富</option>
                    <option value="甜宠豪门">👑 豪门甜宠 / 真假千金</option>
                    <option value="悬疑惊悚">👻 悬疑推理 / 规则怪谈</option>
                    <option value="末日废土">☣️ 末日求生 / 异能觉醒</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">视觉画风 / LoRA 绑定</label>
                    <span className="text-[10px] text-purple-600 font-mono font-bold">
                      {currentStyleCard.lora_id.slice(0, 14)}...
                    </span>
                  </div>
                  <select
                    value={selectedStyleId}
                    onChange={(e) => setSelectedStyleId(e.target.value)}
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs text-purple-900 font-semibold focus:outline-none focus:border-purple-600"
                  >
                    {STYLE_PRESET_CARDS.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name} · {style.tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">自动切分集数 (1~10集)</label>
                  <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={targetEpisodes}
                      onChange={(e) => setTargetEpisodes(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-slate-900 shrink-0 font-mono">
                      {targetEpisodes} 集
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">故事大纲 / 核心反转 Prompt</label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="输入故事主线、主角身份反差、核心悬念或高潮对峙情节..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-black leading-relaxed"
                />
              </div>

              {/* Fast Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">⚡ 快速套用爆款剧本与画风组合:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {presets.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleApplyPreset(p)}
                      className="text-left bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer truncate"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {channel === "text" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">漫剧题材分类</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-black"
                  >
                    <option value="玄幻重生">🔥 玄幻修真 / 仙尊归来</option>
                    <option value="都市战神">⚡ 都市战神 / 隐形首富</option>
                    <option value="甜宠豪门">👑 豪门甜宠 / 真假千金</option>
                    <option value="悬疑惊悚">👻 悬疑推理 / 规则怪谈</option>
                    <option value="末日废土">☣️ 末日求生 / 异能觉醒</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">视觉画风 / LoRA 绑定</label>
                  <select
                    value={selectedStyleId}
                    onChange={(e) => setSelectedStyleId(e.target.value)}
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs text-purple-900 font-semibold focus:outline-none focus:border-purple-600"
                  >
                    {STYLE_PRESET_CARDS.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name} · {style.tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="block text-xs font-bold text-slate-700">粘贴原始剧本 / 小说章节全文</label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="在此直接粘贴 TXT、小说章节、短剧分集对白草稿..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-black leading-relaxed"
              />
            </div>
          )}

          {channel === "url" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">漫剧题材分类</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-black"
                  >
                    <option value="玄幻重生">🔥 玄幻修真 / 仙尊归来</option>
                    <option value="都市战神">⚡ 都市战神 / 隐形首富</option>
                    <option value="甜宠豪门">👑 豪门甜宠 / 真假千金</option>
                    <option value="悬疑惊悚">👻 悬疑推理 / 规则怪谈</option>
                    <option value="末日废土">☣️ 末日求生 / 异能觉醒</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">视觉画风 / LoRA 绑定</label>
                  <select
                    value={selectedStyleId}
                    onChange={(e) => setSelectedStyleId(e.target.value)}
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs text-purple-900 font-semibold focus:outline-none focus:border-purple-600"
                  >
                    {STYLE_PRESET_CARDS.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name} · {style.tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="block text-xs font-bold text-slate-700">网文 / 短剧小说原著链接抓取</label>
              <input
                type="text"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-black"
              />
              <p className="text-[11px] text-slate-400">系统将自动清洗网文文本，提取剧情主线并自动切分黄金卡点。</p>
            </div>
          )}

          {/* Bottom Execution Bar */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            {isGenerating && generationStepText ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-xs text-orange-800 font-bold flex items-center space-x-2 animate-pulse flex-1">
                <Loader2 className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
                <span>{generationStepText}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>立项将锁死 <strong>{currentStyleCard.name}</strong> 风格基底，阶段二自动生成完全同风格的 FaceLock 三视图与场景</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isGenerating}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 cursor-pointer transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在按 {currentStyleCard.name} 风格解耦资产并拆集...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>一键生成并直达阶段二中央确权 ➔</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================================= */}
        {/* BOTTOM MODULE: PROJECT CARDS SHOWCASE (下方模块：漫剧项目工程库)                         */}
        {/* ========================================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-slate-700" />
                <span>漫剧项目工程库 ({projects.length})</span>
              </h3>
              <p className="text-xs text-slate-500">所有已立项的漫剧工程，点击即可进入中央确权或制作流水线</p>
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const isSelected = currentProject?.id === proj.id;
              const isLocked = proj.is_assets_locked;

              return (
                <div
                  key={proj.id}
                  className={`bg-[#F8F9FA] border rounded-2xl p-4 transition-all shadow-2xs flex flex-col justify-between space-y-3 ${
                    isSelected ? "border-slate-800 ring-2 ring-slate-800/10" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Project Header Image & Title */}
                    <div className="flex space-x-3">
                      <img
                        src={
                          proj.cover_url ||
                          proj.characters?.[0]?.ref_image_urls?.[0] ||
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
                        }
                        alt={proj.title}
                        className="w-20 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                            {proj.style_preset || "3D 国漫大作"}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                              isLocked
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {isLocked ? "已确权锁定" : "待确权"}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 truncate">{proj.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                          {proj.description}
                        </p>
                      </div>
                    </div>

                    {/* Quick Specs: Characters, Scenes, Episodes */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-white p-2 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">主角人物</span>
                        <strong className="text-slate-800 font-bold">{proj.characters?.length || 2} 位</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">场景资产</span>
                        <strong className="text-slate-800 font-bold">{proj.scenes?.length || 2} 处</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">总分集</span>
                        <strong className="text-slate-800 font-bold">{proj.episodes?.length || 0} 集</strong>
                      </div>
                    </div>
                  </div>

                  {/* Dual Action Buttons (进入阶段二确权 / 进入阶段三制作) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <button
                      onClick={() => onSelectProject(proj, "central_control")}
                      className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold cursor-pointer transition-colors text-[11px] flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>进入中央确权</span>
                    </button>

                    <button
                      onClick={() => onSelectProject(proj, "episode_studio")}
                      className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer transition-colors text-[11px] flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>进入制作流水线</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
