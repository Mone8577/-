import React, { useState } from "react";
import {
  Globe,
  User,
  Sliders,
  Plus,
  Volume2,
  Lock,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { Project, ProjectCharacter, Episode } from "../../types";

interface CentralControlPanelProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onAddCharacter: (characterData: Partial<ProjectCharacter>) => void;
  onSelectEpisode: (episode: Episode) => void;
  selectedEpisode: Episode | null;
}

export const CentralControlPanel: React.FC<CentralControlPanelProps> = ({
  project,
  onUpdateProject,
  onAddCharacter,
  onSelectEpisode,
  selectedEpisode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"world" | "characters" | "episodes">("world");
  const [showAddCharModal, setShowAddCharModal] = useState(false);

  // New character form state
  const [charName, setCharName] = useState("");
  const [charGender, setCharGender] = useState("男");
  const [charVisual, setCharVisual] = useState("");
  const [charVoice, setCharVoice] = useState("CosyVoice-Seed #8821 (少男爽音)");

  const handleCreateChar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;
    onAddCharacter({
      name: charName,
      gender: charGender,
      visual_description: charVisual || "黑发修长，眼神如鹰，现代潮牌装扮",
      ip_adapter_weight: 0.75,
      voice_name: charVoice,
      ref_image_urls: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
      ],
    });
    setCharName("");
    setCharVisual("");
    setShowAddCharModal(false);
  };

  return (
    <div className="bg-[#16161A] border border-white/10 rounded-xl overflow-hidden shadow-xl text-slate-200">
      {/* Control Panel Header */}
      <div className="p-4 bg-[#111114] border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-white flex items-center gap-2">
              中央控制面板
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                已锁定全局视觉与声音
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              项目沙盒隔离: {project.title} ({project.aspect_ratio})
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 space-x-1">
          {[
            { id: "world", label: "🌍 世界观与画风选型", icon: Globe },
            { id: "characters", label: `👤 角色人设卡 (${project.characters?.length || 0})`, icon: User },
            { id: "episodes", label: `📜 章节目录 (${project.episodes?.length || 0})`, icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white font-medium border border-white/10 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-400" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tab Content */}
      <div className="p-5">
        {/* 1. Worldview & Style Lock */}
        {activeSubTab === "world" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Base Model (基础跑图模型)</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-orange-400 font-mono">FLUX.1-Dev</span>
                </div>
                <select
                  value={project.global_style_config?.base_model || "FLUX.1-Dev (Manga Edition)"}
                  onChange={(e) =>
                    onUpdateProject({
                      global_style_config: {
                        ...project.global_style_config,
                        base_model: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="FLUX.1-Dev (Manga Edition)">FLUX.1-Dev (Manga Edition 国漫特化)</option>
                  <option value="Stable Diffusion XL Turbo (Webtoon)">Stable Diffusion XL Turbo (Webtoon)</option>
                  <option value="NijiJourney v6 Anime Synth">NijiJourney v6 Anime Synth</option>
                  <option value="ComfyUI Custom Cyberpunk">ComfyUI Custom Cyberpunk Workflow</option>
                </select>

                <div className="text-xs font-medium text-slate-300 pt-2">Style LoRA 挂件与权重</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={project.global_style_config?.style_lora || "Xianxia_Webtoon_V2"}
                    onChange={(e) =>
                      onUpdateProject({
                        global_style_config: {
                          ...project.global_style_config,
                          style_lora: e.target.value,
                        },
                      })
                    }
                    className="flex-1 bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                  <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded font-mono">
                    Weight: 0.75
                  </span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="text-xs font-medium text-slate-300">Negative Prompt (全局负向词过滤)</div>
                <textarea
                  rows={3}
                  value={
                    project.global_style_config?.negative_prompt ||
                    "blurry, bad quality, bad hands, distorted faces, missing fingers"
                  }
                  onChange={(e) =>
                    onUpdateProject({
                      global_style_config: {
                        ...project.global_style_config,
                        negative_prompt: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    已挂载 ComfyUI 自动画风防混淆滤镜
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Character Cards (Visual & Voice Dual Lock) */}
        {activeSubTab === "characters" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                通过 IP-Adapter 锁定全剧角色面部一致性，并绑定专属 TTS 声线 Seed。
              </p>
              <button
                onClick={() => setShowAddCharModal(true)}
                className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增角色立绘卡</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.characters?.map((char) => (
                <div
                  key={char.id}
                  className="bg-white/5 p-3.5 rounded-lg border border-white/5 hover:border-orange-500/50 transition-all flex space-x-3"
                >
                  <img
                    src={char.ref_image_urls?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
                    alt={char.name}
                    className="w-20 h-28 object-cover rounded-lg border border-white/10 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-white">{char.name}</h4>
                      <span className="text-[10px] bg-black/40 text-slate-300 px-2 py-0.5 rounded border border-white/10">
                        {char.gender}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{char.visual_description}</p>

                    <div className="pt-1 flex items-center space-x-2 text-[10px]">
                      <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                        <Sliders className="w-3 h-3" />
                        IP-Adapter: {char.ip_adapter_weight || 0.75}
                      </span>
                      <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-mono truncate max-w-[160px]">
                        <Volume2 className="w-3 h-3" />
                        {char.voice_name || "CosyVoice Seed"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Chapter Outline & Golden Hooks */}
        {activeSubTab === "episodes" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                将长篇网文划分为 1~3 分钟短剧快节奏集数，自动高亮黄金钩子点（Hook Point）。
              </p>
            </div>

            <div className="space-y-2">
              {project.episodes?.map((ep) => {
                const isSelected = selectedEpisode?.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    onClick={() => onSelectEpisode(ep)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500/50 text-white shadow-md"
                        : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-orange-500 text-white" : "bg-black/40 text-slate-400"
                        }`}
                      >
                        EP{ep.episode_number}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-100 flex items-center gap-2">
                          {ep.title}
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                              ep.status === "ready"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            }`}
                          >
                            {ep.status === "ready" ? "已渲染合成" : "待编排"}
                          </span>
                        </div>
                        {ep.hook_point && (
                          <div className="text-[11px] text-orange-400 flex items-center gap-1 mt-0.5">
                            <Bookmark className="w-3 h-3 fill-orange-400/30" />
                            <span>{ep.hook_point}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      {ep.storyboards?.length || 0} 画格镜头
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Character Modal */}
      {showAddCharModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 text-slate-100 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              创建新角色档案卡 (人设锁定)
            </h3>

            <form onSubmit={handleCreateChar} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">角色姓名</label>
                <input
                  type="text"
                  required
                  placeholder="例如：苏清歌"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">性别</label>
                <select
                  value={charGender}
                  onChange={(e) => setCharGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">视觉特征描述 (Visual Prompt)</label>
                <textarea
                  rows={2}
                  placeholder="例如：20岁古风少女，长发及腰，身穿九天仙裙..."
                  value={charVisual}
                  onChange={(e) => setCharVisual(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">绑定专属 TTS 音色 (Voice Seed)</label>
                <select
                  value={charVoice}
                  onChange={(e) => setCharVoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="CosyVoice-Seed #8821 (少男爽音)">CosyVoice-Seed #8821 (少男爽音)</option>
                  <option value="CosyVoice-Seed #4102 (清冷御姐)">CosyVoice-Seed #4102 (清冷御姐)</option>
                  <option value="FishSpeech-Seed #9910 (霸道总裁)">FishSpeech-Seed #9910 (霸道总裁)</option>
                  <option value="ElevenLabs-Clone (自定义克隆声线)">ElevenLabs-Clone (自定义克隆声线)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCharModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
