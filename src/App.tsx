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
import { Project, Episode, ProjectCharacter } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("studio");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [credits, setCredits] = useState(12450);
  const [isParsingScript, setIsParsingScript] = useState(false);

  // Fetch initial projects from server
  useEffect(() => {
    fetchProjects();
  }, []);

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

  const handleImportScript = (newEpisodes: Episode[], mainCharacters?: any[]) => {
    if (!currentProject) return;

    let updatedChars = currentProject.characters || [];
    if (mainCharacters && mainCharacters.length > 0) {
      const createdChars: ProjectCharacter[] = mainCharacters.map((mc: any, idx: number) => ({
        id: `char-imported-${Date.now()}-${idx}`,
        project_id: currentProject.id,
        name: mc.name || "配角",
        gender: mc.gender || "未知",
        visual_description: mc.visual_description || "",
        ref_image_urls: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
        ],
        ip_adapter_weight: 0.75,
        voice_name: "CosyVoice Seed #8821",
        created_at: new Date().toISOString(),
      }));
      updatedChars = [...updatedChars, ...createdChars];
    }

    const updatedProject = {
      ...currentProject,
      characters: updatedChars,
      episodes: [...(currentProject.episodes || []), ...newEpisodes],
    };

    setCurrentProject(updatedProject);
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    if (newEpisodes.length > 0) {
      setCurrentEpisode(newEpisodes[0]);
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

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 font-sans antialiased selection:bg-orange-500 selection:text-white pb-12">
      {/* Top Navbar with Project Scope Breadcrumb */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* TAB 1: STUDIO WORKSPACE */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            {currentProject ? (
              <>
                {/* 1. Script Importer */}
                <ScriptImporter
                  project={currentProject}
                  onImportScript={handleImportScript}
                />

                {/* 2. Central Control Panel */}
                <CentralControlPanel
                  project={currentProject}
                  onUpdateProject={handleUpdateProject}
                  onAddCharacter={handleAddCharacter}
                  onSelectEpisode={setCurrentEpisode}
                  selectedEpisode={currentEpisode}
                />

                {/* 3. Timeline Editor */}
                {currentEpisode ? (
                  <TimelineEditor
                    episode={currentEpisode}
                    onUpdateEpisode={handleUpdateEpisode}
                    onBreakdownScript={handleBreakdownScript}
                    isParsingScript={isParsingScript}
                  />
                ) : (
                  <div className="bg-[#16161A] border border-white/10 rounded-xl p-8 text-center text-slate-400">
                    请在上方剧本三通道导入中生成或导入章节，即可进入多轨剪辑与音画对齐空间。
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#16161A] border border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-2xl">
                <h3 className="text-lg font-semibold text-white">暂无漫剧项目</h3>
                <p className="text-xs text-slate-400">
                  点击右上角【新建漫剧项目】即可开启隔离沙盒，体验 AIGC 全流程漫剧生成。
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  立刻创建第一个漫剧项目
                </button>
              </div>
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
