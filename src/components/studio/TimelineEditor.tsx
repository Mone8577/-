import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Mic,
  Layers,
  Wand2,
  CheckCircle,
  Loader2,
  Maximize2,
  Zap,
  Lock,
  Shirt,
  ShieldCheck,
  Film,
  Download,
  Share2,
  ChevronDown,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Search,
  Eye,
  Sliders,
  Check,
  User,
  MapPin,
  Package,
  Layers2,
  HelpCircle,
  Sparkle,
} from "lucide-react";
import { Episode, Storyboard, Project, ProjectCharacter, ProjectScene } from "../../types";

interface TimelineEditorProps {
  episode: Episode;
  project: Project;
  onUpdateEpisode: (updatedEp: Episode) => void;
  onBreakdownScript: () => Promise<void>;
  isParsingScript: boolean;
  onBackToCentralControl: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  episode,
  project,
  onUpdateEpisode,
  onBreakdownScript,
  isParsingScript,
  onBackToCentralControl,
  onNavigateTab,
}) => {
  // Active selected shot
  const [selectedShotId, setSelectedShotId] = useState<string | null>(
    episode.storyboards?.[0]?.id || null
  );

  // Playback & Monitor states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRenderingShot, setIsRenderingShot] = useState(false);
  const [isRenderingAll, setIsRenderingAll] = useState(false);
  const [activeGhostFrame, setActiveGhostFrame] = useState(false);
  const [viewMode, setViewMode] = useState<"render" | "original">("render");

  // Left Drawer filter states
  const [assetScope, setAssetScope] = useState<"episode" | "all">("episode");
  const [assetCategory, setAssetCategory] = useState<"character" | "scene" | "material" | "prop">("character");

  // Multi-select & Duration Adjustment in Filmstrip
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedShotsForBatch, setSelectedShotsForBatch] = useState<string[]>([]);
  const [isSmartPreview, setIsSmartPreview] = useState(false);

  // Prompt Mention (@) Dropdown State
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Top Bar Dropdown settings
  const [modelTier, setModelTier] = useState("2.0 Fast VIP");
  const [resolution, setResolution] = useState("720P");
  const [stylePreset, setStylePreset] = useState("高清3D真实渲染风格");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [creditsBalance, setCreditsBalance] = useState(7807);

  // Ensure selected shot stays valid
  useEffect(() => {
    if (episode.storyboards?.length > 0) {
      if (!selectedShotId || !episode.storyboards.some((s) => s.id === selectedShotId)) {
        setSelectedShotId(episode.storyboards[0].id);
      }
    }
  }, [episode.storyboards]);

  const selectedShot =
    episode.storyboards?.find((sb) => sb.id === selectedShotId) || episode.storyboards?.[0];

  const selectedIndex = episode.storyboards?.findIndex((sb) => sb.id === selectedShot?.id) ?? 0;
  const prevShot = selectedIndex > 0 ? episode.storyboards?.[selectedIndex - 1] : null;

  const handleShotChange = (updatedShot: Partial<Storyboard>) => {
    if (!selectedShot) return;
    const updatedStoryboards = episode.storyboards.map((sb) =>
      sb.id === selectedShot.id ? { ...sb, ...updatedShot } : sb
    );
    onUpdateEpisode({
      ...episode,
      storyboards: updatedStoryboards,
    });
  };

  // Insert asset tag at cursor into prompt
  const handleInsertAssetTag = (tag: string) => {
    if (!selectedShot) return;
    const currentPrompt = selectedShot.visual_prompt || "";
    const updatedPrompt = currentPrompt ? `${currentPrompt} ${tag} ` : `${tag} `;
    handleShotChange({ visual_prompt: updatedPrompt });
    setShowMentionMenu(false);
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  // Textarea input watcher for @ character
  const handlePromptInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    handleShotChange({ visual_prompt: val });

    const cursorIndex = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorIndex);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1 && cursorIndex - lastAtPos <= 15) {
      const query = textBeforeCursor.slice(lastAtPos + 1);
      setMentionFilter(query);
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  // Seedance 2.5 Native Multimodal Render
  const handleSeedanceRenderShot = async () => {
    if (!selectedShot) return;
    setIsRenderingShot(true);
    try {
      const matchedChar = project.characters?.find(
        (c) => c.name === selectedShot.speaker_character_name
      );

      const res = await fetch("/api/v1/seedance/render-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: episode.project_id,
          episode_id: episode.id,
          shot_id: selectedShot.id,
          prompt: selectedShot.visual_prompt,
          camera_movement: selectedShot.camera_movement,
          dialogue: selectedShot.dialogue,
          speaker_name: selectedShot.speaker_character_name,
          speaker_face_url: matchedChar?.ref_image_urls?.[0],
          voice_seed: matchedChar?.voice_seed_param,
          style_lora: project.global_style_config?.style_lora,
          aspect_ratio: aspectRatio,
        }),
      });

      const data = await res.json();
      if (res.ok && data.image_url) {
        handleShotChange({
          image_url: data.image_url,
          video_motion_url: data.video_motion_url || data.image_url,
          render_engine: "seedance_2.5",
        });
        setCreditsBalance((prev) => Math.max(0, prev - 6));
      } else {
        alert(data.detail || "Seedance 2.5 渲染失败");
      }
    } catch (err: any) {
      console.error(err);
      alert("Seedance API 调用异常: " + err.message);
    } finally {
      setIsRenderingShot(false);
    }
  };

  const handleRenderAllShots = async () => {
    setIsRenderingAll(true);
    setTimeout(() => {
      setIsRenderingAll(false);
      onUpdateEpisode({
        ...episode,
        status: "ready",
      });
      setCreditsBalance((prev) => Math.max(0, prev - (episode.storyboards?.length || 1) * 6));
      alert(`🎉 第 ${episode.episode_number} 集已成功完成 Seedance 2.5 全集合成渲染！`);
    }, 2400);
  };

  // Mock list of decoupled character clothing variants
  const charactersList = project.characters || [];
  const scenesList = project.scenes || [];

  return (
    <div className="bg-[#F8F9FA] text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans select-none min-h-[calc(100vh-100px)] animate-fadeIn">
      {/* ========================================================================================= */}
      {/* TOP HEADER BAR (精确还原截图顶栏布局与微件配置)                                            */}
      {/* ========================================================================================= */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        {/* Left: Back & Episode Directory Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToCentralControl}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="返回阶段二中央确权"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>

          <div className="flex items-center space-x-1.5 font-bold text-sm text-slate-800">
            <span>第{episode.episode_number}集 · {episode.episode_number}</span>
            <button
              onClick={onBackToCentralControl}
              className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
              title="切换集数目录"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Model Selectors, Credits & Action Buttons */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* VIP Engine Tier Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={modelTier}
              onChange={(e) => setModelTier(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1 font-semibold text-slate-800 text-[11px]"
            >
              <option value="2.0 Fast VIP">2.0 Fast VIP</option>
              <option value="Seedance 2.5 Multimodal">Seedance 2.5 Ultra</option>
              <option value="Kling 1.5 HD">Kling 1.5 HD</option>
            </select>
          </div>

          {/* Resolution Selector */}
          <div className="bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-medium">
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1 text-[11px] font-semibold"
            >
              <option value="720P">720P</option>
              <option value="1080P HD">1080P HD</option>
              <option value="4K UHD">4K 超分</option>
            </select>
          </div>

          {/* Style Preset Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-medium max-w-[190px]">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer truncate text-[11px] font-semibold text-slate-800"
            >
              <option value="高清3D真实渲染风格">高清3D真实渲染风格</option>
              <option value="仙侠国风超写实">仙侠国风超写实</option>
              <option value="韩漫潮酷厚涂">韩漫潮酷厚涂</option>
              <option value="日系2D动画电影">日系2D动画电影</option>
            </select>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-medium">
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-[11px] font-semibold"
            >
              <option value="9:16">📱 9:16 (竖屏)</option>
              <option value="16:9">🎬 16:9 (横屏)</option>
              <option value="1:1">⬜ 1:1</option>
            </select>
          </div>

          {/* Credits Balance Indicator */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800 font-bold font-mono">
            <Sparkle className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{creditsBalance.toLocaleString()}</span>
          </div>

          {/* Export & Full Render Buttons */}
          <button
            onClick={() => alert("✅ 正在导出本集工程包与分镜 EDL 剪辑线...")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[11px]"
          >
            导出
          </button>

          <button
            onClick={handleRenderAllShots}
            disabled={isRenderingAll || !episode.storyboards?.length}
            className="bg-black hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition-all shadow-sm flex items-center space-x-1.5 disabled:opacity-50 text-[11px]"
          >
            {isRenderingAll ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>合成中...</span>
              </>
            ) : (
              <span>合成全集</span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* MAIN 3-COLUMN STUDIO WORKBENCH (左资产抽屉 20% | 中输入 48% | 右监视器 32%)                    */}
      {/* ========================================================================================= */}
      <div className="flex-1 grid grid-cols-12 gap-0 bg-[#F4F5F7] overflow-hidden min-h-[490px]">
        {/* --------------------------------------------------------------------------------------- */}
        {/* 【板块 1：左侧已锁定资产快捷抽屉】 (20% Width -> Col Span 3)                           */}
        {/* --------------------------------------------------------------------------------------- */}
        <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-white border-r border-slate-200 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-3.5">
            {/* Scope Tabs: [本集] vs [全集] */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-3 text-xs font-bold">
                <button
                  onClick={() => setAssetScope("episode")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    assetScope === "episode"
                      ? "border-black text-black font-extrabold"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  本集
                </button>
                <button
                  onClick={() => setAssetScope("all")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    assetScope === "all"
                      ? "border-black text-black font-extrabold"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  全集
                </button>
              </div>

              <button
                onClick={onBackToCentralControl}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="去阶段二新增资产"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category Filter Pills: [角色] [场景] [素材] [道具] */}
            <div className="flex items-center space-x-1.5 text-[11px] bg-slate-100 p-1 rounded-lg">
              {[
                { id: "character", label: "角色" },
                { id: "scene", label: "场景" },
                { id: "material", label: "素材" },
                { id: "prop", label: "道具" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setAssetCategory(cat.id as any)}
                  className={`flex-1 py-1 rounded-md text-center font-semibold transition-all cursor-pointer ${
                    assetCategory === cat.id
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Category 1: Characters & Decoupled Outfits List */}
            {assetCategory === "character" && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>角色形象 (点击插入分镜)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {charactersList.map((char) => (
                    <React.Fragment key={char.id}>
                      {/* Base Character Card */}
                      <div
                        onClick={() => handleInsertAssetTag(`@角色:${char.name}`)}
                        className="group relative bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col"
                      >
                        <div className="aspect-[4/5] w-full bg-slate-100 overflow-hidden relative">
                          <img
                            src={
                              char.ref_image_urls?.[0] ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                            }
                            alt={char.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-[9px] text-white px-1.5 py-0.2 rounded font-mono">
                            3视图
                          </div>
                        </div>
                        <div className="p-1.5 text-center">
                          <div className="text-[11px] font-bold text-slate-800 truncate">{char.name}</div>
                          <div className="text-[9px] text-slate-400">基础形象</div>
                        </div>
                      </div>

                      {/* Decoupled Outfit Cards */}
                      {(char.outfits || [{ id: "outfit-1", name: "姜虞睡衣" }]).map((outfit: any) => (
                        <div
                          key={outfit.id}
                          onClick={() => handleInsertAssetTag(`@角色:${char.name}(${outfit.name})`)}
                          className="group relative bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col"
                        >
                          <div className="aspect-[4/5] w-full bg-slate-100 overflow-hidden relative">
                            <img
                              src={
                                outfit.ref_image_url ||
                                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"
                              }
                              alt={outfit.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {/* Hover Quick Action overlay */}
                            <div className="absolute top-1.5 right-1.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="w-5 h-5 bg-white/90 rounded-md flex items-center justify-center text-slate-700 shadow-sm">
                                <Edit3 className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </div>
                          <div className="p-1.5 text-center">
                            <div className="text-[11px] font-bold text-slate-800 truncate">{char.name}</div>
                            <div className="text-[9px] text-orange-600 font-medium">{outfit.name}</div>
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Category 2: Scenes List */}
            {assetCategory === "scene" && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>场景资产 (点击注入环境 Prompt)</span>
                </div>

                <div className="space-y-2">
                  {(scenesList.length > 0
                    ? scenesList
                    : [
                        {
                          id: "sc-1",
                          name: "霍砺出租屋单间",
                          description: "(傍晚 / 夜间室内)",
                          ref_image_url:
                            "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
                        },
                        {
                          id: "sc-2",
                          name: "露天修车厂",
                          description: "(日间室外)",
                          ref_image_url:
                            "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600",
                        },
                      ]
                  ).map((sc: any) => (
                    <div
                      key={sc.id}
                      onClick={() => handleInsertAssetTag(`@场景:${sc.name}`)}
                      className="group bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 p-1.5 flex space-x-2 items-center hover:shadow-sm"
                    >
                      <img
                        src={sc.ref_image_url || "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600"}
                        alt={sc.name}
                        className="w-16 h-12 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 truncate">{sc.name}</div>
                        <div className="text-[9px] text-slate-500 truncate">{sc.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 3 & 4: Materials and Props */}
            {(assetCategory === "material" || assetCategory === "prop") && (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <Package className="w-6 h-6 mx-auto text-slate-300" />
                <p>已自动同步阶段二资产</p>
                <p className="text-[10px] text-slate-400">点击可在分镜中一键附身道具</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>FaceLock & Voice 绑定中</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </div>

        {/* --------------------------------------------------------------------------------------- */}
        {/* 【板块 2：中央主分镜编辑与 Prompt 输入区】 (48% Width -> Col Span 5)                    */}
        {/* --------------------------------------------------------------------------------------- */}
        <div className="col-span-12 md:col-span-5 lg:col-span-5 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5 flex-1 flex flex-col">
            {/* Header: Avatar, Shot Index & Cost Hint */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shrink-0">
                  <img
                    src={
                      selectedShot?.image_url ||
                      charactersList[0]?.ref_image_urls?.[0] ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                    }
                    alt="Current Shot"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-none">
                    片段 {selectedShot ? String(selectedShot.shot_number).padStart(2, "0") : "01"}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">
                    输入 <strong className="text-slate-700">@</strong> 引用资产及工具
                  </span>
                </div>
              </div>

              {/* Dynamic Billing Rate Badge */}
              <div className="text-[11px] text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                每 <strong className="text-slate-800 font-bold">1</strong> 秒消耗{" "}
                <strong className="text-orange-600 font-bold">6</strong> 积分
              </div>
            </div>

            {/* Prompt Input Canvas with Pill Support & Autocomplete Dropdown */}
            <div className="flex-1 relative flex flex-col">
              <textarea
                ref={promptInputRef}
                value={selectedShot?.visual_prompt || ""}
                onChange={handlePromptInputChange}
                placeholder="输入子分镜描述，引用角色/素材/场景..."
                className="w-full flex-1 min-h-[260px] bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-slate-300 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none transition-all resize-none leading-relaxed shadow-inner"
              />

              {/* Mention (@) Quick Suggestion Dropdown */}
              {showMentionMenu && (
                <div className="absolute top-12 left-4 z-40 bg-white border border-slate-200 rounded-xl shadow-xl w-64 p-1.5 space-y-1 animate-fadeIn">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>快捷引用资产 (@)</span>
                    <span className="text-[9px]">按回车选定</span>
                  </div>
                  {charactersList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleInsertAssetTag(`@角色:${c.name}`)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-orange-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>👤 {c.name} (基础)</span>
                      <span className="text-[9px] text-orange-600">角色</span>
                    </button>
                  ))}
                  {scenesList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleInsertAssetTag(`@场景:${s.name}`)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-green-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>🏞️ {s.name}</span>
                      <span className="text-[9px] text-green-600">场景</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dialogue & Camera quick controls */}
            {selectedShot && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold block">运镜语言</span>
                  <select
                    value={selectedShot.camera_movement || "zoom_in"}
                    onChange={(e) => handleShotChange({ camera_movement: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="zoom_in">特写慢推 (Zoom In)</option>
                    <option value="zoom_out">拉镜全景 (Zoom Out)</option>
                    <option value="pan_left">左摇镜头 (Pan Left)</option>
                    <option value="pan_right">右摇镜头 (Pan Right)</option>
                    <option value="drone_orbit">环绕运镜 (Orbit)</option>
                  </select>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold block">台词对白 (CosyVoice同步)</span>
                  <input
                    type="text"
                    value={selectedShot.dialogue || ""}
                    onChange={(e) => handleShotChange({ dialogue: e.target.value })}
                    placeholder="输入角色台词..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Bottom Action Bar: [取消] [保存 / 生成片段] */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                if (selectedShot) handleShotChange({ visual_prompt: "" });
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              取消
            </button>

            <button
              onClick={handleSeedanceRenderShot}
              disabled={isRenderingShot || !selectedShot}
              className="bg-black hover:bg-slate-800 text-white font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isRenderingShot ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Seedance 渲染中...</span>
                </>
              ) : (
                <span>保存并生成 (6 积分)</span>
              )}
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------------------------- */}
        {/* 【板块 3：右侧竖屏实时画格监视器】 (32% Width -> Col Span 4)                           */}
        {/* --------------------------------------------------------------------------------------- */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 p-5 flex flex-col justify-between items-center border-l border-slate-200 bg-white/60">
          <div className="w-full space-y-3 flex-1 flex flex-col items-center justify-center">
            {/* 9:16 Monitor Frame (完全对标截图的高保真竖屏监视框) */}
            <div className="relative aspect-[9/16] w-full max-w-[280px] max-h-[380px] rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center group">
              {/* Main Frame Image */}
              <img
                src={
                  selectedShot?.image_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"
                }
                alt="Monitor Display"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  viewMode === "original" ? "grayscale contrast-125" : ""
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Ghost Frame (洋葱皮对齐模式: 30% 半透明叠加上一个镜头) */}
              {activeGhostFrame && prevShot?.image_url && (
                <img
                  src={prevShot.image_url}
                  alt="Ghost Overlay"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mix-blend-screen"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Monitor Floating Micro-Toolbar (转绘, 原片, 对齐, 批注, HD, 全屏, 下载) */}
              <div className="absolute top-2.5 inset-x-2 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="flex bg-black/60 backdrop-blur-md rounded-lg p-0.5 space-x-1 border border-white/10 text-white text-[10px]">
                  <button
                    onClick={() => setViewMode(viewMode === "render" ? "original" : "render")}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      viewMode === "original" ? "bg-white/30 text-white font-bold" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    原片
                  </button>
                  <button
                    onClick={() => setActiveGhostFrame(!activeGhostFrame)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      activeGhostFrame ? "bg-orange-500 text-white font-bold" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    对齐
                  </button>
                </div>

                <div className="flex bg-black/60 backdrop-blur-md rounded-lg p-1 space-x-1.5 border border-white/10 text-white">
                  <button
                    onClick={() => alert("批注功能已激活")}
                    className="p-1 hover:text-orange-400 cursor-pointer"
                    title="批注"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => alert("已触发 4K HD 超分处理")}
                    className="text-[9px] font-bold px-1 hover:text-orange-400 cursor-pointer"
                    title="HD超分"
                  >
                    HD
                  </button>
                  <button
                    onClick={() => alert("全屏监视器已开启")}
                    className="p-1 hover:text-orange-400 cursor-pointer"
                    title="全屏"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => alert("正在下载当前高清帧...")}
                    className="p-1 hover:text-orange-400 cursor-pointer"
                    title="下载当前帧"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Subtitle Dialogue in Bottom of Monitor */}
              {selectedShot?.dialogue && (
                <div className="absolute bottom-2.5 inset-x-2 bg-black/75 backdrop-blur-xs p-2 rounded-xl border border-white/10 text-center shadow-lg">
                  <p className="text-[11px] font-bold text-orange-200 leading-tight">
                    {selectedShot.dialogue}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Player Controls (Play/Pause, Slider, Timecode 00:01 / 01:30, Mute) */}
          <div className="w-full pt-3 space-y-1.5">
            <div className="flex items-center space-x-3 text-xs text-slate-700">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5" />}
              </button>

              {/* Scrubbing timeline slider bar */}
              <div className="flex-1 relative flex items-center">
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-slate-900 rounded-full" />
                </div>
                <div className="absolute left-1/4 -translate-x-1/2 w-2.5 h-2.5 bg-purple-600 rounded-full shadow-sm" />
              </div>

              {/* Timecode */}
              <span className="font-mono text-[10px] text-slate-500 font-semibold shrink-0">
                00:01 / 01:30
              </span>

              {/* Mute toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-500 hover:text-slate-900 cursor-pointer p-0.5"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* 【板块 4：底部连续片段胶片时间线】 (Filmstrip Storyboards Timeline)                           */}
      {/* ========================================================================================= */}
      <div className="bg-white border-t border-slate-200 p-3.5 space-y-2.5 shadow-md">
        {/* Top Mini Control Strip: [多选] [智能预演 💎] */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMultiSelect(!isMultiSelect)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] font-semibold ${
                isMultiSelect ? "bg-black text-white" : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Layers2 className="w-3.5 h-3.5" />
              <span>多选</span>
            </button>

            <button
              onClick={() => {
                setIsSmartPreview(true);
                setTimeout(() => setIsSmartPreview(false), 2000);
                alert("💎 智能预演已启动：正在以 2.5D 运镜连贯播放全集草稿分镜！");
              }}
              className="flex items-center space-x-1 hover:bg-slate-100 px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] font-bold text-purple-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>智能预演 💎</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            共 {episode.storyboards?.length || 0} 个三位一体镜头 · 支持直接点击切换
          </span>
        </div>

        {/* Filmstrip Horizontal Scrollable Cards */}
        <div className="flex space-x-3 overflow-x-auto pb-1.5 pt-0.5">
          {episode.storyboards?.map((sb, idx) => {
            const isSelected = selectedShotId === sb.id;
            return (
              <div
                key={sb.id}
                onClick={() => setSelectedShotId(sb.id)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shrink-0 w-24 flex flex-col bg-slate-50 border ${
                  isSelected
                    ? "border-black ring-2 ring-black/20 shadow-md scale-102"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                {/* Frame Image */}
                <div className="aspect-[9/16] w-full bg-slate-200 relative overflow-hidden">
                  <img
                    src={
                      sb.image_url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                    }
                    alt={`Shot ${sb.shot_number}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Ready Green Indicator Dot */}
                  <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                </div>

                {/* Bottom Label (e.g. 片段 01 · 15s) */}
                <div className="py-1 text-center bg-white border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-800">
                    片段 {String(sb.shot_number).padStart(2, "0")} · {sb.audio_duration || 15}s
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Add Shot Button */}
          <button
            onClick={() => {
              const newShotNumber = (episode.storyboards?.length || 0) + 1;
              const newShot: Storyboard = {
                id: `sb-${Date.now()}-${newShotNumber}`,
                episode_id: episode.id,
                project_id: project.id,
                shot_number: newShotNumber,
                camera_movement: "zoom_in",
                visual_prompt: "主角转身看向镜头，眼神凌厉",
                audio_duration: 15,
                image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
                render_engine: "seedance_2.5",
                created_at: new Date().toISOString(),
              };
              onUpdateEpisode({
                ...episode,
                storyboards: [...(episode.storyboards || []), newShot],
              });
              setSelectedShotId(newShot.id);
            }}
            className="w-20 aspect-[9/16] rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-100 flex flex-col items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">加片段</span>
          </button>
        </div>
      </div>
    </div>
  );
};
