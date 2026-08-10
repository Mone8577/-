import React, { useState } from "react";
import { X, Sparkles, Smartphone, Monitor, Square, Palette } from "lucide-react";
import { AspectRatio } from "../../types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectData: {
    title: string;
    description: string;
    aspect_ratio: AspectRatio;
    style_preset: string;
  }) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [stylePreset, setStylePreset] = useState("anime_2d");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: title.trim() || "新修仙漫剧",
      description: description.trim() || "AIGC 短剧",
      aspect_ratio: aspectRatio,
      style_preset: stylePreset,
    });
    setTitle("");
    setDescription("");
    onClose();
  };

  const styleOptions = [
    { id: "anime_2d", label: "国漫风 / Webtoon", desc: "精美2D二次元画风，色彩鲜艳，适合玄幻修仙", icon: Palette },
    { id: "3d_real", label: "3D 写实渲染", desc: "影视级3D材质，媲美《斗罗大陆》画质", icon: Sparkles },
    { id: "cyberpunk", label: "赛博朋克 / 科幻", desc: "霓虹高光，科幻机械细节，高对比度", icon: Monitor },
    { id: "xianxia", label: "水墨国风 / 仙侠", desc: "写意山水，古风韵味，水墨浸润质感", icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#16161A] border border-white/10 rounded-2xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-[#111114] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">创建新漫剧项目</h3>
              <p className="text-xs text-slate-400">自动开启独立的隔离沙盒，锁定画风与角色资产</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              漫剧剧名 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：修仙归来：都市至尊"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">剧情简介与卖点</label>
            <textarea
              rows={2}
              placeholder="例如：一代仙尊重回少年时代，靠无敌医术与绝世剑法碾压都市豪门..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Aspect Ratio Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">画面画幅比例 (Aspect Ratio)</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "9:16", label: "9:16 竖屏", desc: "抖音/TikTok/快手短剧", icon: Smartphone },
                { id: "16:9", label: "16:9 横屏", desc: "B站/YouTube/TV", icon: Monitor },
                { id: "1:1", label: "1:1 正方形", desc: "小红书/Instagram", icon: Square },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = aspectRatio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id as AspectRatio)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500 text-white shadow-md"
                        : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? "text-orange-400" : "text-slate-500"}`} />
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">艺术画风预设 (Style LoRA)</label>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map((opt) => {
                const isSelected = stylePreset === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setStylePreset(opt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500 text-white"
                        : "bg-black/40 border-white/10 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-200">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              创建漫剧项目
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
