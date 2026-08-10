import React, { useState } from "react";
import {
  Flame,
  User,
  FolderLock,
  Sparkles,
  Download,
  Plus,
  Search,
  Tag,
  Star,
  Copy,
} from "lucide-react";

export const AssetCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"viral" | "styles" | "vault">("viral");

  const viralScripts = [
    {
      id: "v-1",
      title: "《龙神伏魔录》- 黄金钩子破千亿爆款模板",
      genre: "玄幻 / 战神",
      completion_rate: "89.4% (完播率极高)",
      hook_desc: "第1集第45秒主角摊牌龙王身份，暴打豪门未婚妻！",
      downloads: "12,400+",
      rating: "4.9",
    },
    {
      id: "v-2",
      title: "《真假千金重回豪门》- 高能反转甜爽模板",
      genre: "豪门 / 复仇",
      completion_rate: "91.2%",
      hook_desc: "真千金拿出顶级马甲芯片，豪门全家当场下跪！",
      downloads: "8,900+",
      rating: "5.0",
    },
  ];

  const styleTemplates = [
    {
      id: "s-1",
      name: "3D 玄幻精美国风 (FLUX.1 Special)",
      preview_img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
      used_count: "4,500 次使用",
    },
    {
      id: "s-2",
      name: "二次元 Webtoon 漫画发光水墨",
      preview_img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      used_count: "8,200 次使用",
    },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Tabs */}
      <div className="bg-[#16161A] border border-white/10 p-2 rounded-xl flex items-center justify-between flex-wrap gap-2 shadow-lg">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("viral")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "viral"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>爆款剧本与同款模组</span>
          </button>

          <button
            onClick={() => setActiveTab("styles")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "styles"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>视觉画风与角色资产市场</span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "vault"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FolderLock className="w-4 h-4 text-green-400" />
            <span>个人私有资产仓库</span>
          </button>
        </div>
      </div>

      {/* 1. Viral Scripts Tab */}
      {activeTab === "viral" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viralScripts.map((v) => (
              <div
                key={v.id}
                className="bg-[#16161A] border border-white/10 p-5 rounded-2xl space-y-3 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono">
                      {v.genre}
                    </span>
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" /> {v.rating}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-white">{v.title}</h3>

                  <div className="bg-[#0C0C0F] p-2.5 rounded-lg border border-white/10 text-xs text-slate-300">
                    <span className="font-semibold text-orange-400">黄金钩子卡点：</span>
                    {v.hook_desc}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>高完播率: {v.completion_rate}</span>
                  <button
                    onClick={() => alert(`已一键拍同款！项目【${v.title}】已克隆至您的工作区！`)}
                    className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>一键拍同款 (使用模组)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Public Styles Market */}
      {activeTab === "styles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {styleTemplates.map((s) => (
            <div
              key={s.id}
              className="bg-[#16161A] border border-white/10 rounded-2xl overflow-hidden flex space-x-4 p-4 items-center shadow-xl"
            >
              <img
                src={s.preview_img}
                alt={s.name}
                className="w-24 h-24 object-cover rounded-xl border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-2 flex-1">
                <h4 className="font-semibold text-xs text-white">{s.name}</h4>
                <div className="text-[10px] text-slate-400">{s.used_count}</div>
                <button
                  onClick={() => alert(`已成功装载画风模组【${s.name}】至当前漫剧 Central Control Panel`)}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-3 py-1 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  应用至当前项目
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Personal Private Vault */}
      {activeTab === "vault" && (
        <div className="bg-[#16161A] border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-semibold text-sm text-white flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-green-400" />
              个人私有仓库 (全局沉淀的角色卡、声线与 LoRA)
            </span>
            <button className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-md shadow-green-600/20">
              + 上传私有 LoRA 模型
            </button>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#0C0C0F] p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="font-semibold text-orange-400">私有角色库</div>
              <div className="text-slate-400">已沉淀 12 个通用主角人设三视图</div>
            </div>

            <div className="bg-[#0C0C0F] p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="font-semibold text-orange-400">私有音色库 (Zero-Shot)</div>
              <div className="text-slate-400">已克隆 8 条专属配音 Seed</div>
            </div>

            <div className="bg-[#0C0C0F] p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="font-semibold text-orange-400">私有 LoRA 权重</div>
              <div className="text-slate-400">已训好 3 个特定唯美场景 LoRA</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
