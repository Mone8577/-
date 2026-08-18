import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { CreateProjectModal } from "./components/studio/CreateProjectModal";
import { CentralControlPanel } from "./components/studio/CentralControlPanel";
import { ScriptImporter } from "./components/studio/ScriptImporter";
import { TimelineEditor } from "./components/studio/TimelineEditor";
import { PublishingMatrix } from "./components/publishing/PublishingMatrix";
import { MarketplaceView } from "./components/matchmaking/MarketplaceView";
import { ComplianceCenter } from "./components/compliance/ComplianceCenter";
import { AssetCenter } from "./components/assets/AssetCenter";
import { ComputeDashboard } from "./components/compute/ComputeDashboard";
import { Project, Episode, ProjectCharacter, ProjectScene } from "./types";
import {
  Layers,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Film,
  Lock,
  ChevronRight,
  FileCode2,
  Unlock,
} from "lucide-react";

export type StudioStage = "script_lobby" | "central_control" | "episode_studio";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("studio");
  const [studioStage, setStudioStage] = useState<StudioStage>("script_lobby");

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [credits, setCredits] = useState(10000);

  // Script Generation State with Step-by-Step progress feedback
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generationStepText, setGenerationStepText] = useState("");
  const [isParsingScript, setIsParsingScript] = useState(false);

  // Fetch initial projects
  useEffect(() => {
    fetchProjects();
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/v1/credits/account");
      const data = await res.json();
      if (data.user_credit?.balance !== undefined) {
        setCredits(data.user_credit.balance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        setCurrentProject(data.projects[0]);
        if (data.projects[0].episodes?.length > 0) {
          setCurrentEpisode(data.projects[0].episodes[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const handleCreateProject = async (projData: any) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projData),
      });
      const data = await res.json();
      if (data.project) {
        setProjects([data.project, ...projects]);
        setCurrentProject(data.project);
        setCurrentEpisode(null);
        // 新建后进入阶段二配置资产
        setStudioStage("central_control");
      }
    } catch (err) {
      console.error("Create project error:", err);
    }
  };

  const handleUpdateProject = async (updatedFields: Partial<Project>) => {
    if (!currentProject) return;
    const updated = { ...currentProject, ...updatedFields };
    setCurrentProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));

    try {
      await fetch(`/api/projects/${currentProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLockAssets = async (locked: boolean) => {
    if (!currentProject) return;
    const endpoint = locked
      ? `/api/projects/${currentProject.id}/lock-assets`
      : `/api/projects/${currentProject.id}/unlock-assets`;

    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (data.project) {
        setCurrentProject(data.project);
        setProjects(projects.map((p) => (p.id === data.project.id ? data.project : p)));
      }
    } catch (e) {
      console.error("Failed to toggle asset lock:", e);
    }
  };

  const handleAddCharacter = async (charData: Partial<ProjectCharacter>) => {
    if (!currentProject) return;
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(charData),
      });
      const data = await res.json();
      if (data.project) {
        setCurrentProject(data.project);
        setProjects(projects.map((p) => (p.id === data.project.id ? data.project : p)));
      }
    } catch (err) {
      console.error("Add character error:", err);
    }
  };

  const handleAddScene = async (sceneData: Partial<ProjectScene>) => {
    if (!currentProject) return;
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sceneData),
      });
      const data = await res.json();
      if (data.project) {
        setCurrentProject(data.project);
        setProjects(projects.map((p) => (p.id === data.project.id ? data.project : p)));
      }
    } catch (err) {
      console.error("Add scene error:", err);
    }
  };

  // 页面 1 的一键生成核心入口 ➔ 动态步骤转场 ➔ 自动跳转到阶段二
  const handleStartScriptGeneration = async (payload: {
    genre: string;
    prompt: string;
    targetEpisodes: number;
    rawText?: string;
  }) => {
    setIsGeneratingScript(true);
    setGenerationStepText("[1/3] Gemini 3.6 正在清洗剧本并生成黄金剧情卡点...");

    try {
      const res = await fetch("/api/ai/incubate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: payload.genre,
          prompt: payload.prompt || payload.rawText,
          target_episodes: payload.targetEpisodes,
        }),
      });
      const data = await res.json();

      setGenerationStepText("[2/3] 正在解耦主角立绘、服装变体与专属音色 Seed...");
      await new Promise((r) => setTimeout(r, 600));

      setGenerationStepText("[3/3] 正在立项并组装阶段二中央控制确权资产...");
      await new Promise((r) => setTimeout(r, 600));

      const newProjId = `proj-${Date.now()}`;
      const newEpisodes: Episode[] = (data.episodes || []).map((ep: any, idx: number) => ({
        id: `ep-${Date.now()}-${idx}`,
        project_id: newProjId,
        episode_number: ep.episode_number || idx + 1,
        title: ep.title || `第 ${idx + 1} 集：风云际会`,
        raw_script: ep.raw_script || payload.rawText || "",
        hook_point: ep.hook_point || "黄金高潮反转卡点",
        status: "pending",
        created_at: new Date().toISOString(),
        storyboards: [],
      }));

      const newCharacters: ProjectCharacter[] = (data.main_characters || [
        { name: "主角", gender: "男", visual_description: "黑发修长，双眸如电", default_outfit: "黑风衣" }
      ]).map((mc: any, idx: number) => ({
        id: `char-${Date.now()}-${idx}`,
        project_id: newProjId,
        name: mc.name || "主角",
        gender: mc.gender || "男",
        visual_description: mc.visual_description || "五官深邃立体",
        ref_image_urls: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
        ],
        outfits: [
          {
            id: `outfit-${Date.now()}-${idx}-1`,
            name: mc.default_outfit || "默认常服",
            description: "日常装束",
            is_default: true,
          },
          {
            id: `outfit-${Date.now()}-${idx}-2`,
            name: "高潮战斗装",
            description: "打斗场景服装解耦",
            is_default: false,
          },
        ],
        voice_name: mc.voice_type || "霸道冷酷少年音 (CosyVoice-Seed #8821)",
        voice_seed_param: `seed_custom_${Math.floor(Math.random() * 9000 + 1000)}`,
        created_at: new Date().toISOString(),
      }));

      const createdProject: Project = {
        id: newProjId,
        user_id: "usr-current",
        title: `${payload.genre}：${payload.prompt?.slice(0, 14) || "爆款新剧"}`,
        description: payload.prompt || "Seedance 2.5 原生多模态漫剧工程",
        cover_url:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
        aspect_ratio: "9:16",
        style_preset: payload.genre,
        is_assets_locked: false,
        global_style_config: {
          base_model: "Seedance 2.5 Multimodal Engine",
          style_lora: `${payload.genre}_Masterpiece (Weight: 0.85)`,
          negative_prompt: "blurry, low quality, bad anatomy, deformed face, distorted hands",
        },
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        characters: newCharacters,
        scenes: [
          {
            id: `scene-${Date.now()}-1`,
            project_id: newProjId,
            name: "主剧情大厅/核心场景",
            description: "光影戏剧化的高潮对决主场景",
            env_prompt: "Cinematic anime scenic background, dramatic sunset, Unreal Engine 5",
            ref_image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
            created_at: new Date().toISOString(),
          },
        ],
        episodes: newEpisodes,
      };

      setProjects([createdProject, ...projects]);
      setCurrentProject(createdProject);
      if (newEpisodes.length > 0) {
        setCurrentEpisode(newEpisodes[0]);
      }

      // 整页跳转到阶段二：中央控制台
      setStudioStage("central_control");
    } catch (err) {
      console.error(err);
      alert("剧本生成异常，已载入默认大纲");
    } finally {
      setIsGeneratingScript(false);
      setGenerationStepText("");
    }
  };

  const handleUpdateEpisode = (updatedEp: Episode) => {
    if (!currentProject) return;
    const updatedEpisodes = currentProject.episodes?.map((ep) =>
      ep.id === updatedEp.id ? updatedEp : ep
    );
    const updatedProject = { ...currentProject, episodes: updatedEpisodes };
    setCurrentProject(updatedProject);
    setCurrentEpisode(updatedEp);
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleBreakdownScript = async () => {
    if (!currentEpisode || !currentProject) return;
    setIsParsingScript(true);
    try {
      const res = await fetch("/api/v1/storyboards/parse-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject.id,
          episode_id: currentEpisode.id,
          raw_script_text: currentEpisode.raw_script,
        }),
      });
      const data = await res.json();

      if (data.storyboards) {
        const storyboards = data.storyboards.map((sb: any, idx: number) => ({
          id: `sb-${Date.now()}-${idx + 1}`,
          episode_id: currentEpisode.id,
          project_id: currentProject.id,
          shot_number: sb.shot_number || idx + 1,
          camera_movement: sb.camera_movement || "zoom_in",
          visual_prompt: sb.visual_prompt_en || sb.visual_prompt || "Manga drama scene",
          dialogue: sb.dialogue || "",
          speaker_character_name: sb.speaker_character_name || sb.speaker_name || "",
          speaker_character_id:
            currentProject.characters?.find(
              (c) => c.name === (sb.speaker_character_name || sb.speaker_name)
            )?.id || currentProject.characters?.[0]?.id,
          image_url:
            sb.image_url ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
          audio_duration: sb.audio_duration || 3.5,
          render_engine: "seedance_2.5",
          created_at: new Date().toISOString(),
        }));

        handleUpdateEpisode({
          ...currentEpisode,
          storyboards,
          hook_point: data.gold_hook || currentEpisode.hook_point,
          status: "parsed",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingScript(false);
    }
  };

  const isAssetsLocked = currentProject?.is_assets_locked ?? false;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 font-sans antialiased selection:bg-orange-500 selection:text-white pb-16">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
        }}
        projects={projects}
        currentProject={currentProject}
        setCurrentProject={(p) => {
          setCurrentProject(p);
          if (p.episodes?.length > 0) setCurrentEpisode(p.episodes[0]);
        }}
        currentEpisode={currentEpisode}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        credits={credits}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* TAB 1: STUDIO (3-STAGE INDEPENDENT STEP WIZARD ROUTING) */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            {/* Step Wizard Progress Breadcrumb Bar */}
            <div className="bg-[#16161A] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs shadow-xl">
              <div className="flex items-center space-x-2">
                {/* Step 1 Tab Button */}
                <button
                  onClick={() => setStudioStage("script_lobby")}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    studioStage === "script_lobby"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px]">
                    01
                  </span>
                  <span>漫剧项目大厅与剧本立项</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

                {/* Step 2 Tab Button */}
                <button
                  onClick={() => {
                    if (currentProject) setStudioStage("central_control");
                  }}
                  disabled={!currentProject}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-30 ${
                    studioStage === "central_control"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px]">
                    02
                  </span>
                  <span>中央控制台 · 资产确权</span>
                  {isAssetsLocked ? (
                    <Lock className="w-3 h-3 text-green-400" />
                  ) : (
                    <Unlock className="w-3 h-3 text-amber-400" />
                  )}
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

                {/* Step 3 Tab Button */}
                <button
                  onClick={() => {
                    if (currentProject && isAssetsLocked) {
                      setStudioStage("episode_studio");
                    } else if (currentProject && !isAssetsLocked) {
                      alert("⚠️ 请先在【阶段二：中央控制台】确认并一键锁定资产后，再进入阶段三制作室！");
                    }
                  }}
                  disabled={!currentProject}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-30 ${
                    studioStage === "episode_studio"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : isAssetsLocked
                      ? "text-slate-300 hover:text-white hover:bg-white/5"
                      : "text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px]">
                    03
                  </span>
                  <span>分集流水线 · Seedance 制作室</span>
                </button>
              </div>

              {/* Quick Project Info on right */}
              {currentProject && (
                <div className="text-[11px] text-slate-400 flex items-center gap-2 pr-2">
                  <span>当前项目:</span>
                  <span className="text-slate-200 font-semibold bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    {currentProject.title}
                  </span>
                </div>
              )}
            </div>

            {/* PAGE 1: SCRIPT & PROJECT LOBBY */}
            {studioStage === "script_lobby" && (
              <ScriptImporter
                projects={projects}
                currentProject={currentProject}
                onSelectProject={(proj, targetStage) => {
                  setCurrentProject(proj);
                  if (proj.episodes?.length > 0) setCurrentEpisode(proj.episodes[0]);
                  setStudioStage(targetStage || "central_control");
                }}
                onOpenCreateProjectModal={() => setIsCreateModalOpen(true)}
                onStartScriptGeneration={handleStartScriptGeneration}
                isGenerating={isGeneratingScript}
                generationStepText={generationStepText}
              />
            )}

            {/* PAGE 2: CENTRAL CONTROL GATEKEEPER PANEL */}
            {studioStage === "central_control" && currentProject && (
              <CentralControlPanel
                project={currentProject}
                onUpdateProject={handleUpdateProject}
                onAddCharacter={handleAddCharacter}
                onAddScene={handleAddScene}
                onSelectEpisode={setCurrentEpisode}
                selectedEpisode={currentEpisode}
                onToggleLockAssets={handleToggleLockAssets}
                onProceedToTimeline={() => setStudioStage("episode_studio")}
                onBackToLobby={() => setStudioStage("script_lobby")}
              />
            )}

            {/* PAGE 3: TIMELINE & SEEDANCE MULTIMODAL STUDIO */}
            {studioStage === "episode_studio" && currentProject && (
              currentEpisode ? (
                <TimelineEditor
                  episode={currentEpisode}
                  project={currentProject}
                  onUpdateEpisode={handleUpdateEpisode}
                  onBreakdownScript={handleBreakdownScript}
                  isParsingScript={isParsingScript}
                  onBackToCentralControl={() => setStudioStage("central_control")}
                  onNavigateTab={setActiveTab}
                />
              ) : (
                <div className="bg-[#16161A] border border-white/10 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                  <p>当前项目暂无分集数据，请返回阶段二添加分集或返回阶段一大厅导入剧本。</p>
                  <button
                    onClick={() => setStudioStage("central_control")}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs"
                  >
                    返回中央控制台
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 2: PUBLISHING MATRIX */}
        {activeTab === "publishing" && <PublishingMatrix project={currentProject} />}

        {/* TAB 3: MATCHMAKING MARKETPLACE */}
        {activeTab === "marketplace" && <MarketplaceView />}

        {/* TAB 4: COMPLIANCE CENTER */}
        {activeTab === "compliance" && <ComplianceCenter />}

        {/* TAB 5: INSPIRATION & ASSET CENTER */}
        {activeTab === "assets" && <AssetCenter />}

        {/* TAB 6: COMPUTE DASHBOARD */}
        {activeTab === "compute" && (
          <ComputeDashboard
            credits={credits}
            onTopUpCredits={(amount) => setCredits((c) => c + amount)}
          />
        )}
      </main>

      {/* Modal for Creating New Manga Drama Project */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
