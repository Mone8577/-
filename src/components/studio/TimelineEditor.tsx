import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Mic,
  Clapperboard,
  Layers,
  Wand2,
  CheckCircle,
  Loader2,
  Sliders,
  Maximize2,
  Tv,
  Code,
  Copy,
  Cpu,
  Zap,
  X,
} from "lucide-react";
import { Episode, Storyboard, AspectRatio } from "../../types";

interface TimelineEditorProps {
  episode: Episode;
  onUpdateEpisode: (updatedEp: Episode) => void;
  onBreakdownScript: () => Promise<void>;
  isParsingScript: boolean;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  episode,
  onUpdateEpisode,
  onBreakdownScript,
  isParsingScript,
}) => {
  const [selectedShotId, setSelectedShotId] = useState<string | null>(
    episode.storyboards?.[0]?.id || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRenderingAll, setIsRenderingAll] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [isBuildingWorkflow, setIsBuildingWorkflow] = useState(false);

  const selectedShot = episode.storyboards?.find((sb) => sb.id === selectedShotId) || episode.storyboards?.[0];

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

  const handleComfyUIRender = async () => {
    if (!selectedShot) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch("/api/v1/comfyui/render-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: episode.project_id,
          shot_id: selectedShot.id,
          prompt_en: selectedShot.visual_prompt,
          negative_prompt: "low quality, blurry, distorted, bad anatomy",
          style_lora_name: "flux_manga_v2.safetensors",
          lora_weight: 0.85,
          ip_adapter_weight: 0.75,
          width: 720,
          height: 1280,
        }),
      });

      const data = await res.json();
      if (res.ok && data.image_url) {
        handleShotChange({ image_url: data.image_url });
        if (data.workflow) {
          setWorkflowData(data.workflow);
        }
      } else {
        alert(data.detail || "ComfyUI 跑图服务异常");
      }
    } catch (err: any) {
      console.error(err);
      alert("跑图渲染异常: " + err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleInspectWorkflow = async () => {
    if (!selectedShot) return;
    setIsBuildingWorkflow(true);
    try {
      const res = await fetch("/api/v1/comfyui/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_en: selectedShot.visual_prompt,
          negative_prompt: "low quality, blurry, distorted, bad anatomy",
          style_lora_name: "flux_manga_v2.safetensors",
          lora_weight: 0.85,
          character_ref_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
          ip_adapter_weight: 0.75,
          width: 720,
          height: 1280,
        }),
      });
      const data = await res.json();
      if (data.workflow) {
        setWorkflowData(data.workflow);
        setShowWorkflowModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBuildingWorkflow(false);
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
    }, 2500);
  };

  return (
    <div className="bg-[#16161A] border border-white/10 rounded-xl overflow-hidden shadow-2xl text-slate-100 flex flex-col">
      {/* Editor Header Bar */}
      <div className="p-4 bg-[#111114] border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              在线多轨剪辑与音画对齐
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-mono">
                {episode.storyboards?.length || 0} 个镜头
              </span>
            </h3>
            <p className="text-xs text-slate-400">{episode.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(!episode.storyboards || episode.storyboards.length === 0) && (
            <button
              onClick={onBreakdownScript}
              disabled={isParsingScript}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isParsingScript ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>LLM 镜头语言智能解析中...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>智能拆解镜头 (Script To Shots)</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleRenderAllShots}
            disabled={isRenderingAll || !episode.storyboards?.length}
            className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isRenderingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>ComfyUI + TTS 批量对齐渲染中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>一键对齐合成整集视频</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/10 bg-[#0C0C0F] min-h-[420px]">
        {/* Left: Active Shot High-Res Canvas & Controls (5 Cols) */}
        <div className="lg:col-span-5 p-4 border-r border-white/10 flex flex-col justify-between space-y-3 bg-[#0C0C0F]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                镜头 #{selectedShot?.shot_number || 1} 精修监视器
              </span>
              <span className="text-[10px] bg-black/40 text-orange-400 font-mono px-2 py-0.5 rounded border border-white/10">
                运镜: {selectedShot?.camera_movement || "zoom_in"}
              </span>
            </div>

            {/* Frame Aspect Canvas Container */}
            <div className="relative aspect-[9/16] max-h-[320px] mx-auto bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl group flex items-center justify-center">
              <img
                src={
                  selectedShot?.image_url ||
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"
                }
                alt="Shot Frame"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Watermark Overlay (Anti-leakage feature) */}
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono">
                Watermark: [USER-DEMO-662]
              </div>

              {/* Dialogue Overlay */}
              {selectedShot?.dialogue && (
                <div className="absolute bottom-3 inset-x-3 bg-black/85 backdrop-blur-md p-2.5 rounded-lg border border-white/10 text-center">
                  <p className="text-xs font-medium text-orange-300 leading-tight">
                    {selectedShot.dialogue}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Regenerate & Audio Trigger */}
          <div className="flex flex-col space-y-2 pt-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleComfyUIRender}
                disabled={isGeneratingImage || !selectedShot}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-medium py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>ComfyUI 节点跑图中...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-white fill-white" />
                    <span>ComfyUI 算力跑图 (5 Credits)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleInspectWorkflow}
                disabled={isBuildingWorkflow || !selectedShot}
                className="flex items-center space-x-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                title="查看 ComfyUI 节点 JSON 图"
              >
                {isBuildingWorkflow ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Code className="w-3.5 h-3.5 text-orange-400" />
                )}
                <span>JSON 工作流</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => alert("配音重新合成中 (CosyVoice TTS)...")}
                className="w-full flex items-center justify-center space-x-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-green-400" />
                <span>CosyVoice 重录配音</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Shot Parameters Inspector (7 Cols) */}
        <div className="lg:col-span-7 p-4 space-y-4 bg-[#16161A] overflow-y-auto">
          {selectedShot ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="font-semibold text-xs text-white">
                  镜头详细设定 (Shot Inspector - Shot #{selectedShot.shot_number})
                </h4>
                <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                  <span>语音预估:</span>
                  <span className="text-green-400 font-bold">
                    {selectedShot.audio_duration || 3.5} 秒
                  </span>
                </div>
              </div>

              {/* Visual Prompt Editor */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  画面 Prompt (Visual Description)
                </label>
                <textarea
                  rows={3}
                  value={selectedShot.visual_prompt || ""}
                  onChange={(e) => handleShotChange({ visual_prompt: e.target.value })}
                  className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Camera Movement Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    2.5D 相机运镜模式
                  </label>
                  <select
                    value={selectedShot.camera_movement || "zoom_in"}
                    onChange={(e) => handleShotChange({ camera_movement: e.target.value as any })}
                    className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="zoom_in">推镜 (Zoom In)</option>
                    <option value="zoom_out">拉镜 (Zoom Out)</option>
                    <option value="pan_left">左摇镜头 (Pan Left)</option>
                    <option value="pan_right">右摇镜头 (Pan Right)</option>
                    <option value="2.5d_tilt">2.5D 俯仰视角</option>
                    <option value="static">静止画格 (Static)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    台词对话 (Dialogue)
                  </label>
                  <input
                    type="text"
                    value={selectedShot.dialogue || ""}
                    onChange={(e) => handleShotChange({ dialogue: e.target.value })}
                    className="w-full bg-[#0C0C0F] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              点击上方“智能拆解镜头”开始生成画格序列
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline Tracks Section */}
      <div className="p-4 bg-[#111114] space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-orange-400" />
             Web 多轨时间线轴
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer shadow-md shadow-orange-500/20"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "暂停播放" : "实时对齐预览"}</span>
            </button>
          </div>
        </div>

        {/* Tracks Area */}
        <div className="space-y-2 bg-[#0C0C0F] p-3.5 rounded-xl border border-white/5 overflow-x-auto">
          {/* Track 1: Frame / Shot Track */}
          <div className="flex items-center space-x-3 py-1 min-w-[600px]">
            <div className="w-24 text-[11px] font-medium text-slate-300 flex items-center gap-1 shrink-0">
              <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
              画格运镜轨
            </div>
            <div className="flex-1 flex space-x-2">
              {episode.storyboards?.map((sb) => {
                const isSelected = selectedShotId === sb.id;
                return (
                  <div
                    key={sb.id}
                    onClick={() => setSelectedShotId(sb.id)}
                    className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all shrink-0 w-28 h-16 group ${
                      isSelected
                        ? "border-orange-500 ring-2 ring-orange-500/30 scale-105 z-10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <img
                      src={
                        sb.image_url ||
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"
                      }
                      alt={`Shot ${sb.shot_number}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.2 rounded text-[9px] font-bold text-white">
                      #{sb.shot_number}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-orange-500/90 text-white px-1 py-0.2 rounded text-[8px] font-mono">
                      {sb.audio_duration || 3.5}s
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 2: Dialogue Voice Track */}
          <div className="flex items-center space-x-3 py-1 min-w-[600px] border-t border-white/5">
            <div className="w-24 text-[11px] font-medium text-slate-300 flex items-center gap-1 shrink-0">
              <Mic className="w-3.5 h-3.5 text-green-400" />
              台词语音轨
            </div>
            <div className="flex-1 flex space-x-2">
              {episode.storyboards?.map((sb) => (
                <div
                  key={`audio-${sb.id}`}
                  className="w-28 h-8 bg-green-500/10 border border-green-500/20 rounded-md p-1.5 flex items-center justify-between text-[10px] text-green-300 truncate"
                >
                  <span className="truncate">{sb.dialogue || "台词对白..."}</span>
                  <Volume2 className="w-3 h-3 text-green-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Track 3: BGM Track */}
          <div className="flex items-center space-x-3 py-1 min-w-[600px] border-t border-white/5">
            <div className="w-24 text-[11px] font-medium text-slate-300 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              BGM 音效轨
            </div>
            <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-md h-7 px-3 flex items-center justify-between text-[10px] text-blue-300">
              <span>【爆款短剧热血BGM】修仙战龙 - 灵气复苏对决 (00:00 - 02:30)</span>
              <span className="font-mono text-blue-400">100% Vol</span>
            </div>
          </div>
        </div>
      </div>

      {/* ComfyUI Workflow JSON Inspector Modal */}
      {showWorkflowModal && workflowData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#16161A] border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl text-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 border border-orange-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    ComfyUI JSON 工作流图谱
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 font-mono">
                      FLUX.1 + LoRA + IP-Adapter
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    动态构建的 13 节点生成图谱 (WebSocket Client API Compliant)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWorkflowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0C0C0F] border border-white/10 rounded-xl p-3 font-mono text-xs text-green-400 overflow-x-auto max-h-[360px] leading-relaxed">
              <pre>{JSON.stringify(workflowData, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(workflowData, null, 2));
                  alert("已复制 ComfyUI Workflow JSON 到剪贴板！");
                }}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制 JSON</span>
              </button>

              <button
                onClick={() => {
                  setShowWorkflowModal(false);
                  handleComfyUIRender();
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>立即提交 ComfyUI 渲染 (5 Credits)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
