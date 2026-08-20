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
import { Project, Episode, ProjectCharacter, ProjectScene, STYLE_PRESET_CARDS, ThemeKey, THEME_CONFIGS } from "./types";

export type StudioStage = "script_lobby" | "central_control" | "episode_studio";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("studio");
  const [studioStage, setStudioStage] = useState<StudioStage>("script_lobby");

  // 🌟 明亮主题状态管理 (默认: 日光雅致 Daylight Amber)
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("amber_daylight");

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [credits, setCredits] = useState(7807);

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
    stylePresetId?: string;
    rawText?: string;
  }) => {
    setIsGeneratingScript(true);
    setGenerationStepText("[1/3] Gemini 3.6 正在清洗剧本并切分黄金剧情卡点...");

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

      setGenerationStepText("[2/3] 正在挂载画风 LoRA，解耦主角立绘、服装与 CosyVoice 音色...");
      await new Promise((r) => setTimeout(r, 600));

      setGenerationStepText("[3/3] 正在立项并组装阶段二中央控制确权资产...");
      await new Promise((r) => setTimeout(r, 600));

      const matchedPreset =
        STYLE_PRESET_CARDS.find((s) => s.id === payload.stylePresetId) ||
        STYLE_PRESET_CARDS[0];

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
        { name: "主角", gender: "男", visual_description: "五官深邃立体，目光如炬", default_outfit: "黑风衣" },
      ]).map((mc: any, idx: number) => ({
        id: `char-${Date.now()}-${idx}`,
        project_id: newProjId,
        name: mc.name || "主角",
        gender: mc.gender || "男",
        visual_description: `${mc.visual_description || "五官深邃立体"} [画风锁定: ${matchedPreset.name}]`,
        ref_image_urls: [
          matchedPreset.preview_image,
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60",
        ],
        outfits: [
          {
            id: `outfit-${Date.now()}-${idx}-1`,
            name: mc.default_outfit || "基础常服",
            description: `日常装束 · 遵从 ${matchedPreset.name} 视觉规范`,
            ref_image_url: matchedPreset.preview_image,
            is_default: true,
          },
          {
            id: `outfit-${Date.now()}-${idx}-2`,
            name: "高潮战斗/宴会特殊装",
            description: `特殊场景服装解耦 · 遵从 ${matchedPreset.name} 视觉规范`,
            ref_image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
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
        cover_url: matchedPreset.preview_image,
        aspect_ratio: "9:16",
        style_preset: matchedPreset.name,
        status: "draft",
        is_assets_locked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        global_style_config: {
          base_model: "Seedance 2.5 Multimodal Engine",
          style_lora: matchedPreset.lora_id,
          negative_prompt: matchedPreset.default_negative,
        },
        characters: newCharacters,
        scenes: [
          {
            id: `scene-${Date.now()}-1`,
            project_id: newProjId,
            name: "核心主场景一",
            description: `主线冲突发生地 · 遵从 ${matchedPreset.name} 风格渲染`,
            env_prompt: `Dramatic cinematic scenery in ${matchedPreset.name} style, high quality dynamic lighting`,
            ref_image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
            created_at: new Date().toISOString(),
          },
          {
            id: `scene-${Date.now()}-2`,
            project_id: newProjId,
            name: "高潮对决场景二",
            description: `反转与决战场景 · 遵从 ${matchedPreset.name} 风格渲染`,
            env_prompt: `Epic battle confrontation space, grunge and neon atmosphere in ${matchedPreset.name} style`,
            ref_image_url: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600",
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

      // 自动跳转到阶段二确权
      setStudioStage("central_control");
    } catch (err) {
      console.error(err);
      alert("立项生成异常，请检查网络后重试");
    } finally {
      setIsGeneratingScript(false);
      setGenerationStepText("");
    }
  };

  const handleUpdateEpisode = async (updatedEp: Episode) => {
    if (!currentProject) return;
    setCurrentEpisode(updatedEp);
    const updatedEpisodes = currentProject.episodes.map((ep) =>
      ep.id === updatedEp.id ? updatedEp : ep
    );
    const updatedProj = { ...currentProject, episodes: updatedEpisodes };
    setCurrentProject(updatedProj);
    setProjects(projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)));

    try {
      await fetch(`/api/episodes/${updatedEp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEp),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleBreakdownScript = async () => {
    if (!currentEpisode || !currentProject) return;
    setIsParsingScript(true);
    try {
      const res = await fetch(`/api/episodes/${currentEpisode.id}/breakdown-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_script: currentEpisode.raw_script,
          style_preset: currentProject.style_preset,
        }),
      });
      const data = await res.json();
      if (data.storyboards) {
        const updatedEp: Episode = {
          ...currentEpisode,
          storyboards: data.storyboards,
          status: "ready",
        };
        handleUpdateEpisode(updatedEp);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingScript(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. Global Navigation Bar (晶透明亮风格) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projects={projects}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        currentEpisode={currentEpisode}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        credits={credits}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* 2. Full-Screen Main Workspace Container (移除 max-w-7xl 束缚，100% 满屏通栏) */}
      <main className="flex-1 w-full flex flex-col overflow-hidden">
        {/* TAB 1: MANGA DRAMA STUDIO (3 STAGES FULL SCREEN) */}
        {activeTab === "studio" && (
          <div className="flex-1 w-full flex flex-col">
            {/* PAGE 1: SCRIPT & PROJECT LOBBY (全屏双翼项目大厅) */}
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

            {/* PAGE 2: CENTRAL CONTROL GATEKEEPER PANEL (全屏中央资产确权室) */}
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

            {/* PAGE 3: TIMELINE & SEEDANCE MULTIMODAL STUDIO (全屏 4 大板块影视工业制作室) */}
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
                <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4 bg-white">
                  <p className="text-sm font-semibold">当前项目暂无分集数据，请返回阶段二添加分集或返回阶段一大厅立项。</p>
                  <button
                    onClick={() => setStudioStage("central_control")}
                    className="bg-black hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all"
                  >
                    返回中央控制台
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 2: PUBLISHING MATRIX */}
        {activeTab === "publishing" && (
          <div className="w-full p-6 flex-1">
            <PublishingMatrix project={currentProject} />
          </div>
        )}

        {/* TAB 3: MATCHMAKING MARKETPLACE */}
        {activeTab === "marketplace" && (
          <div className="w-full p-6 flex-1">
            <MarketplaceView />
          </div>
        )}

        {/* TAB 4: COMPLIANCE CENTER */}
        {activeTab === "compliance" && (
          <div className="w-full p-6 flex-1">
            <ComplianceCenter />
          </div>
        )}

        {/* TAB 5: INSPIRATION & ASSET CENTER */}
        {activeTab === "assets" && (
          <div className="w-full p-6 flex-1">
            <AssetCenter />
          </div>
        )}

        {/* TAB 6: COMPUTE DASHBOARD */}
        {activeTab === "compute" && (
          <div className="w-full p-6 flex-1">
            <ComputeDashboard
              credits={credits}
              onTopUpCredits={(amount) => setCredits((c) => c + amount)}
            />
          </div>
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
