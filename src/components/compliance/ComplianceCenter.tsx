import React, { useState } from "react";
import {
  ShieldCheck,
  FileCheck,
  Award,
  Users,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Video,
} from "lucide-react";
import VideoReviewCanvas from "./VideoReviewCanvas";
import { AnnotationMarker } from "../../types";

export const ComplianceCenter: React.FC = () => {
  const [entityType, setEntityType] = useState<"individual" | "enterprise">("individual");
  const [monetizationModel, setMonetizationModel] = useState<"applet" | "ad_revenue" | "overseas">("applet");
  const [appliedAffiliate, setAppliedAffiliate] = useState(false);

  const [reviewMarkers, setReviewMarkers] = useState<AnnotationMarker[]>([
    {
      id: "marker-1",
      timestamp: 2.5,
      box: { x: 0.25, y: 0.35, width: 0.45, height: 0.3 },
      comment: "角色手部六指畸形，需要使用 ComfyUI Inpainting 重绘该画格",
      author: "总导演",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "marker-2",
      timestamp: 5.0,
      box: { x: 0.1, y: 0.1, width: 0.8, height: 0.4 },
      comment: "背景缺少玄幻古风宗门建筑遮罩，需添加 LoRA 风格滤镜",
      author: "审片组-李编辑",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);

  const handleAddMarker = (marker: Omit<AnnotationMarker, "id" | "createdAt">) => {
    const newMarker: AnnotationMarker = {
      ...marker,
      id: `marker-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviewMarkers((prev) => [...prev, newMarker]);
  };

  const packages = [
    {
      id: "pkg-a",
      title: "套餐 A：广播电视节目制作经营许可证",
      desc: "短剧、漫剧、微短剧上架各大平台必备的核心资质。",
      price: "¥ 3,800",
      time: "10-15 工作日",
      badge: "热销短剧资质",
    },
    {
      id: "pkg-b",
      title: "套餐 B：网络文化经营许可证 (网文/动漫)",
      desc: "涵盖动漫衍生、网络文学 IP 改编合规上架。",
      price: "¥ 2,800",
      time: "7-10 工作日",
      badge: "动漫合规",
    },
    {
      id: "pkg-c",
      title: "套餐 C：短剧合规三件套打包代办 (增值电信+广播证+网文证)",
      desc: "一站式全包服务，专人快速通道加急下证，无忧合规全网变现。",
      price: "¥ 8,800",
      time: "15 工作日",
      badge: "企业大礼包",
    },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Compliance Header Banner */}
      <div className="bg-[#16161A] border border-white/10 p-6 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              资质合规与联合发行中心
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                官方挂靠全网合规变现通道
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              解决“网文三件套”（ICP 许可证、网络文化经营许可证、广播电视节目制作许可证）政策门槛
            </p>
          </div>
        </div>
      </div>

      {/* 1. Affiliate Joint Publishing (Solution for Individual Creators without licenses) */}
      <div className="bg-[#16161A] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              无证创作者解法：挂靠平台联合发行通道
            </h3>
            <p className="text-xs text-slate-400">
              个人创作者无须花费高额资金办证，直接挂靠平台持证合规发行商身份上架各大短剧小程序与短视频平台。
            </p>
          </div>

          <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            平台流水分成仅抽 10% - 15%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0C0C0F] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-semibold text-orange-400">① 免办证极速上架</div>
            <p className="text-slate-400">
              直接使用「漫剧工场」持有的广播电视节目制作经营许可证备案提交审查。
            </p>
          </div>

          <div className="bg-[#0C0C0F] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-semibold text-orange-400">② 全网自动收益结算</div>
            <p className="text-slate-400">
              小程序充值与 YouTube 广告收益由平台统一扣税与抽成后，实时打款至个人卡。
            </p>
          </div>

          <div className="bg-[#0C0C0F] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-semibold text-orange-400">③ 内容审核风险预检</div>
            <p className="text-slate-400">
              AI 算法自动合规审核，避免因违规被平台封号或下架。
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>目前已有 2,400+ 创作者通过平台联合发行渠道上架</span>
          </div>

          <button
            onClick={() => {
              setAppliedAffiliate(true);
              alert("挂靠申请已通过！您已获得「漫剧工场合规发行商」资质授权，可直接一键分发！");
            }}
            className="bg-green-600 hover:bg-green-500 text-white font-medium px-5 py-2 rounded-xl text-xs transition-all shadow-md shadow-green-600/20 cursor-pointer"
          >
            {appliedAffiliate ? "✓ 已开通联合发行身份" : "申请挂靠平台持证发行商"}
          </button>
        </div>
      </div>

      {/* 2. Interactive Qualification Self-Assessment Wizard */}
      <div className="bg-[#16161A] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-orange-400" />
          智能资质自测向导
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">您的运营主体类型</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setEntityType("individual")}
                className={`flex-1 py-2 rounded-lg border font-medium cursor-pointer transition-all ${
                  entityType === "individual"
                    ? "bg-orange-500/10 border-orange-500 text-white"
                    : "bg-[#0C0C0F] border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                个人 / 独立工作室
              </button>
              <button
                type="button"
                onClick={() => setEntityType("enterprise")}
                className={`flex-1 py-2 rounded-lg border font-medium cursor-pointer transition-all ${
                  entityType === "enterprise"
                    ? "bg-orange-500/10 border-orange-500 text-white"
                    : "bg-[#0C0C0F] border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                企业法人 / 承制公司
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">主要变现模式</label>
            <select
              value={monetizationModel}
              onChange={(e) => setMonetizationModel(e.target.value as any)}
              className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="applet">短剧小程序付费解锁 / 充值抽成</option>
              <option value="ad_revenue">抖音/快手短视频流量广告分成</option>
              <option value="overseas">海外 ReelShort / TikTok 出海变现</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Agency Package Purchase */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-400" />
          企业专属代办资质套餐
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-[#16161A] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-white/20 transition-all shadow-xl"
            >
              <div className="space-y-2">
                <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono">
                  {pkg.badge}
                </span>
                <h4 className="font-semibold text-xs text-white leading-snug">{pkg.title}</h4>
                <p className="text-xs text-slate-400">{pkg.desc}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-orange-400 font-mono">{pkg.price}</div>
                  <div className="text-[10px] text-slate-500">周期: {pkg.time}</div>
                </div>

                <button
                  onClick={() => alert(`代办申请【${pkg.title}】提交成功，企业顾问将在2小时内与您联系！`)}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  立即咨询代办
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Canvas Video Review & Frame Annotation Module */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-orange-400" />
            漫剧审片与画框打点批注系统 (Canvas Frame Review)
          </h3>
          <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg font-mono">
            支持坐标归一化 (x, y, w, h) & 圈画意见归档
          </span>
        </div>

        <VideoReviewCanvas
          videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          markers={reviewMarkers}
          onAddMarker={handleAddMarker}
        />
      </div>
    </div>
  );
};
