import React, { useState } from "react";
import {
  Briefcase,
  Shield,
  MessageSquare,
  DollarSign,
  Lock,
  Eye,
  CheckCircle,
  Clock,
  Send,
  Square,
  Circle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { EscrowOrder, VideoAnnotation } from "../../types";

export const MarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "review">("orders");
  const [selectedOrder, setSelectedOrder] = useState<EscrowOrder | null>(null);

  // Review & Annotation tool state
  const [currentTime, setCurrentTime] = useState(2.1);
  const [commentText, setCommentText] = useState("");
  const [drawType, setDrawType] = useState<"box" | "circle">("box");
  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([
    {
      id: "ann-1",
      submission_id: "sub-101",
      storyboard_id: "sb-1",
      time_code: 2.1,
      frame_number: 63,
      draw_data: { type: "box", coords: [100, 150, 320, 380], color: "#EF4444" },
      comment_text: "眼神杀气需要强化，灵气粒子微粒建议换成极光金，提高高级感。",
      reviewer_type: "publisher",
      status: "open",
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const orders: EscrowOrder[] = [
    {
      id: "ord-1",
      title: "【腾讯动漫正版授权】《九天龙尊》30集长篇短剧承制",
      publisher: "腾讯动漫 / 华策影视",
      publisher_logo: "https://images.unsplash.com/photo-1563089145-599997674d42?w=100",
      budget: 150000,
      episodes_count: 30,
      aspect_ratio: "9:16",
      style_requirement: "FLUX.1 3D国漫风格, 必须严格使用官方提供的角色人设与音色Seed",
      deadline: "2026-09-15",
      status: "open",
      sandbox_read_only: true,
      watermark_text: "WATERMARK_ESCROW_SANDBOX_7710",
    },
    {
      id: "ord-2",
      title: "【番茄小说爆款】《重生之神级神医》10集承制分包",
      publisher: "番茄短剧承制工作室",
      budget: 45000,
      episodes_count: 10,
      aspect_ratio: "9:16",
      style_requirement: "2D Webtoon 高对比度，黄金钩子卡点严格对齐",
      deadline: "2026-08-30",
      status: "in_progress",
      sandbox_read_only: true,
      watermark_text: "WATERMARK_ESCROW_SANDBOX_3319",
    },
  ];

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newAnn: VideoAnnotation = {
      id: `ann-${Date.now()}`,
      submission_id: "sub-101",
      storyboard_id: "sb-1",
      time_code: currentTime,
      frame_number: Math.round(currentTime * 30),
      draw_data: { type: drawType, coords: [120, 180, 280, 340], color: "#EF4444" },
      comment_text: commentText,
      reviewer_type: "publisher",
      status: "open",
      created_at: new Date().toISOString(),
    };
    setAnnotations([newAnn, ...annotations]);
    setCommentText("");
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Tab Switcher */}
      <div className="bg-[#16161A] border border-white/10 p-2 rounded-xl flex items-center justify-between flex-wrap gap-2 shadow-lg">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>上下游担保撮合广场</span>
          </button>

          <button
            onClick={() => setActiveTab("review")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "review"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>沙盒审片与按帧打点批注</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 pr-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>资金由平台全额担保托管，按集交付打款</span>
        </div>
      </div>

      {/* 1. Orders Marketplace Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-[#16161A] border border-white/10 p-5 rounded-xl space-y-4 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono">
                        {ord.publisher}
                      </span>
                      <h3 className="font-semibold text-sm text-white mt-1.5">{ord.title}</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-orange-400 font-mono">
                        ¥ {ord.budget.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">{ord.episodes_count} 集交付</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 bg-[#0C0C0F] p-2.5 rounded-lg border border-white/10">
                    <span className="font-semibold text-slate-300">画风与规范：</span>
                    {ord.style_requirement}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-green-400">
                      <Lock className="w-3.5 h-3.5" />
                      沙盒只读授权防泄露
                    </span>
                    <span>截止日期: {ord.deadline}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">平台托管担保中</span>
                  <button
                    onClick={() => {
                      setSelectedOrder(ord);
                      setActiveTab("review");
                    }}
                    className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    <span>接单并进入沙盒预览</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Sandbox Review & Frame Annotation Studio */}
      {activeTab === "review" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Frame Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-[#16161A] border border-white/10 p-5 rounded-xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-400" />
                在线按帧打点圈画批注
              </h3>
              <span className="text-xs text-green-400 font-mono bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30">
                隐形盲水印保护中
              </span>
            </div>

            {/* Video Frame Interactive Canvas */}
            <div className="relative aspect-[9/16] max-h-[380px] mx-auto bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"
                alt="Frame Review"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Draw Box Overlay Simulation */}
              <div
                className="absolute border-2 border-rose-500 bg-rose-500/20 rounded pointer-events-none"
                style={{ top: "30%", left: "25%", width: "40%", height: "35%" }}
              >
                <div className="absolute -top-5 left-0 bg-rose-600 text-white px-1.5 py-0.2 text-[9px] rounded font-bold font-mono">
                  #批注01 [2.1s]
                </div>
              </div>

              {/* Timestamp Indicator */}
              <div className="absolute bottom-3 left-3 bg-black/90 text-orange-400 font-mono px-2.5 py-1 rounded text-xs border border-white/10">
                精准时间轴: {currentTime.toFixed(1)}s (Frame #{Math.round(currentTime * 30)})
              </div>
            </div>

            {/* Annotation Draw Tools Toolbar */}
            <div className="flex items-center justify-between bg-[#0C0C0F] p-3 rounded-lg border border-white/10">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-slate-300">画笔批注工具:</span>
                <button
                  onClick={() => setDrawType("box")}
                  className={`p-1.5 rounded border cursor-pointer ${
                    drawType === "box"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-[#16161A] border-white/10 text-slate-400"
                  }`}
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDrawType("circle")}
                  className={`p-1.5 rounded border cursor-pointer ${
                    drawType === "circle"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-[#16161A] border-white/10 text-slate-400"
                  }`}
                >
                  <Circle className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400">
                暂停在精确帧即可画笔圈画提交修改意见
              </div>
            </div>
          </div>

          {/* Right: Annotations List & Submit (5 Cols) */}
          <div className="lg:col-span-5 bg-[#16161A] border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-white flex items-center justify-between border-b border-white/10 pb-3">
                <span>修改意见与打点批注 ({annotations.length})</span>
                <span className="text-xs font-mono text-orange-400">自动同步分镜 ID</span>
              </h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {annotations.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-[#0C0C0F] p-3 rounded-xl border border-white/10 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-orange-400 font-mono">
                        ⏱️ 时间码: {ann.time_code}s (Frame #{ann.frame_number})
                      </span>
                      <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.2 rounded">
                        {ann.reviewer_type === "publisher" ? "出品方意见" : "乙方回复"}
                      </span>
                    </div>

                    <p className="text-slate-200">{ann.comment_text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit New Note */}
            <form onSubmit={handleAddAnnotation} className="pt-3 border-t border-white/10 space-y-2">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="在当前时间码输入画格修改意见..."
                className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium text-xs rounded-lg flex items-center justify-center space-x-1 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>一键绑定分镜并提交批注</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
