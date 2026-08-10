import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// In-Memory Store for User Credits & Logs
let userCreditStore = {
  user_id: "user-default",
  balance: 10000,
  frozen_balance: 0,
  updated_at: new Date().toISOString(),
};

let creditLogsStore: any[] = [
  {
    id: "log-1",
    user_id: "user-default",
    project_id: "proj-1",
    amount: -5,
    action_type: "deduct",
    description: "LLM 脚本智能分镜解析 (Gemini 3.6 Flash)",
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "log-2",
    user_id: "user-default",
    project_id: "proj-1",
    amount: -15,
    action_type: "deduct",
    description: "ComfyUI 2.5D 运镜生图 (3镜头)",
    created_at: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    id: "log-3",
    user_id: "user-default",
    project_id: "proj-1",
    amount: -3,
    action_type: "deduct",
    description: "Zero-Shot 角色音色克隆 TTS (CosyVoice v2)",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// In-Memory Store for fast interactive demo persistence
let projectsDatabase: any[] = [
  {
    id: "proj-1",
    user_id: "user-default",
    title: "修仙归来：都市至尊",
    description: "一代仙尊重回少年时代，掌握神级医术与无敌剑法，横扫都市豪强！",
    cover_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60",
    aspect_ratio: "9:16",
    style_preset: "anime_2d",
    global_style_config: {
      base_model: "FLUX.1-Dev (Manga Edition)",
      style_lora: "Xianxia_Webtoon_V2 (Weight: 0.8)",
      negative_prompt: "blurry, low quality, bad anatomy, deformed face, distorted hands",
    },
    status: "processing",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    characters: [
      {
        id: "char-1",
        project_id: "proj-1",
        name: "叶空 (楚玄仙尊)",
        gender: "男",
        visual_description: "18岁少年，黑发修长，眼神如鹰，身穿休闲连帽衫，散发淡蓝色灵气光晕",
        ref_image_urls: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
        ],
        ip_adapter_weight: 0.75,
        voice_id: "voice-m1",
        voice_name: "霸道冷酷少男 (CosyVoice-Seed #8821)",
        created_at: new Date().toISOString(),
      },
      {
        id: "char-2",
        project_id: "proj-1",
        name: "林雪儿",
        gender: "女",
        visual_description: "江城第一豪门千金，长发及腰，白色长裙，气质高冷高贵",
        ref_image_urls: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60",
        ],
        ip_adapter_weight: 0.75,
        voice_id: "voice-f1",
        voice_name: "清冷御姐音 (CosyVoice-Seed #4102)",
        created_at: new Date().toISOString(),
      },
    ],
    episodes: [
      {
        id: "ep-1",
        project_id: "proj-1",
        episode_number: 1,
        title: "第一集：重回十八岁",
        raw_script: "叶空猛地睁开眼睛，环顾四周，发现自己回到了高中宿舍。看着镜子里的年轻面孔，他嘴角勾起一抹冷笑：“三百年了，本尊终于重回人间！”",
        hook_point: "黄金钩子：昔日仇敌推门而入，叶空凌空一指击碎大理石桌，震撼全场！",
        status: "ready",
        created_at: new Date().toISOString(),
        storyboards: [
          {
            id: "sb-1",
            episode_id: "ep-1",
            project_id: "proj-1",
            shot_number: 1,
            camera_movement: "zoom_in",
            visual_prompt: "特写：少年的眼睛猛地睁开，瞳孔闪烁着淡蓝色灵气符文，震撼的面部表情，高品质国漫画风",
            dialogue: "“这里是...江城高中宿舍？我楚玄仙尊居然没有死在雷劫之下？！”",
            speaker_character_id: "char-1",
            image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 3.8,
            video_motion_url: "",
            created_at: new Date().toISOString(),
          },
          {
            id: "sb-2",
            episode_id: "ep-1",
            project_id: "proj-1",
            shot_number: 2,
            camera_movement: "pan_right",
            visual_prompt: "中景：叶空走到宿舍全身镜前，伸手触摸镜面，镜子反射出年轻英俊却眼神深邃的少年",
            dialogue: "“三百年苦修，一朝重回少年时。前世欠我的，这一世我要你们加倍奉还！”",
            speaker_character_id: "char-1",
            image_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 4.5,
            video_motion_url: "",
            created_at: new Date().toISOString(),
          },
          {
            id: "sb-3",
            episode_id: "ep-1",
            project_id: "proj-1",
            shot_number: 3,
            camera_movement: "2.5d_tilt",
            visual_prompt: "远景/高潮：宿舍门被狠狠踢开，豪门恶霸恶狠狠走进来，叶空淡然抬手，指尖缠绕电光",
            dialogue: "“狗东西，跪下说话！”",
            speaker_character_id: "char-1",
            image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 2.9,
            video_motion_url: "",
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: "ep-2",
        project_id: "proj-1",
        episode_number: 2,
        title: "第二集：拍卖会的交锋",
        raw_script: "林家大拍卖会上，叶空凭一眼看出三百年九叶芝草，引起全场轰动。",
        hook_point: "黄金钩子：林雪儿主动递上黑金名片，全场名流惊呆！",
        status: "ready",
        created_at: new Date().toISOString(),
        storyboards: [
          {
            id: "sb-201",
            episode_id: "ep-2",
            project_id: "proj-1",
            shot_number: 1,
            camera_movement: "static",
            visual_prompt: "全景：豪华拍卖大厅，水晶吊灯熠熠生辉，台前展示着珍稀古药材",
            dialogue: "“此药看似百年灵芝，实则是罕见的九叶纯阳芝！”",
            speaker_character_id: "char-1",
            image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 3.5,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: "ep-3",
        project_id: "proj-1",
        episode_number: 3,
        title: "第三集：豪门病危与神医",
        raw_script: "林老太爷突然吐血倒地，全城名医束手无策，叶空掏出九根银针。",
        hook_point: "黄金钩子：九针渡劫，起死回生！",
        status: "pending",
        created_at: new Date().toISOString(),
        storyboards: [],
      },
    ],
  },
];

let annotationsDatabase: any[] = [
  {
    id: "ann-1",
    submission_id: "sub-101",
    storyboard_id: "sb-1",
    time_code: 2.1,
    frame_number: 63,
    draw_data: {
      type: "box",
      coords: [120, 200, 300, 380],
      color: "#EF4444",
    },
    comment_text: "眼神杀气需要再强化，灵气效果建议增加金光微粒。",
    reviewer_type: "publisher",
    status: "open",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

let publishTasksDatabase: any[] = [
  {
    id: "pub-1",
    project_id: "proj-1",
    user_id: "user-default",
    target_platforms: ["douyin", "kuaishou", "tiktok", "youtube"],
    episodes_to_publish: ["ep-1", "ep-2"],
    title: "【爆款漫剧】修仙归来：都市至尊 EP01-02 合集",
    description: "#漫剧 #短剧 #修仙 #爽文 重生归来，看我如何翻手为云覆手为雨！",
    schedule_type: "instant",
    status: "published",
    log_message: "全网4大平台分发成功，已获取抖音/TikTok API 视频直连 Token",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ---------------- API ENDPOINTS ---------------- //

// 1. Get Projects
app.get("/api/projects", (req, res) => {
  res.json({ projects: projectsDatabase });
});

// Create Project
app.post("/api/projects", (req, res) => {
  const { title, description, aspect_ratio, style_preset } = req.body;
  const newProj = {
    id: `proj-${Date.now()}`,
    user_id: "user-default",
    title: title || "未命名漫剧项目",
    description: description || "",
    cover_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60",
    aspect_ratio: aspect_ratio || "9:16",
    style_preset: style_preset || "anime_2d",
    global_style_config: {
      base_model: "FLUX.1-Dev",
      style_lora: "Webtoon_Master_V2 (0.75)",
      negative_prompt: "blurry, bad quality, deformed hands",
    },
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    characters: [],
    episodes: [],
  };
  projectsDatabase.unshift(newProj);
  res.json({ success: true, project: newProj });
});

// Update Project World/Style/Characters
app.put("/api/projects/:id", (req, res) => {
  const projIndex = projectsDatabase.findIndex((p) => p.id === req.params.id);
  if (projIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }
  projectsDatabase[projIndex] = {
    ...projectsDatabase[projIndex],
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  res.json({ success: true, project: projectsDatabase[projIndex] });
});

// Add Character
app.post("/api/projects/:id/characters", (req, res) => {
  const proj = projectsDatabase.find((p) => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const newChar = {
    id: `char-${Date.now()}`,
    project_id: proj.id,
    name: req.body.name || "新角色",
    gender: req.body.gender || "未知",
    visual_description: req.body.visual_description || "",
    ref_image_urls: req.body.ref_image_urls || [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
    ],
    ip_adapter_weight: req.body.ip_adapter_weight || 0.75,
    voice_id: req.body.voice_id || "voice-default",
    voice_name: req.body.voice_name || "默认男声 (CosyVoice)",
    created_at: new Date().toISOString(),
  };

  proj.characters.push(newChar);
  res.json({ success: true, character: newChar, project: proj });
});

// 2. AI Story Original Incubator (Gemini AI)
app.post("/api/ai/incubate-script", async (req, res) => {
  try {
    const { genre, prompt, target_episodes } = req.body;
    const systemPrompt = `你是一位顶级网文漫剧编剧大师。请根据用户提供的题材【${genre || "玄幻重生"}】和创意灵感【${prompt}】，创作一个包含完整起承转合、黄金钩子（Hook Point）与多集大纲的漫剧剧本。

返回标准 JSON 格式，严格符合以下结构：
{
  "title": "剧本名称",
  "synopsis": "剧情梗概与高能看点",
  "style_suggestion": "建议视觉画风风格",
  "main_characters": [
    { "name": "主角名", "gender": "男/女", "visual_description": "外貌与服装特征" }
  ],
  "episodes": [
    {
      "episode_number": 1,
      "title": "分集标题",
      "raw_script": "本集详细剧本文本与对白",
      "hook_point": "本集结尾黄金钩子卡点"
    }
  ]
}`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback mock if key not set
      return res.json({
        title: `【AI Incubated】${prompt.slice(0, 10)}...`,
        synopsis: "由AI孵化的爆款短剧剧本，包含强烈反转与高潮卡点。",
        style_suggestion: "国漫风玄幻 / 高对比度发光灵气",
        main_characters: [
          { name: "主角", gender: "男", visual_description: "黑发红瞳，身披墨色长袍，手持神剑" },
          { name: "女主", gender: "女", visual_description: "银发紫眸，仙气飘飘，手拿玉笛" }
        ],
        episodes: [
          {
            episode_number: 1,
            title: "第1集：异界觉醒",
            raw_script: "天地突变，主角在废墟中睁开双眼，体内封印的九天至尊龙魂轰然破封！",
            hook_point: "反派率众人逼近，主角一掌将山峰轰塌，震撼全场！"
          },
          {
            episode_number: 2,
            title: "第2集：神威赫赫",
            raw_script: "宗门长老赶到，欲将主角收为亲传弟子，主角冷笑拒绝。",
            hook_point: "主角展现超越宗主的惊天神识，全宗跪叩！"
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `生成 ${target_episodes || 3} 集漫剧剧本：${prompt}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("AI Incubate Error:", err);
    res.status(500).json({ error: err.message || "Failed to incubate script" });
  }
});

// 3. AI Script Breakdown to Storyboard JSON (Gemini AI Pipeline)
app.post("/api/v1/storyboards/parse-script", async (req, res) => {
  try {
    const { project_id, episode_id, raw_script_text } = req.body;

    // 1. Check if Project and Episode exist
    const project = projectsDatabase.find((p) => p.id === project_id);
    const episode = project?.episodes?.find((e: any) => e.id === episode_id);

    if (!project || !episode || episode.project_id !== project_id) {
      return res.status(400).json({ detail: "Episode 不存在或 Project ID 不匹配" });
    }

    const scriptToParse = raw_script_text || episode.raw_script || "";
    const charNames = (project.characters || []).map((c: any) => c.name).join(", ");

    const systemPrompt = `你是一位商业级漫剧导演与 AI 编剧 Agent。请对输入的漫剧章节剧本进行多通道结构化解析，提炼出黄金高潮卡点（gold_hook）与按镜头拆解的分镜列表（storyboards）。
已知角色列表参考: [${charNames}]

要求：
1. gold_hook: 本集结尾或高潮处的黄金钩子场景描写，极具悬念与冲击力。
2. storyboards 数组中的每一个 shot 元素包含：
   - shot_number: 镜头序号 (1, 2, 3...)
   - camera_movement: 镜头运镜风格 ("zoom_in", "zoom_out", "pan_left", "pan_right", "static", "2.5d_tilt")
   - visual_prompt_en: 高品质 Stable Diffusion / ComfyUI 画面描述 Prompt (包含环境、光影、人物面部表情、视觉特效、Webtoon 画风)
   - dialogue: 对应角色对白或旁白
   - speaker_character_name: 说话的角色姓名
3. 镜头节奏紧凑连贯，每集提取 3~6 个核心对齐画格。

请返回严格的 JSON 格式：
{
  "gold_hook": "黄金钩子：昔日仇敌推门而入，叶空凌空一指击碎大理石桌，震撼全场！",
  "storyboards": [
    {
      "shot_number": 1,
      "camera_movement": "zoom_in",
      "visual_prompt_en": "Close up shot of young male anime protagonist, eyes flashing glowing blue aura runes, intense expression, highly detailed masterpiece 8k",
      "dialogue": "“没想到三百年后，本尊真的重回少年时代了！”",
      "speaker_character_name": "叶空"
    }
  ]
}`;

    let parsedResult: { gold_hook: string; storyboards: any[] } = {
      gold_hook: "黄金钩子：高能反转与震撼名场面引爆看点！",
      storyboards: [],
    };

    if (!process.env.GEMINI_API_KEY) {
      parsedResult = {
        gold_hook: "黄金钩子：昔日仇敌推门逼近，主角凌空一指斩断灵木，全场肃然失色！",
        storyboards: [
          {
            shot_number: 1,
            camera_movement: "zoom_in",
            visual_prompt_en: "Close up of anime boy opening eyes with luminous blue magical runes in pupils, highly detailed webtoon style",
            dialogue: "“这里是...江城宿舍？我真的重生了！”",
            speaker_character_name: project.characters?.[0]?.name || "叶空",
          },
          {
            shot_number: 2,
            camera_movement: "pan_right",
            visual_prompt_en: "Medium shot of protagonist standing near window with sunset rays, floating cyan aura around fingertips",
            dialogue: "“前世所有欠我的，这一世统统还回来！”",
            speaker_character_name: project.characters?.[0]?.name || "叶空",
          },
          {
            shot_number: 3,
            camera_movement: "2.5d_tilt",
            visual_prompt_en: "Low angle wide shot of room door kicked open, antagonist entering with shocked expressions",
            dialogue: "“给我跪下！”",
            speaker_character_name: project.characters?.[0]?.name || "叶空",
          },
        ],
      };
    } else {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `项目标题: ${project.title}\n分集标题: ${episode.title}\n剧本正文:\n${scriptToParse}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      parsedResult = JSON.parse(response.text || "{}");
    }

    // 3. Save parsed storyboards & hook point to database in memory
    const generatedStoryboards = (parsedResult.storyboards || []).map((shot: any, idx: number) => ({
      id: `sb-${Date.now()}-${idx + 1}`,
      episode_id,
      project_id,
      shot_number: shot.shot_number || idx + 1,
      camera_movement: shot.camera_movement || "zoom_in",
      visual_prompt: shot.visual_prompt_en || shot.visual_prompt || "High quality manga scene",
      dialogue: shot.dialogue || "",
      speaker_character_name: shot.speaker_character_name || shot.speaker_name || "",
      speaker_character_id: project.characters?.find((c: any) => c.name === shot.speaker_character_name)?.id || project.characters?.[0]?.id,
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
      audio_url: "",
      audio_duration: 3.5,
      created_at: new Date().toISOString(),
    }));

    episode.storyboards = generatedStoryboards;
    episode.hook_point = parsedResult.gold_hook || episode.hook_point;
    episode.status = "parsed";

    return res.json(parsedResult);
  } catch (err: any) {
    console.error("Parse script endpoint error:", err);
    return res.status(500).json({ detail: `Gemini API 解析异常: ${err.message}` });
  }
});

app.post("/api/ai/parse-script", async (req, res) => {
  try {
    const { episode_title, script_text, characters, project_id, episode_id } = req.body;
    const charNames = (characters || []).map((c: any) => c.name).join(", ");

    const systemPrompt = `你是一位商业级漫剧导演与分镜师。请将传入的剧本文本，精准拆解为强结构化的分镜画格 JSON 数组。
角色列表参考: [${charNames}]

要求：
1. 每个画格包含：
   - shot_number: 序号
   - camera_movement: 镜头运镜 ("zoom_in", "zoom_out", "pan_left", "pan_right", "static", "2.5d_tilt")
   - visual_prompt: 极为详尽英文/中文 Stable Diffusion / ComfyUI 画格 Prompt
   - dialogue: 该画格对应台词/独白
   - speaker_name: 说话角色名
   - audio_duration: 预估语音时长(秒)
2. 节奏紧凑，每集包含 3~8 个精彩镜头，重点放大情绪冲突。

返回 JSON 格式：
{
  "gold_hook": "黄金钩子：精彩反转剧末钩子",
  "storyboards": [
    {
      "shot_number": 1,
      "camera_movement": "zoom_in",
      "visual_prompt": "Close-up of a young male anime protagonist opening eyes with luminous blue magical runes in pupils, highly detailed, masterpieces, 8k resolution",
      "dialogue": "“我竟然...真的重回少年时代了？！”",
      "speaker_name": "叶空",
      "audio_duration": 3.5
    }
  ]
}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        gold_hook: "黄金钩子：昔日仇敌推门而入，主角一掌毁桌震撼全场！",
        storyboards: [
          {
            shot_number: 1,
            camera_movement: "zoom_in",
            visual_prompt: "Close up shot of protagonist looking in shock, glowing eyes, cinematic webtoon style",
            dialogue: "“没想到真的重来了！”",
            speaker_name: characters?.[0]?.name || "主角",
            audio_duration: 3.2,
          },
          {
            shot_number: 2,
            camera_movement: "pan_right",
            visual_prompt: "Medium shot of protagonist standing in dorm room, sunset light beaming through window, dramatic atmosphere",
            dialogue: "“这一世，我不会再留下任何遗憾！”",
            speaker_name: characters?.[0]?.name || "主角",
            audio_duration: 4.0,
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `剧本分集标题: ${episode_title}\n剧本正文: ${script_text}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("AI Parse Script Error:", err);
    res.status(500).json({ error: err.message || "Failed to parse script" });
  }
});

// 4. Generate AI Image for Storyboard or Character (Gemini Flash Image)
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt, aspect_ratio } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback unsplash stock image
      const samples = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=60",
      ];
      const randomUrl = samples[Math.floor(Math.random() * samples.length)];
      return res.json({ image_url: randomUrl });
    }

    const mappedRatio = aspect_ratio === "16:9" ? "16:9" : aspect_ratio === "1:1" ? "1:1" : "9:16";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [{ text: `Digital manga drama anime art style: ${prompt}` }],
      },
      config: {
        imageConfig: {
          aspectRatio: mappedRatio,
        },
      },
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
    }

    res.json({ image_url: imageUrl });
  } catch (err: any) {
    console.error("AI Image Generation Error:", err);
    res.json({
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
      notice: "Used fallback rendering",
    });
  }
});

// 5. Annotations API (Reviewer frame notes)
app.get("/api/annotations", (req, res) => {
  res.json({ annotations: annotationsDatabase });
});

app.post("/api/annotations", (req, res) => {
  const newAnnotation = {
    id: `ann-${Date.now()}`,
    submission_id: req.body.submission_id || "sub-101",
    storyboard_id: req.body.storyboard_id || null,
    time_code: req.body.time_code || 0,
    frame_number: req.body.frame_number || 0,
    draw_data: req.body.draw_data || null,
    comment_text: req.body.comment_text || "",
    reviewer_type: req.body.reviewer_type || "publisher",
    status: "open",
    created_at: new Date().toISOString(),
  };
  annotationsDatabase.unshift(newAnnotation);
  res.json({ success: true, annotation: newAnnotation });
});

// 6. Publish Tasks
app.get("/api/publish-tasks", (req, res) => {
  res.json({ tasks: publishTasksDatabase });
});

app.post("/api/publish-tasks", (req, res) => {
  const newTask = {
    id: `pub-${Date.now()}`,
    project_id: req.body.project_id,
    user_id: "user-default",
    target_platforms: req.body.target_platforms || ["douyin", "kuaishou"],
    episodes_to_publish: req.body.episodes_to_publish || [],
    title: req.body.title || "全网矩阵连载分发",
    description: req.body.description || "",
    schedule_type: req.body.schedule_type || "instant",
    status: "published",
    log_message: "任务已提交至全网一键分发代理管线，数据推送中...",
    created_at: new Date().toISOString(),
  };
  publishTasksDatabase.unshift(newTask);
  res.json({ success: true, task: newTask });
});

// 7. CreditService Endpoints (Account Balance, Freeze, Finalize, Refund, Recharge)
app.get("/api/v1/credits/account", (req, res) => {
  res.json({
    user_credit: userCreditStore,
    logs: creditLogsStore,
  });
});

app.post("/api/v1/credits/freeze", (req, res) => {
  const { user_id, project_id, amount } = req.body;
  const numAmount = Number(amount) || 0;

  if (userCreditStore.balance < numAmount) {
    return res.status(402).json({
      detail: `算力余额不足！需 ${numAmount} 点，当前剩余 ${userCreditStore.balance} 点`,
    });
  }

  userCreditStore.balance -= numAmount;
  userCreditStore.frozen_balance += numAmount;
  userCreditStore.updated_at = new Date().toISOString();

  const log = {
    id: `log-${Date.now()}`,
    user_id: user_id || "user-default",
    project_id: project_id || null,
    amount: -numAmount,
    action_type: "freeze",
    description: `预冻结算力：分镜跑图任务 (${numAmount} Credits)`,
    created_at: new Date().toISOString(),
  };
  creditLogsStore.unshift(log);

  res.json({ success: true, message: "算力已预冻结", account: userCreditStore });
});

app.post("/api/v1/credits/finalize", (req, res) => {
  const { amount } = req.body;
  const numAmount = Number(amount) || 0;

  userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - numAmount);
  userCreditStore.updated_at = new Date().toISOString();

  res.json({ success: true, message: "算力已核销扣除", account: userCreditStore });
});

app.post("/api/v1/credits/refund", (req, res) => {
  const { user_id, project_id, amount, reason } = req.body;
  const numAmount = Number(amount) || 0;

  userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - numAmount);
  userCreditStore.balance += numAmount;
  userCreditStore.updated_at = new Date().toISOString();

  const log = {
    id: `log-${Date.now()}`,
    user_id: user_id || "user-default",
    project_id: project_id || null,
    amount: numAmount,
    action_type: "refund",
    description: `算力退还：${reason || "任务取消或异常"}`,
    created_at: new Date().toISOString(),
  };
  creditLogsStore.unshift(log);

  res.json({ success: true, message: "算力已退还", account: userCreditStore });
});

app.post("/api/v1/credits/recharge", (req, res) => {
  const { user_id, amount } = req.body;
  const numAmount = Number(amount) || 5000;

  userCreditStore.balance += numAmount;
  userCreditStore.updated_at = new Date().toISOString();

  const log = {
    id: `log-${Date.now()}`,
    user_id: user_id || "user-default",
    amount: numAmount,
    action_type: "recharge",
    description: `算力加购充值 (+${numAmount} Credits)`,
    created_at: new Date().toISOString(),
  };
  creditLogsStore.unshift(log);

  res.json({ success: true, balance: userCreditStore.balance, account: userCreditStore });
});

// --- ComfyUI Pipeline Integration ---
class ComfyUIWorkflowBuilder {
  static buildFluxLoraIpAdapterWorkflow(params: {
    prompt_en: string;
    negative_prompt?: string;
    style_lora_name?: string;
    lora_weight?: number;
    character_ref_image_url?: string | null;
    ip_adapter_weight?: number;
    width?: number;
    height?: number;
  }) {
    const prompt_en = params.prompt_en || "High quality manga scene, masterpiece, 8k";
    const negative_prompt = params.negative_prompt || "low quality, blurry, distorted, bad anatomy";
    const style_lora_name = params.style_lora_name || "flux_manga_v2.safetensors";
    const lora_weight = params.lora_weight ?? 0.85;
    const character_ref_image_url = params.character_ref_image_url || null;
    const ip_adapter_weight = params.ip_adapter_weight ?? 0.75;
    const width = params.width ?? 720;
    const height = params.height ?? 1280;

    const seed = Math.floor(Math.random() * 1000000000);

    const workflow: Record<string, any> = {
      "3": {
        inputs: {
          seed: seed,
          steps: 25,
          cfg: 7.0,
          sampler_name: "euler",
          scheduler: "normal",
          denoise: 1.0,
          model: ["10", 0],
          positive: ["6", 0],
          negative: ["7", 0],
          latent_image: ["5", 0],
        },
        class_type: "KSampler",
      },
      "5": {
        inputs: { width: width, height: height, batch_size: 1 },
        class_type: "EmptyLatentImage",
      },
      "6": {
        inputs: { text: prompt_en, clip: ["10", 1] },
        class_type: "CLIPTextEncode",
      },
      "7": {
        inputs: { text: negative_prompt, clip: ["10", 1] },
        class_type: "CLIPTextEncode",
      },
      "10": {
        inputs: {
          lora_name: style_lora_name,
          strength_model: lora_weight,
          strength_clip: lora_weight,
          model: ["11", 0],
          clip: ["11", 1],
        },
        class_type: "LoraLoader",
      },
      "11": {
        inputs: { ckpt_name: "flux1-dev.safetensors" },
        class_type: "CheckpointLoaderSimple",
      },
      "8": {
        inputs: { samples: ["3", 0], vae: ["11", 2] },
        class_type: "VAEDecode",
      },
      "9": {
        inputs: { filename_prefix: "MangaDrama", images: ["8", 0] },
        class_type: "SaveImage",
      },
    };

    if (character_ref_image_url) {
      workflow["12"] = {
        inputs: { image: character_ref_image_url, upload: "image" },
        class_type: "LoadImageFromUrl",
      };
      workflow["13"] = {
        inputs: {
          weight: ip_adapter_weight,
          model: ["10", 0],
          ipadapter: ["14", 0],
          image: ["12", 0],
        },
        class_type: "IPAdapterApply",
      };
      workflow["3"].inputs.model = ["13", 0];
    }

    return workflow;
  }
}

class ComfyUIAsyncClient {
  private host: string;
  private clientId: string;

  constructor() {
    this.host = process.env.COMFYUI_HOST || "127.0.0.1:8188";
    this.clientId = `client-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async submitAndRender(workflowPrompt: Record<string, any>): Promise<{ image_url: string; prompt_id: string }> {
    const postUrl = `http://${this.host}/prompt`;
    try {
      const resp = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: workflowPrompt, client_id: this.clientId }),
      });

      if (resp.ok) {
        const resData = await resp.json();
        const promptId = resData.prompt_id;
        const historyUrl = `http://${this.host}/history/${promptId}`;
        const histResp = await fetch(historyUrl);
        if (histResp.ok) {
          const history = await histResp.json();
          const outputs = history[promptId]?.outputs;
          if (outputs) {
            for (const nodeId of Object.keys(outputs)) {
              if (outputs[nodeId]?.images?.[0]) {
                const img = outputs[nodeId].images[0];
                return {
                  image_url: `http://${this.host}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=output`,
                  prompt_id: promptId,
                };
              }
            }
          }
        }
        return {
          image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
          prompt_id: promptId,
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
      prompt_id: `prompt-${Date.now()}`,
    };
  }
}

// 8. ComfyUI Workflow & Render API Endpoints
app.post("/api/v1/comfyui/workflow", (req, res) => {
  const workflow = ComfyUIWorkflowBuilder.buildFluxLoraIpAdapterWorkflow(req.body);
  res.json({ workflow });
});

app.post("/api/v1/comfyui/render-shot", async (req, res) => {
  const {
    project_id,
    shot_id,
    prompt_en,
    negative_prompt,
    style_lora_name,
    lora_weight,
    character_ref_image_url,
    ip_adapter_weight,
    width,
    height,
  } = req.body;

  const cost = 5;

  // 1. Credit freeze
  if (userCreditStore.balance < cost) {
    return res.status(402).json({
      detail: `算力余额不足！需 ${cost} Credits，当前剩余 ${userCreditStore.balance} Credits`,
    });
  }

  userCreditStore.balance -= cost;
  userCreditStore.frozen_balance += cost;
  userCreditStore.updated_at = new Date().toISOString();

  const freezeLog = {
    id: `log-${Date.now()}-freeze`,
    user_id: "user-default",
    project_id: project_id || null,
    amount: -cost,
    action_type: "freeze",
    description: `预冻结算力：ComfyUI 镜头生图 (#${shot_id || "shot"})`,
    created_at: new Date().toISOString(),
  };
  creditLogsStore.unshift(freezeLog);

  try {
    // 2. Build Workflow
    const workflow = ComfyUIWorkflowBuilder.buildFluxLoraIpAdapterWorkflow({
      prompt_en,
      negative_prompt,
      style_lora_name,
      lora_weight,
      character_ref_image_url,
      ip_adapter_weight,
      width,
      height,
    });

    // 3. Render
    const client = new ComfyUIAsyncClient();
    const renderResult = await client.submitAndRender(workflow);

    // If Gemini key is present and ComfyUI host wasn't reached, generate via Gemini 3.1 Flash Image
    let finalImageUrl = renderResult.image_url;
    if (process.env.GEMINI_API_KEY && renderResult.image_url.includes("unsplash")) {
      try {
        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: `High quality webtoon manga anime style: ${prompt_en}` }],
          },
          config: {
            imageConfig: { aspectRatio: height > width ? "9:16" : "16:9" },
          },
        });
        const part = geminiRes.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData) {
          finalImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        }
      } catch (geminiErr) {
        // keep fallback
      }
    }

    // 4. Finalize deduction
    userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - cost);
    userCreditStore.updated_at = new Date().toISOString();

    const deductLog = {
      id: `log-${Date.now()}-deduct`,
      user_id: "user-default",
      project_id: project_id || null,
      amount: -cost,
      action_type: "deduct",
      description: `ComfyUI 镜头跑图完成 (${cost} Credits)`,
      created_at: new Date().toISOString(),
    };
    creditLogsStore.unshift(deductLog);

    return res.json({
      success: true,
      image_url: finalImageUrl,
      prompt_id: renderResult.prompt_id,
      workflow: workflow,
      cost_credits: cost,
    });
  } catch (err: any) {
    // 5. Refund on error
    userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - cost);
    userCreditStore.balance += cost;
    userCreditStore.updated_at = new Date().toISOString();

    const refundLog = {
      id: `log-${Date.now()}-refund`,
      user_id: "user-default",
      project_id: project_id || null,
      amount: cost,
      action_type: "refund",
      description: `算力退还：ComfyUI 跑图渲染失败 (${err.message || "异常"})`,
      created_at: new Date().toISOString(),
    };
    creditLogsStore.unshift(refundLog);

    return res.status(500).json({ detail: `ComfyUI 跑图服务异常: ${err.message}` });
  }
});

