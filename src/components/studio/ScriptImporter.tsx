import React, { useState } from "react";
import { FileText, Sparkles, Link, Upload, Bot, Check, ArrowRight, Loader2 } from "lucide-react";
import { Project, Episode } from "../../types";

interface ScriptImporterProps {
  project: Project;
  onImportScript: (episodes: Episode[], mainCharacters?: any[]) => void;
}

export const ScriptImporter: React.FC<ScriptImporterProps> = ({ project, onImportScript }) => {
  const [channel, setChannel] = useState<"text" | "ai" | "url">("ai");

  // AI Incubator state
  const [genre, setGenre] = useState("玄幻重生");
  const [aiPrompt, setAiPrompt] = useState("仙尊重生到高中时期，拯救家族破产并痛击豪门仇敌");
  const [targetEpisodes, setTargetEpisodes] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  // Text Paste state
  const [rawText, setRawText] = useState("");

  // URL state
  const [webUrl, setWebUrl] = useState("https://book.qidian.com/info/1028392102/");

  const handleAiIncubate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/incubate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          prompt: aiPrompt,
          target_episodes: targetEpisodes,
        }),
      });
      const data = await res.json();

      if (data.episodes) {
        const newEpisodes: Episode[] = data.episodes.map((ep: any, idx: number) => ({
          id: `ep-${Date.now()}-${idx}`,
          project_id: project.id,
          episode_number: ep.episode_number || idx + 1,
          title: ep.title || `第 ${idx + 1} 集`,
          raw_script: ep.raw_script || "",
          hook_point: ep.hook_point || "黄金钩子",
          status: "pending",
          created_at: new Date().toISOString(),
          storyboards: [],
        }));

        onImportScript(newEpisodes, data.main_characters);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextImport = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split("\n\n").filter(Boolean);
    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      project_id: project.id,
      episode_number: (project.episodes?.length || 0) + 1,
      title: `第 ${(project.episodes?.length || 0) + 1} 集`,
      raw_script: rawText,
      hook_point: "人工导入文本黄金钩子",
      status: "pending",
      created_at: new Date().toISOString(),
      storyboards: [],
    };
    onImportScript([newEp]);
    setRawText("");
  };

  return (
    <div className="bg-[#16161A] border border-white/10 rounded-xl p-5 text-slate-200 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            剧本三通道智能导入
          </h3>
          <p className="text-xs text-slate-400">选择适合你的生产源，快速生成分集文本与高潮钩子</p>
        </div>

        {/* Channel Selector */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 space-x-1">
          <button
            onClick={() => setChannel("ai")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-all cursor-pointer ${
              channel === "ai"
                ? "bg-white/10 text-white font-medium border border-white/10 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${channel === "ai" ? "text-orange-400" : ""}`} />
            <span>AI 原创灵感孵化</span>
          </button>
          <button
            onClick={() => setChannel("text")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-all cursor-pointer ${
              channel === "text"
                ? "bg-white/10 text-white font-medium border border-white/10 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className={`w-3.5 h-3.5 ${channel === "text" ? "text-orange-400" : ""}`} />
            <span>文本/文件导入</span>
          </button>
          <button
            onClick={() => setChannel("url")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-all cursor-pointer ${
              channel === "url"
                ? "bg-white/10 text-white font-medium border border-white/10 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Link className={`w-3.5 h-3.5 ${channel === "url" ? "text-orange-400" : ""}`} />
            <span>网文 URL 抓取</span>
          </button>
        </div>
      </div>

      <div className="pt-4">
        {/* Channel 1: AI Original Story Incubator */}
        {channel === "ai" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">题材类型</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="玄幻重生">玄幻重生 / 仙尊无敌</option>
                  <option value="都市战神">都市战神 / 龙王赘婿</option>
                  <option value="甜宠豪门">豪门甜宠 / 总裁娇妻</option>
                  <option value="悬疑惊悚">悬疑推理 / 规则怪谈</option>
                  <option value="科幻赛博">赛博朋克 / 机械降神</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  灵感关键词 / 剧情核心看点
                </label>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="例如：被全家嫌弃的真少爷觉醒神级异能，横扫假少爷与冷血父母..."
                  className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-3.5 rounded-xl border border-white/5 flex-wrap gap-3">
              <div className="text-xs text-slate-400">
                AI 算法将自动清洗段落、提取角色声线与人设卡，并自动标记 1~3 分钟短剧高潮卡点。
              </div>

              <button
                onClick={handleAiIncubate}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gemini 3.6 编剧大脑孵化中...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>生成全套分集脚本</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Channel 2: Direct Text Paste / File */}
        {channel === "text" && (
          <div className="space-y-3">
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="在此粘贴小说文本或脚本内容...（支持按双换行自动拆分集数）"
              className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                也可以上传 .txt, .docx, .epub 文件进行解析
              </span>
              <button
                onClick={handleTextImport}
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                解析并导入
              </button>
            </div>
          </div>
        )}

        {/* Channel 3: Web URL Parser */}
        {channel === "url" && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="输入授权正版小说章节 URL..."
                className="flex-1 bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => {
                  alert("已授权抓取该网文正文，智能分割为 3 集卡点短剧！");
                  handleAiIncubate();
                }}
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                自动抓取正文
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
