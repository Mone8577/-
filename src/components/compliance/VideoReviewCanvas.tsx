import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, MessageSquare, Plus, RotateCcw } from "lucide-react";
import { AnnotationMarker, BoundingBox } from "../../types";

interface VideoReviewCanvasProps {
  videoUrl: string;
  markers: AnnotationMarker[];
  onAddMarker: (marker: Omit<AnnotationMarker, "id" | "createdAt">) => void;
}

export default function VideoReviewCanvas({
  videoUrl,
  markers,
  onAddMarker,
}: VideoReviewCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 状态控制
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // 1. 同步 Canvas 尺寸与视频显示尺寸
  const syncCanvasSize = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      drawCanvasOverlay();
    }
  };

  useEffect(() => {
    window.addEventListener("resize", syncCanvasSize);
    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [currentBox, markers, activeMarkerId]);

  // 2. 绘制 Canvas（高亮框选 + 历史标记渲染）
  const drawCanvasOverlay = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // A. 绘制当前视频帧正在选中的历史 Marker
    const currentFrameMarkers = markers.filter(
      (m) => Math.abs(m.timestamp - currentTime) < 0.5
    );

    currentFrameMarkers.forEach((marker) => {
      const isSelected = marker.id === activeMarkerId;
      ctx.strokeStyle = isSelected ? "#ef4444" : "#f59e0b"; // 选中红，未选中黄
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.setLineDash(isSelected ? [] : [6, 4]);

      const x = marker.box.x * canvas.width;
      const y = marker.box.y * canvas.height;
      const w = marker.box.width * canvas.width;
      const h = marker.box.height * canvas.height;

      ctx.strokeRect(x, y, w, h);

      // 绘制 Label 标签
      ctx.fillStyle = isSelected ? "#ef4444" : "#f59e0b";
      ctx.fillRect(x, y - 24 > 0 ? y - 24 : y, Math.min(w, 120), 22);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.fillText(`批注: ${marker.author}`, x + 6, (y - 24 > 0 ? y - 24 : y) + 15);
    });

    // B. 绘制用户正在拉框的临时圈画区域
    if (currentBox) {
      ctx.strokeStyle = "#3b82f6"; // 蓝色正在绘制框
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(
        currentBox.x * canvas.width,
        currentBox.y * canvas.height,
        currentBox.width * canvas.width,
        currentBox.height * canvas.height
      );
      ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
      ctx.fillRect(
        currentBox.x * canvas.width,
        currentBox.y * canvas.height,
        currentBox.width * canvas.width,
        currentBox.height * canvas.height
      );
    }
  };

  useEffect(() => {
    drawCanvasOverlay();
  }, [currentTime, currentBox, markers, activeMarkerId]);

  // 3. 视频播放与时间更新
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setCurrentBox(null); // 播放时清除未提交的画框
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 4. Canvas 鼠标拖拽框选逻辑
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return; // 播放状态下不允许画框，避免误触
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / canvas.width;
    const currentY = (e.clientY - rect.top) / canvas.height;

    const box: BoundingBox = {
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      width: Math.abs(currentX - startPoint.x),
      height: Math.abs(currentY - startPoint.y),
    };

    setCurrentBox(box);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // 5. 提交当前圈画与意见
  const handleSaveMarker = () => {
    if (!currentBox || !commentInput.trim()) return;

    onAddMarker({
      timestamp: currentTime,
      box: currentBox,
      comment: commentInput,
      author: "导演/审片员",
    });

    // 重置状态
    setCurrentBox(null);
    setCommentInput("");
  };

  // 格式化时间显示 (例如 01:23)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-slate-900 p-6 rounded-xl text-white max-w-7xl mx-auto shadow-2xl border border-white/10">
      {/* 左侧：视频与 Canvas 圈画主界面 */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-full aspect-[9/16] max-w-[360px] bg-black rounded-lg overflow-hidden border border-slate-800 shadow-inner group">
          {/* 视频主体 */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration);
              syncCanvasSize();
            }}
          />

          {/* 覆盖在视频上的 Canvas 画板 */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-10 ${
              !isPlaying ? "cursor-crosshair" : "cursor-pointer"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />

          {/* 状态提示 overlay */}
          {!isPlaying && !currentBox && (
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-slate-300 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              已暂停：拖动鼠标在画面上圈画批注
            </div>
          )}
        </div>

        {/* 视频控制条 */}
        <div className="w-full max-w-[360px] mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = time;
              setCurrentTime(time);
            }}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex justify-center items-center gap-4 mt-1">
            <button
              onClick={togglePlay}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full transition text-white shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 右侧：修改意见打点面板 */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-slate-700 pb-3">
          <MessageSquare className="text-blue-400" size={20} />
          审片批注列表 ({markers.length})
        </h3>

        {/* A. 正在新建批注的输入区域 */}
        {currentBox && (
          <div className="mb-4 p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-blue-400 font-medium">
              <span>在 {formatTime(currentTime)} 处添加打点</span>
              <button
                onClick={() => setCurrentBox(null)}
                className="hover:text-red-400 transition cursor-pointer"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="请输入修改意见（如：手部六指畸形需要重绘，背景缺少古风建筑）..."
              className="w-full h-20 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={handleSaveMarker}
              disabled={!commentInput.trim()}
              className="w-full py-2 bg-blue-600 disabled:bg-slate-700 hover:bg-blue-500 rounded text-sm font-medium transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus size={16} /> 保存审片意见
            </button>
          </div>
        )}

        {/* B. 批注时间轴打点列表 */}
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[480px] pr-1">
          {markers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              暂停视频并在画面上拖动鼠标，
              <br />
              即可添加定位批注。
            </div>
          ) : (
            markers.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = item.timestamp;
                  setCurrentTime(item.timestamp);
                  setActiveMarkerId(item.id);
                }}
                className={`p-3 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                  activeMarkerId === item.id
                    ? "bg-slate-700/80 border-amber-500/80 shadow-md"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    ⏱ {formatTime(item.timestamp)}
                  </span>
                  <span className="text-xs text-slate-400">{item.author}</span>
                </div>
                <p className="text-sm text-slate-200 line-clamp-2">{item.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