// 9. Async Render Shot Pipeline Endpoint (/api/v1/render/shot)
app.post("/api/v1/render/shot", async (req, res) => {
  const { user_id, project_id, storyboard_id } = req.body;
  const SINGLE_IMAGE_COST = 5;

  // 1. Check user credit balance
  if (userCreditStore.balance < SINGLE_IMAGE_COST) {
    return res.status(402).json({
      detail: `算力余额不足！需 ${SINGLE_IMAGE_COST} 点，当前剩余 ${userCreditStore.balance} 点`,
    });
  }

  // 2. Perform credit pre-freeze
  userCreditStore.balance -= SINGLE_IMAGE_COST;
  userCreditStore.frozen_balance += SINGLE_IMAGE_COST;
  userCreditStore.updated_at = new Date().toISOString();

  const freezeLog = {
    id: `log-${Date.now()}-freeze`,
    user_id: user_id || "user-default",
    project_id: project_id || null,
    amount: -SINGLE_IMAGE_COST,
    action_type: "freeze",
    description: `预冻结算力：分镜跑图任务 (${SINGLE_IMAGE_COST} Credits)`,
    created_at: new Date().toISOString(),
  };
  creditLogsStore.unshift(freezeLog);

  // Find Project & Storyboard
  let foundProject = projectsDatabase.find((p) => p.id === project_id);
  let foundStoryboard: any = null;

  if (foundProject) {
    for (const ep of foundProject.episodes || []) {
      const sb = (ep.storyboards || []).find((s: any) => s.id === storyboard_id);
      if (sb) {
        foundStoryboard = sb;
        break;
      }
    }
  }

  const promptText = foundStoryboard?.visual_prompt || "High quality webtoon manga anime style shot";
  const refImageUrl = foundProject?.characters?.[0]?.ref_image_urls?.[0] || null;

  // 3. Assemble ComfyUI Workflow JSON
  const workflow = ComfyUIWorkflowBuilder.buildFluxLoraIpAdapterWorkflow({
    prompt_en: promptText,
    negative_prompt: "blurry, low quality, deformed, bad anatomy",
    style_lora_name: "anime_style.safetensors",
    lora_weight: 0.8,
    character_ref_image_url: refImageUrl,
    width: 720,
    height: 1280,
  });

  // 4. Fire Async Background Render Task
  setImmediate(async () => {
    try {
      const client = new ComfyUIAsyncClient();
      const renderResult = await client.submitAndRender(workflow);

      let finalImageUrl = renderResult.image_url;

      // Gemini fallback or enhancement if Gemini API key present
      if (process.env.GEMINI_API_KEY && renderResult.image_url.includes("unsplash")) {
        try {
          const geminiRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: {
              parts: [{ text: `High quality webtoon anime manga scene: ${promptText}` }],
            },
            config: {
              imageConfig: { aspectRatio: "9:16" },
            },
          });
          const part = geminiRes.candidates?.[0]?.content?.parts?.[0];
          if (part?.inlineData) {
            finalImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          }
        } catch (e) {
          // ignore error
        }
      }

      // Update Storyboard image URL if found
      if (foundStoryboard) {
        foundStoryboard.image_url = finalImageUrl;
      }

      // Finalize Deduction
      userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - SINGLE_IMAGE_COST);
      userCreditStore.updated_at = new Date().toISOString();

      const deductLog = {
        id: `log-${Date.now()}-finalize`,
        user_id: user_id || "user-default",
        project_id: project_id || null,
        amount: -SINGLE_IMAGE_COST,
        action_type: "deduct",
        description: `分镜跑图完成，扣除 ${SINGLE_IMAGE_COST} Credits`,
        created_at: new Date().toISOString(),
      };
      creditLogsStore.unshift(deductLog);

      console.log(`✅ [Render Complete] Storyboard ${storyboard_id} 渲染成功，已核销 ${SINGLE_IMAGE_COST} Credits`);
    } catch (err: any) {
      console.error(`❌ [Render Failed] ${err.message}，开始执行算力退还流程...`);

      // Rollback / Refund credits
      userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - SINGLE_IMAGE_COST);
      userCreditStore.balance += SINGLE_IMAGE_COST;
      userCreditStore.updated_at = new Date().toISOString();

      const refundLog = {
        id: `log-${Date.now()}-refund`,
        user_id: user_id || "user-default",
        project_id: project_id || null,
        amount: SINGLE_IMAGE_COST,
        action_type: "refund",
        description: `算力退还：渲染失败退款 (${err.message || "异常"})`,
        created_at: new Date().toISOString(),
      };
      creditLogsStore.unshift(refundLog);
    }
  });

  // 5. Return HTTP 202 Accepted Response
  return res.status(202).json({
    status: "queued",
    message: "跑图任务已成功进入队列",
    storyboard_id: storyboard_id,
    frozen_credits: SINGLE_IMAGE_COST,
  });
});

// Start Express + Vite
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MangaDrama Studio] Server ready at http://0.0.0.0:${PORT}`);
  });
}

start();
