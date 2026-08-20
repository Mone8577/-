import React, { useState } from "react";
import {
  Globe,
  User,
  Plus,
  Volume2,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  Shirt,
  Image as ImageIcon,
  ArrowRight,
  Headphones,
  Sliders,
  Check,
  ArrowLeft,
  Wand2,
  Film,
  Camera,
  Eye,
  Activity,
  Music,
  MapPin,
  Sparkle,
  Radio,
  Clock,
  Sun,
  Moon,
  ChevronRight,
  Palette,
} from "lucide-react";
import { Project, ProjectCharacter, ProjectScene, Episode, CharacterOutfit } from "../../types";

interface CentralControlPanelProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onAddCharacter: (characterData: Partial<ProjectCharacter>) => void;
  onAddScene?: (sceneData: Partial<ProjectScene>) => void;
  onSelectEpisode: (episode: Episode) => void;
  selectedEpisode: Episode | null;
  onToggleLockAssets: (locked: boolean) => void;
  onProceedToTimeline: () => void;
  onBackToLobby: () => void;
}

export const CentralControlPanel: React.FC<CentralControlPanelProps> = ({
  project,
  onUpdateProject,
  onAddCharacter,
  onAddScene,
  onSelectEpisode,
  selectedEpisode,
  onToggleLockAssets,
  onProceedToTimeline,
  onBackToLobby,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"characters" | "scenes" | "world" | "episodes">("characters");
  const [showAddCharModal, setShowAddCharModal] = useState(false);
  const [showAddSceneModal, setShowAddSceneModal] = useState(false);
  const [showAddOutfitModal, setShowAddOutfitModal] = useState<string | null>(null);

  const [auditioningVoice, setAuditioningVoice] = useState<string | null>(null);
  const [isAutoRigging, setIsAutoRigging] = useState(false);

  // New character form state (with decoupled outfits)
  const [charName, setCharName] = useState("");
  const [charGender, setCharGender] = useState("男");
  const [charVisual, setCharVisual] = useState("");
  const [charOutfit, setCharOutfit] = useState("基础形象-常服");
  const [charVoice, setCharVoice] = useState("霸道冷酷少年音 (CosyVoice-Seed #8821)");

  // New outfit form state
  const [outfitName, setOutfitName] = useState("");
  const [outfitDesc, setOutfitDesc] = useState("");

  // New scene form state
  const [sceneName, setSceneName] = useState("");
  const [sceneDesc, setSceneDesc] = useState("");
  const [scenePrompt, setScenePrompt] = useState("");
  const [sceneLighting, setSceneLighting] = useState("傍晚/夜间室内");

  const isLocked = project.is_assets_locked;

  // Characters with normalized outfits
  const characters = project.characters || [];
  const scenes = project.scenes || [];
  const episodes = project.episodes || [];

  // Health check diagnostics calculation
  const totalCharacters = characters.length;
  const charsWithFace = characters.filter((c) => c.ref_image_urls?.length > 0).length;
  const charsWithVoice = characters.filter((c) => c.voice_name).length;
  const totalOutfits = characters.reduce((acc, c) => acc + (c.outfits?.length || 1), 0);
  const totalScenes = scenes.length;

  const isHealth100 = totalCharacters > 0 && charsWithFace === totalCharacters && totalScenes > 0;

  const handleCreateChar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;
    onAddCharacter({
      name: charName,
      gender: charGender,
      visual_description: charVisual || "黑发修长，眼神如鹰，现代潮牌装扮",
      ref_image_urls: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60",
      ],
      outfits: [
        {
          id: `outfit-${Date.now()}-1`,
          name: charOutfit || "基础形象",
          description: "日常默认服饰设定",
          ref_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
          is_default: true,
        },
        {
          id: `outfit-${Date.now()}-2`,
          name: "姜虞睡衣/特殊套系",
          description: "卧室私密场景服装解耦",
          ref_image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
          is_default: false,
        },
      ],
      voice_name: charVoice,
      voice_seed_param: "seed_custom_" + Math.floor(Math.random() * 9000 + 1000),
    });
    setCharName("");
    setCharVisual("");
    setCharOutfit("基础形象-常服");
    setShowAddCharModal(false);
  };

  const handleAddOutfitToChar = (charId: string) => {
    if (!outfitName.trim()) return;
    const targetChar = characters.find((c) => c.id === charId);
    if (!targetChar) return;

    const newOutfit: CharacterOutfit = {
      id: `outfit-${Date.now()}`,
      name: outfitName,
      description: outfitDesc || "自定义解耦服装",
      ref_image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
      is_default: false,
    };

    const updatedChars = characters.map((c) =>
      c.id === charId ? { ...c, outfits: [...(c.outfits || []), newOutfit] } : c
    );
    onUpdateProject({ characters: updatedChars });
    setOutfitName("");
    setOutfitDesc("");
    setShowAddOutfitModal(null);
  };

  const handleCreateScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sceneName.trim()) return;
    if (onAddScene) {
      onAddScene({
        name: sceneName,
        description: `${sceneDesc} (${sceneLighting})`,
        env_prompt: scenePrompt || "Cinematic anime scenic background, dramatic lighting, Unreal Engine 5",
        ref_image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
      });
    }
    setSceneName("");
    setSceneDesc("");
    setScenePrompt("");
    setShowAddSceneModal(false);
  };

  const handleAuditionVoice = (voiceName: string) => {
    setAuditioningVoice(voiceName);
    setTimeout(() => {
      setAuditioningVoice(null);
    }, 2000);
  };

  const handleAutoRigAssets = () => {
    setIsAutoRigging(true);
    setTimeout(() => {
      setIsAutoRigging(false);
      alert("✅ 已自动通过 Gemini 3.6 为所有角色配齐五官三视图立绘、解耦服装矩阵与 CosyVoice 专属音色 Seed！");
    }, 1200);
  };

  const handleConfirmAndProceed = () => {
    if (!isLocked) {
      onToggleLockAssets(true);
    }
    onProceedToTimeline();
  };

  return (
    <div className="flex-1 w-full bg-[#F8FAFC] text-slate-800 flex flex-col font-sans select-none min-h-[calc(100vh-56px)] animate-fadeIn space-y-0">
      {/* ========================================================================================= */}
      {/* 1. TOP HEADER & GATEKEEPER HEALTH BAR (明亮现代高光顶栏)                                    */}
      {/* ========================================================================================= */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBackToLobby}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="返回阶段一大厅"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                STAGE 02
              </span>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                中央控制台 · 全局资产确权室 (Gatekeeper)
              </h1>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                  isLocked
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {isLocked ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    全局资产已锁定 · 制作流水线已放行
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    待确权锁定 · 锁死后杜绝变脸变音
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>当前工程：<strong className="text-slate-800">{project.title}</strong></span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1">
                <Palette className="w-3 h-3" />
                画风基因: {project.style_preset || "3D 国漫大作"} ({project.global_style_config?.style_lora || "Xianxia_3D"})
              </span>
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons: Auto-Rig, Unlock & Enter Stage 3 */}
        <div className="flex items-center space-x-2.5 text-xs">
          <button
            onClick={handleAutoRigAssets}
            disabled={isAutoRigging || isLocked}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl font-bold cursor-pointer disabled:opacity-40 transition-all shadow-2xs"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            <span>{isAutoRigging ? "正在智能配齐..." : "一键 AI 补齐资产"}</span>
          </button>

          {isLocked && (
            <button
              onClick={() => onToggleLockAssets(false)}
              className="flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3.5 py-2 rounded-xl font-bold cursor-pointer transition-all shadow-2xs"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-600" />
              <span>解锁修改</span>
            </button>
          )}

          <button
            onClick={handleConfirmAndProceed}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold px-5 py-2 rounded-xl shadow-md shadow-orange-500/20 cursor-pointer transition-all transform hover:scale-[1.02]"
          >
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>{isLocked ? "进入阶段三 · 分集制作室" : "🔒 确认并锁定全局资产 · 开启制作"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* 2. ASSET HEALTH CHECK DIAGNOSTICS STRIP (智能资产健康诊断条)                                */}
      {/* ========================================================================================= */}
      <div className="bg-slate-50/90 px-6 py-2.5 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            资产完备度健康检查:
          </span>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              主角三视图 ({charsWithFace}/{totalCharacters})
            </span>
            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium">
              <Shirt className="w-3 h-3 text-orange-500" />
              解耦服装套系 ({totalOutfits} 套)
            </span>
            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium">
              <Radio className="w-3 h-3 text-blue-500" />
              CosyVoice音色 ({charsWithVoice}/{totalCharacters})
            </span>
            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium">
              <MapPin className="w-3 h-3 text-emerald-500" />
              场景概念库 ({totalScenes} 处)
            </span>
          </div>
        </div>

        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
          <span>健康度得分:</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
            {isHealth100 ? "100% 满配" : "85% 就绪"}
          </span>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* 3. THREE CORE ASSET MODULES TAB BAR (3 大核心资产确权模块导航栏)                           */}
      {/* ========================================================================================= */}
      <div className="bg-white px-6 pt-3 border-b border-slate-200 flex space-x-4 overflow-x-auto">
        {[
          { id: "characters", label: `1. 角色·三视图·服装解耦·音色卡 (${totalCharacters})`, icon: User },
          { id: "scenes", label: `2. 场景概念资产库 (${totalScenes})`, icon: ImageIcon },
          { id: "episodes", label: `3. 智能分集与黄金卡点目录 (${episodes.length})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-black text-black bg-slate-50 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================================= */}
      {/* 4. MAIN ASSETS CONTENT WORKBENCH (4 大确权面板内容主体)                                    */}
      {/* ========================================================================================= */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* --------------------------------------------------------------------------------------- */}
        {/* TAB 1: CHARACTERS MATRIX, THREE-VIEWS, DECOUPLED OUTFITS & COSYVOICE SEEDS              */}
        {/* --------------------------------------------------------------------------------------- */}
        {activeSubTab === "characters" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  角色形象矩阵 · 三视图 FaceLock · 服装解耦橱窗
                </h3>
                <p className="text-xs text-slate-500">
                  为每个主角锁定五官面部特征（杜绝变脸），并在此配置服装变体与专属 CosyVoice 音色 Seed。
                </p>
              </div>

              <button
                disabled={isLocked}
                onClick={() => setShowAddCharModal(true)}
                className="flex items-center space-x-1.5 bg-black hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增角色解耦资产卡</span>
              </button>
            </div>

            {/* Character Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all space-y-4"
                >
                  {/* Top Character Profile & Three-Views Preview */}
                  <div className="flex space-x-4">
                    {/* Character 3-Views Thumbnails */}
                    <div className="space-y-1.5 shrink-0">
                      <div className="relative group w-28 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        <img
                          src={
                            char.ref_image_urls?.[0] ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                          }
                          alt={char.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 border border-emerald-500/30">
                          <Lock className="w-2 h-2" />
                          FaceLock
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1 rounded font-mono">
                          主正面
                        </div>
                      </div>

                      {/* Side View & 45 Degree Mini Thumbnails */}
                      <div className="flex space-x-1">
                        <div className="w-[52px] h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative">
                          <img
                            src={
                              char.ref_image_urls?.[1] ||
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                            }
                            alt="Side View"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0.5 right-0.5 text-[7px] bg-black/60 text-white px-0.5 rounded">侧面</span>
                        </div>
                        <div className="w-[52px] h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative">
                          <img
                            src={
                              char.ref_image_urls?.[2] ||
                              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
                            }
                            alt="Angled View"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0.5 right-0.5 text-[7px] bg-black/60 text-white px-0.5 rounded">表情</span>
                        </div>
                      </div>
                    </div>

                    {/* Character Bio, Visual Spec & Voice Engine */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-base text-slate-900">{char.name}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                            {char.gender}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                          ● FaceLock 已固化
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {char.visual_description || "黑发修长，双眸如鹰，眼神冷冽淡漠，下颚线分明"}
                      </p>

                      {/* CosyVoice Seed & Waveform Player */}
                      <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-blue-900 flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                            {char.voice_name || "CosyVoice-Seed #8821 (冷酷霸道)"}
                          </span>
                          <span className="text-[10px] text-blue-600 font-mono">
                            {char.voice_seed_param || "seed_8821"}
                          </span>
                        </div>

                        {/* Interactive Waveform Bar & Audition button */}
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleAuditionVoice(char.name)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
                          >
                            <Headphones className="w-3 h-3" />
                            <span>{auditioningVoice === char.name ? "声线播放中..." : "试听声线"}</span>
                          </button>

                          {/* Dynamic audio bars */}
                          <div className="flex-1 flex items-center space-x-1 h-4 bg-white/80 rounded px-2">
                            {[40, 70, 30, 90, 60, 45, 80, 65, 30, 85, 50, 75, 40].map((h, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  auditioningVoice === char.name
                                    ? "bg-blue-600 animate-pulse"
                                    : "bg-blue-200"
                                }`}
                                style={{ height: `${auditioningVoice === char.name ? h : 30}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decoupled Outfits Showcase Shelf (服装解耦橱窗) */}
                  <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Shirt className="w-3.5 h-3.5 text-orange-500" />
                        已解耦服装套系橱窗 ({char.outfits?.length || 1})
                      </span>
                      <button
                        disabled={isLocked}
                        onClick={() => setShowAddOutfitModal(char.id)}
                        className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加服装套系</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(char.outfits || [
                        { id: "1", name: "基础常服", description: "日常修身风衣", is_default: true },
                        { id: "2", name: "姜虞睡衣", description: "卧室私密装", is_default: false },
                      ]).map((outfit: any) => (
                        <div
                          key={outfit.id}
                          className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 truncate">{outfit.name}</span>
                            {outfit.is_default && (
                              <span className="text-[8px] bg-slate-100 text-slate-600 px-1 rounded">默认</span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 truncate">{outfit.description}</p>
                          <div className="text-[8px] text-orange-600 font-semibold bg-orange-50 px-1 py-0.2 rounded w-fit">
                            已解耦
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------------------- */}
        {/* TAB 2: SCENES ASSETS & LIGHTING PRESETS                                                */}
        {/* --------------------------------------------------------------------------------------- */}
        {activeSubTab === "scenes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  场景概念资产库 · 空间光影一致性
                </h3>
                <p className="text-xs text-slate-500">
                  统一全剧多次出现的核心场景（如主角出租屋、豪华拍卖会、地下车库），确保无论昼夜都能继承相同的空间构图。
                </p>
              </div>

              <button
                disabled={isLocked}
                onClick={() => setShowAddSceneModal(true)}
                className="flex items-center space-x-1.5 bg-black hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增场景资产卡</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(scenes.length > 0
                ? scenes
                : [
                    {
                      id: "sc-1",
                      name: "霍砺出租屋单间",
                      description: "狭小昏暗的单身公寓，雨夜窗外霓虹反光 (傍晚/夜间室内)",
                      env_prompt: "Cinematic anime scenic background, narrow messy apartment, neon rain outside, dramatic sunset",
                      ref_image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
                    },
                    {
                      id: "sc-2",
                      name: "露天修车厂",
                      description: "满地机械零件与重型机车的硬核修车厂 (日间室外)",
                      env_prompt: "Open air motorcycle repair shop, industrial grunge, bright direct sunlight, Unreal Engine 5",
                      ref_image_url: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600",
                    },
                  ]
              ).map((scene) => (
                <div
                  key={scene.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex space-x-4 transition-all"
                >
                  <img
                    src={scene.ref_image_url || "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600"}
                    alt={scene.name}
                    className="w-36 h-28 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900">{scene.name}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                        室内 / 傍晚
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{scene.description}</p>

                    <div className="bg-slate-50 p-2 rounded-lg text-[10px] font-mono text-slate-600 line-clamp-1 border border-slate-100">
                      Prompt: {scene.env_prompt}
                    </div>

                    <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      制作室输入 @场景:{scene.name} 即可自动调用
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------------------- */}
        {/* TAB 3: WORLDVIEW & SEEDANCE 2.5 ENGINE BASE                                            */}
        {/* --------------------------------------------------------------------------------------- */}
        {activeSubTab === "world" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">Native Multimodal Engine (原生多模态视频引擎)</span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    Seedance 2.5 API
                  </span>
                </div>

                <select
                  disabled={isLocked}
                  value={project.global_style_config?.base_model || "Seedance 2.5 Multimodal Engine"}
                  onChange={(e) =>
                    onUpdateProject({
                      global_style_config: {
                        ...project.global_style_config,
                        base_model: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-black font-semibold disabled:opacity-60"
                >
                  <option value="Seedance 2.5 Multimodal Engine">
                    🚀 Seedance 2.5 Multimodal (音画同生 / 毫秒级唇形动作匹配 / 影视级高保真)
                  </option>
                  <option value="Seedance 2.0 Ultra Fast">
                    ⚡ Seedance 2.0 Ultra Fast (高吞吐极速批量生成)
                  </option>
                  <option value="Kling 1.5 HD Storyboard">
                    🎬 Kling 1.5 HD Storyboard (影视级长镜头)
                  </option>
                </select>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-extrabold text-slate-800">
                    全局画风 Prompt 挂件 / LoRA 权重
                  </label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={project.global_style_config?.style_lora || "Xianxia_3D_Masterpiece (Weight: 0.85)"}
                    onChange={(e) =>
                      onUpdateProject({
                        global_style_config: {
                          ...project.global_style_config,
                          style_lora: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="font-extrabold text-sm text-slate-900">画面比例与 Negative Prompt 质量底线</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={isLocked}
                    onClick={() => onUpdateProject({ aspect_ratio: "9:16" })}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      project.aspect_ratio === "9:16"
                        ? "bg-black text-white border-black"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    9:16 竖屏短剧 (默认)
                  </button>
                  <button
                    disabled={isLocked}
                    onClick={() => onUpdateProject({ aspect_ratio: "16:9" })}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      project.aspect_ratio === "16:9"
                        ? "bg-black text-white border-black"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    16:9 横屏影视
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800">
                    Negative Prompt (全局负向提示词)
                  </label>
                  <textarea
                    rows={2}
                    disabled={isLocked}
                    value={
                      project.global_style_config?.negative_prompt ||
                      "blurry, low quality, bad anatomy, deformed face, distorted hands, muted voice"
                    }
                    onChange={(e) =>
                      onUpdateProject({
                        global_style_config: {
                          ...project.global_style_config,
                          negative_prompt: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-black disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------------------- */}
        {/* TAB 3: EPISODES BREAKDOWN & GOLDEN HOOK POINTS & DIRECT PRODUCTION TRIGGER              */}
        {/* --------------------------------------------------------------------------------------- */}
        {activeSubTab === "episodes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <span>智能分集大纲与黄金卡点 (Golden Hook)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  短剧按 1~3 分钟快节奏切分，确权每集结尾的剧情反转与高潮悬念，支持单集直达制作流水线。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {episodes.map((ep) => {
                const isSelected = selectedEpisode?.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start md:items-center space-x-4 min-w-0 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                          isSelected ? "bg-orange-500 text-white shadow-sm" : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        EP{ep.episode_number}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-bold text-xs flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold truncate">{ep.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              ep.status === "ready"
                                ? isSelected
                                  ? "bg-emerald-500/30 text-emerald-300"
                                  : "bg-emerald-100 text-emerald-700"
                                : isSelected
                                ? "bg-orange-500/30 text-orange-300"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {ep.status === "ready" ? "已合成全集" : "待制作"}
                          </span>
                        </div>
                        {ep.hook_point && (
                          <div
                            className={`text-xs flex items-center gap-1.5 ${
                              isSelected ? "text-orange-300" : "text-orange-600 font-semibold"
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5 shrink-0" />
                            <span>🔥 黄金卡点：{ep.hook_point}</span>
                          </div>
                        )}
                        <p className={`text-[11px] line-clamp-1 ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                          {ep.raw_script || "剧情冲突持续升级中..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                      <div
                        className={`text-right text-[11px] font-semibold hidden sm:block ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        <div>{ep.storyboards?.length || 0} 个三位一体分镜</div>
                        <div className="text-[10px] opacity-70">约 {(ep.storyboards?.length || 0) * 8} 秒时长</div>
                      </div>

                      {/* Direct trigger to Stage 3 Production for this specific episode */}
                      <button
                        onClick={() => {
                          onSelectEpisode(ep);
                          if (!isLocked) {
                            onToggleLockAssets(true);
                          }
                          onProceedToTimeline();
                        }}
                        className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-sm ${
                          isSelected
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20"
                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>进入第 {ep.episode_number} 集制作流水线 ➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================================= */}
      {/* MODAL: ADD CHARACTER ASSET CARD                                                           */}
      {/* ========================================================================================= */}
      {showAddCharModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-extrabold text-slate-900">新增角色形象与服装解耦</h3>
            <form onSubmit={handleCreateChar} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">角色名称</label>
                <input
                  type="text"
                  required
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="例如：姜虞、霍砺、苏沐雪"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-black font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">性别</label>
                  <select
                    value={charGender}
                    onChange={(e) => setCharGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">默认解耦服装</label>
                  <input
                    type="text"
                    value={charOutfit}
                    onChange={(e) => setCharOutfit(e.target.value)}
                    placeholder="基础形象-常服"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">五官外貌特征描述 (FaceLock)</label>
                <textarea
                  rows={2}
                  value={charVisual}
                  onChange={(e) => setCharVisual(e.target.value)}
                  placeholder="黑发修长，眼神如鹰，眼神冷冽淡漠..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">专属音色 Seed (CosyVoice / MiniMax)</label>
                <select
                  value={charVoice}
                  onChange={(e) => setCharVoice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="霸道冷酷少年音 (CosyVoice-Seed #8821)">霸道冷酷少年音 (CosyVoice-Seed #8821)</option>
                  <option value="清冷高傲御姐音 (CosyVoice-Seed #9910)">清冷高傲御姐音 (CosyVoice-Seed #9910)</option>
                  <option value="热血清爽男主音 (CosyVoice-Seed #3312)">热血清爽男主音 (CosyVoice-Seed #3312)</option>
                  <option value="软萌灵动甜妹音 (CosyVoice-Seed #6642)">软萌灵动甜妹音 (CosyVoice-Seed #6642)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCharModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold shadow-md cursor-pointer"
                >
                  保存并加入资产库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL: ADD DECOUPLED OUTFIT TO CHARACTER                                                  */}
      {/* ========================================================================================= */}
      {showAddOutfitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-extrabold text-slate-900">为角色新增解耦服装套系</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">服装套系名称</label>
                <input
                  type="text"
                  required
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="例如：姜虞睡衣、玄金战甲、宴会礼服"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">适用场景或特征</label>
                <input
                  type="text"
                  value={outfitDesc}
                  onChange={(e) => setOutfitDesc(e.target.value)}
                  placeholder="卧室私密装、战斗高潮特供"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOutfitModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => handleAddOutfitToChar(showAddOutfitModal)}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold shadow-md cursor-pointer"
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL: ADD SCENE ASSET CARD                                                               */}
      {/* ========================================================================================= */}
      {showAddSceneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-extrabold text-slate-900">新增场景资产与光影设定</h3>
            <form onSubmit={handleCreateScene} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">场景名称</label>
                <input
                  type="text"
                  required
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  placeholder="例如：霍砺出租屋单间、云岚宗演武场"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">时段与光影氛围标签</label>
                <select
                  value={sceneLighting}
                  onChange={(e) => setSceneLighting(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="傍晚/夜间室内">傍晚 / 夜间室内 (昏暗霓虹/雨夜)</option>
                  <option value="日间室外">日间室外 (明媚强光/工业风)</option>
                  <option value="深夜密室">深夜密室 (单一侧光源/冷色调)</option>
                  <option value="落日余晖">落日余晖 (戏剧化暖光逆光)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">场景描述与空间结构</label>
                <textarea
                  rows={2}
                  value={sceneDesc}
                  onChange={(e) => setSceneDesc(e.target.value)}
                  placeholder="狭窄公寓、铁架床、窗外雨夜霓虹灯..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSceneModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold shadow-md cursor-pointer"
                >
                  保存并加入场景库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
