import React, { useState } from "react";
import {
  Share2,
  Tv,
  Globe,
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  TrendingUp,
  DollarSign,
  Languages,
} from "lucide-react";
import { Project, PublishTask } from "../../types";

interface PublishingMatrixProps {
  project: Project | null;
}

export const PublishingMatrix: React.FC<PublishingMatrixProps> = ({ project }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "douyin",
    "kuaishou",
    "tiktok",
    "youtube",
  ]);
  const [scheduleType, setScheduleType] = useState<"instant" | "scheduled">("instant");
  const [publishTitle, setPublishTitle] = useState(
    project ? `【爆款漫剧】${project.title} 第一集-重回少年时代` : "【爆款漫剧】连载合集"
  );
  const [targetLang, setTargetLang] = useState("en");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedLogs, setPublishedLogs] = useState<PublishTask[]>([
    {
      id: "pub-101",
      project_id: project?.id || "proj-1",
      user_id: "user-default",
      target_platforms: ["douyin", "kuaishou", "tiktok", "youtube"],
      episodes_to_publish: ["ep-1", "ep-2"],
      title: "【爆款漫剧】修仙归来：都市至尊 EP01-02",
      schedule_type: "instant",
      status: "published",
      log_message: "全网4大平台已一键同步，TikTok/YouTube多语言字幕配音已合成",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ]);

  const platforms = [
    { id: "douyin", name: "抖音 / 短剧小程序", icon: "🎵", followers: "128.4万", status: "active" },
    { id: "kuaishou", name: "快手 / 星芒短剧", icon: "⚡", followers: "85.2万", status: "active" },
    { id: "weixin", name: "微信视频号 / 小剧场", icon: "💬", followers: "42.0万", status: "active" },
    { id: "bilibili", name: "哔哩哔哩 (B站)", icon: "📺", followers: "21.6万", status: "active" },
    { id: "xiaohongshu", name: "小红书", icon: "📕", followers: "15.9万", status: "active" },
    { id: "tiktok", name: "TikTok Overseas", icon: "🌐", followers: "340.5万", status: "active" },
    { id: "youtube", name: "YouTube Shorts", icon: "▶️", followers: "512.0万", status: "active" },
    { id: "reelshort", name: "ReelShort App", icon: "🎬", followers: "专属签约渠道", status: "active" },
  ];

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      const newTask: PublishTask = {
        id: `pub-${Date.now()}`,
        project_id: project?.id || "proj-1",
        user_id: "user-default",
        target_platforms: selectedPlatforms,
        episodes_to_publish: ["ep-1"],
        title: publishTitle,
        schedule_type: scheduleType,
        status: "published",
        log_message: `已分发至 ${selectedPlatforms.length} 个矩阵平台，多语言 (${targetLang}) AI 配音导出成功`,
        created_at: new Date().toISOString(),
      };
      setPublishedLogs([newTask, ...publishedLogs]);
      alert("全网矩阵一键分发任务已成功提交！");
    }, 2000);
  };

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#16161A] border border-white/10 p-4 rounded-xl space-y-1 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>全网总播放量</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">18,420,900</div>
          <div className="text-[10px] text-green-400">较上周 +34.2% ↑</div>
        </div>

        <div className="bg-[#16161A] border border-white/10 p-4 rounded-xl space-y-1 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>矩阵账号粉丝数</span>
            <Globe className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">11,455,600</div>
          <div className="text-[10px] text-orange-400">覆盖国内与出海 8 大渠道</div>
        </div>

        <div className="bg-[#16161A] border border-white/10 p-4 rounded-xl space-y-1 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>小程序充值与广告收益</span>
            <DollarSign className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-orange-400 font-mono">¥ 284,910.00</div>
          <div className="text-[10px] text-slate-400">可随时一键结算至公户/个人</div>
        </div>

        <div className="bg-[#16161A] border border-white/10 p-4 rounded-xl space-y-1 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>智能分发成功率</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">99.8%</div>
          <div className="text-[10px] text-slate-400">官方 API 直连无感发版</div>
        </div>
      </div>

      {/* Main Publishing Config & Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Settings & Localization (7 Cols) */}
        <div className="lg:col-span-7 bg-[#16161A] border border-white/10 p-5 rounded-xl space-y-5 text-slate-100 shadow-xl">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-orange-400" />
              全网一键分发任务配置
            </h3>
            {project && (
              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-medium">
                当前项目: {project.title}
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">分发视频标题 & 话题标签</label>
              <input
                type="text"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* AI Localization Section */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-orange-400" />
                  AI 海外出海本地化 (Multilingual Voice & Subtitles)
                </span>
                <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded">
                  克隆原角色声线特征
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">目标配音语言</label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="en">英语 (English - US)</option>
                    <option value="id">印尼语 (Bahasa Indonesia)</option>
                    <option value="th">泰语 (Thai)</option>
                    <option value="ja">日语 (Japanese)</option>
                    <option value="es">西班牙语 (Spanish)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">画幅自动智能填充</label>
                  <select className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500">
                    <option value="blur">背景高斯模糊填充</option>
                    <option value="smart_crop">主体人像智能居中裁剪</option>
                    <option value="letterbox">黑边加文字贴纸</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Release Strategy */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScheduleType("instant")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  scheduleType === "instant"
                    ? "bg-orange-500/10 border-orange-500 text-white"
                    : "bg-black/40 border-white/10 text-slate-400"
                }`}
              >
                <div className="font-semibold text-xs">⚡ 立即同步发布</div>
                <div className="text-[10px] text-slate-400 mt-0.5">多平台 API 实时投递</div>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType("scheduled")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  scheduleType === "scheduled"
                    ? "bg-orange-500/10 border-orange-500 text-white"
                    : "bg-black/40 border-white/10 text-slate-400"
                }`}
              >
                <div className="font-semibold text-xs">📅 矩阵连载定时发布</div>
                <div className="text-[10px] text-slate-400 mt-0.5">如: 每天 18:00 连载1集</div>
              </button>
            </div>

            <button
              onClick={handlePublish}
              disabled={isPublishing || selectedPlatforms.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isPublishing
                ? "全网 API 直连投递与多语言重合成中..."
                : `一键投递至选中的 ${selectedPlatforms.length} 个矩阵平台`}
            </button>
          </div>
        </div>

        {/* Right: Target Platforms & Account Bindings (5 Cols) */}
        <div className="lg:col-span-5 bg-[#16161A] border border-white/10 p-5 rounded-xl space-y-4 text-slate-100 shadow-xl">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-orange-400" />
              已绑定授权渠道
            </h3>
            <button className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 cursor-pointer">
              <Plus className="w-3 h-3" />
              绑定新账号
            </button>
          </div>

          <div className="space-y-2">
            {platforms.map((p) => {
              const isSelected = selectedPlatforms.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-orange-500/10 border-orange-500 text-white"
                      : "bg-black/40 border-white/10 text-slate-400 opacity-70"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <div className="font-semibold text-xs text-slate-100">{p.name}</div>
                      <div className="text-[10px] text-slate-400">粉丝: {p.followers}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded">
                      资质已绑定
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded accent-orange-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Log History */}
      <div className="bg-[#16161A] border border-white/10 p-5 rounded-xl space-y-3 shadow-xl">
        <h4 className="font-semibold text-sm text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          全网发布任务日志
        </h4>

        <div className="space-y-2 text-xs">
          {publishedLogs.map((log) => (
            <div
              key={log.id}
              className="bg-[#0C0C0F] p-3 rounded-lg border border-white/10 flex items-center justify-between text-slate-300"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  {log.title}
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.2 rounded border border-green-500/30">
                    {log.status}
                  </span>
                </div>
                <div className="text-slate-400">{log.log_message}</div>
              </div>

              <div className="text-right text-[11px] text-slate-500 font-mono">
                {new Date(log.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
