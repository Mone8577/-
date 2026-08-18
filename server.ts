import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client (Lazy)
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

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
    amount: -10,
    action_type: "deduct",
    description: "Seedance 2.5 剧本多通道结构化抽取 (三位一体分镜)",
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "log-2",
    user_id: "user-default",
    project_id: "proj-1",
    amount: -25,
    action_type: "deduct",
    description: "Seedance 2.5 原生音画同生视频渲染 (镜头 #1-#3)",
    created_at: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    id: "log-3",
    user_id: "user-default",
    project_id: "proj-1",
    amount: -5,
    action_type: "deduct",
    description: "CosyVoice 专属音色 Seed 克隆绑定",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// In-Memory Projects Database with Seedance Native Multimodal Schema
let projectsDatabase: any[] = [
  {
    id: "proj-1",
    user_id: "user-default",
    title: "修仙归来：都市至尊",
    description: "一代仙尊重回少年时代，掌握神级医术与无敌剑法，横扫都市豪强！",
    cover_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60",
    aspect_ratio: "9:16",
    style_preset: "anime_2d",
    is_assets_locked: true,
    locked_at: new Date(Date.now() - 86400000).toISOString(),
    global_style_config: {
      base_model: "Seedance 2.5 Multimodal Engine",
      style_lora: "Xianxia_Webtoon_V2 (Weight: 0.8)",
      negative_prompt: "blurry, low quality, bad anatomy, deformed face, distorted hands",
    },
    status: "in_production",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    characters: [
      {
        id: "char-1",
        project_id: "proj-1",
        name: "叶空 (楚玄仙尊)",
        gender: "男",
        visual_description: "18岁少年，黑发修长，眼神如鹰，现代潮牌装扮，散发淡蓝色灵气光晕",
        ref_image_urls: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
        ],
        outfits: [
          {
            id: "outfit-1-1",
            name: "常服-休闲黑色连帽衫",
            description: "日常高中生活常服，黑色带兜帽与简约白色条纹",
            is_default: true,
          },
          {
            id: "outfit-1-2",
            name: "战袍-楚玄仙尊墨色长袍",
            description: "仙尊真身显现时的九天玄丝长袍，绣有金色真龙暗纹",
            is_default: false,
          },
        ],
        voice_id: "voice-m1",
        voice_name: "霸道冷酷少年音 (CosyVoice-Seed #8821)",
        voice_seed_param: "seed_cosy_8821_dynamic",
        created_at: new Date().toISOString(),
      },
      {
        id: "char-2",
        project_id: "proj-1",
        name: "林雪儿",
        gender: "女",
        visual_description: "江城第一豪门千金，长发及腰，白色长裙，气质高冷清绝",
        ref_image_urls: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60",
        ],
        outfits: [
          {
            id: "outfit-2-1",
            name: "常服-高定白色晚礼裙",
            description: "出席顶级拍卖会的高定绸缎长裙",
            is_default: true,
          },
        ],
        voice_id: "voice-f1",
        voice_name: "清冷御姐音 (CosyVoice-Seed #4102)",
        voice_seed_param: "seed_cosy_4102_calm",
        created_at: new Date().toISOString(),
      },
    ],
    scenes: [
      {
        id: "scene-1",
        project_id: "proj-1",
        name: "江城高中男生宿舍",
        description: "夕阳斜照的凌乱宿舍，桌上摆着旧书本与全身镜",
        env_prompt: "High school dorm room, sunset golden hour rays through window, cinematic anime interior",
        ref_image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=60",
        created_at: new Date().toISOString(),
      },
      {
        id: "scene-2",
        project_id: "proj-1",
        name: "林氏豪门顶级拍卖大厅",
        description: "金碧辉煌的现代拍卖行，水晶吊灯，全场豪门名流云集",
        env_prompt: "Luxury modern grand auction hall, crystal chandeliers, VIP audience, dramatic spotlight",
        ref_image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=60",
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
        hook_point: "🔥 黄金卡点：昔日仇敌推门而入，叶空凌空一指击碎大理石桌，震撼全场！",
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
            speaker_character_name: "叶空 (楚玄仙尊)",
            outfit_id: "outfit-1-1",
            image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 3.8,
            render_engine: "seedance_2.5",
            video_motion_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
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
            speaker_character_name: "叶空 (楚玄仙尊)",
            outfit_id: "outfit-1-1",
            image_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 4.5,
            render_engine: "seedance_2.5",
            video_motion_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60",
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
            speaker_character_name: "叶空 (楚玄仙尊)",
            outfit_id: "outfit-1-1",
            image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 2.9,
            render_engine: "seedance_2.5",
            video_motion_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
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
        hook_point: "🔥 黄金卡点：林雪儿主动递上黑金名片，全场名流惊呆！",
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
            speaker_character_name: "叶空 (楚玄仙尊)",
            image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=60",
            audio_url: "",
            audio_duration: 3.5,
            render_engine: "seedance_2.5",
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
        hook_point: "🔥 黄金卡点：九针渡劫，起死回生！",
        status: "pending",
        created_at: new Date().toISOString(),
        storyboards: [],
      },
    ],
  },
  {
    id: "proj-2",
    user_id: "user-default",
    title: "星际战姬：零号纪元",
    description: "末日机甲降临，少女机师驾驶终极泰坦撕裂深空异兽！",
    cover_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60",
    aspect_ratio: "9:16",
    style_preset: "cyberpunk",
    is_assets_locked: false,
    global_style_config: {
      base_model: "Seedance 2.5 Multimodal Engine",
      style_lora: "SciFi_Mecha_V3 (Weight: 0.85)",
      negative_prompt: "blurry, low quality, deformed mecha",
    },
    status: "draft",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    characters: [
      {
        id: "char-201",
        project_id: "proj-2",
        name: "零号姬 · 艾拉",
        gender: "女",
        visual_description: "银白色短发，红蓝色机械义眼，身着流光紧身驾驶作战服",
        ref_image_urls: [
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60",
        ],
        outfits: [
          { id: "outfit-201-1", name: "驾驶服-零式红白机师服", description: "纳米机甲驾驶服", is_default: true },
        ],
        voice_id: "voice-f2",
        voice_name: "高冷少女战姬音 (CosyVoice-Seed #1092)",
        created_at: new Date().toISOString(),
      },
    ],
    scenes: [
      {
        id: "scene-201",
        project_id: "proj-2",
        name: "轨道太空母舰驾驶舱",
        description: "全息光幕环绕的环形高科技机甲驾驶舱",
        env_prompt: "Futuristic spaceship cockpit, holographic monitors, cyberpunk neon glow",
        ref_image_url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=60",
        created_at: new Date().toISOString(),
      },
    ],
    episodes: [
      {
        id: "ep-201",
        project_id: "proj-2",
        episode_number: 1,
        title: "第1集：红色警报",
        raw_script: "警报在深空母舰中疯狂回响，异兽狂潮突袭防线，艾拉咬碎口香糖，跃入泰坦核心。",
        hook_point: "🔥 黄金卡点：泰坦聚能光刃拔出，一击贯穿千米行星级巨兽！",
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

// 1. Get Projects (Lobby)
app.get("/api/projects", (req, res) => {
  res.json({ projects: projectsDatabase });
});

// Create Project Sandbox
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
    is_assets_locked: false,
    global_style_config: {
      base_model: "Seedance 2.5 Multimodal Engine",
      style_lora: "Webtoon_Master_V2 (0.75)",
      negative_prompt: "blurry, bad quality, deformed hands",
    },
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    characters: [],
    scenes: [],
    episodes: [],
  };
  projectsDatabase.unshift(newProj);
  res.json({ success: true, project: newProj });
});

// Update Project World/Style/Lock Gatekeeper
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

// Lock Global Assets (Gatekeeper)
app.post("/api/projects/:id/lock-assets", (req, res) => {
  const proj = projectsDatabase.find((p) => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  proj.is_assets_locked = true;
  proj.locked_at = new Date().toISOString();
  proj.status = "assets_locked";
  proj.updated_at = new Date().toISOString();

  res.json({ success: true, message: "中央资产门禁已锁定，已解锁下游分集渲染流水线！", project: proj });
});

// Unlock Global Assets
app.post("/api/projects/:id/unlock-assets", (req, res) => {
  const proj = projectsDatabase.find((p) => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  proj.is_assets_locked = false;
  proj.status = "draft";
  proj.updated_at = new Date().toISOString();

  res.json({ success: true, message: "中央资产门禁已解锁进入编辑模式", project: proj });
});

// Add Character (with Decoupled Outfits)
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
    outfits: req.body.outfits || [
      {
        id: `outfit-${Date.now()}-1`,
        name: "默认常服",
        description: "日常默认服饰设定",
        is_default: true,
      },
    ],
    voice_id: req.body.voice_id || "voice-default",
    voice_name: req.body.voice_name || "CosyVoice 专属音色",
    voice_seed_param: req.body.voice_seed_param || "seed_default_01",
    created_at: new Date().toISOString(),
  };

  proj.characters.push(newChar);
  res.json({ success: true, character: newChar, project: proj });
});

// Add Scene Card
app.post("/api/projects/:id/scenes", (req, res) => {
  const proj = projectsDatabase.find((p) => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const newScene = {
    id: `scene-${Date.now()}`,
    project_id: proj.id,
    name: req.body.name || "新场景",
    description: req.body.description || "",
    env_prompt: req.body.env_prompt || "Cinematic anime scenery",
    ref_image_url: req.body.ref_image_url || "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
    created_at: new Date().toISOString(),
  };

  if (!proj.scenes) proj.scenes = [];
  proj.scenes.push(newScene);
  res.json({ success: true, scene: newScene, project: proj });
});

// 2. AI Story Original Incubator (Gemini AI Pipeline)
app.post("/api/ai/incubate-script", async (req, res) => {
  try {
    const { genre, prompt, target_episodes } = req.body;
    const systemPrompt = `你是一位顶级网文漫剧编剧与导演。请根据题材【${genre || "玄幻重生"}】和创意灵感【${prompt}】，创作标准漫剧剧本大纲。
必须返回严格 JSON 格式，结构如下：
{
  "title": "剧本名称",
  "synopsis": "剧情梗概与卖点",
  "style_suggestion": "建议视觉画风",
  "main_characters": [
    {
      "name": "主角名",
      "gender": "男/女",
      "visual_description": "外貌与面部特征",
      "default_outfit": "首套常服描述",
      "voice_type": "沉稳霸气青年音 / 清冷少女音 / 霸道总裁音"
    }
  ],
  "main_scenes": [
    { "name": "核心场景名", "description": "场景环境描写", "env_prompt": "英文场景Prompt" }
  ],
  "episodes": [
    {
      "episode_number": 1,
      "title": "分集标题",
      "raw_script": "本集对白与动作描写",
      "hook_point": "🔥 黄金卡点：本集结尾悬念高潮钩子"
    }
  ]
}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        title: `【AI孵化】${prompt.slice(0, 10)}...`,
        synopsis: "由AI孵化的爆款短剧剧本，包含强烈反转与高潮卡点。",
        style_suggestion: "国漫风玄幻 / 高对比度发光灵气",
        main_characters: [
          {
            name: "萧逸",
            gender: "男",
            visual_description: "黑发修长，眼神如鹰，散发淡蓝灵光",
            default_outfit: "常服-黑色修身风衣",
            voice_type: "霸道冷酷少年音 (CosyVoice-Seed #8821)",
          },
          {
            name: "苏清雪",
            gender: "女",
            visual_description: "银发紫眸，高贵清绝",
            default_outfit: "常服-白色高定晚礼裙",
            voice_type: "清冷御姐音 (CosyVoice-Seed #4102)",
          },
        ],
        main_scenes: [
          { name: "天海大厦顶层大厅", description: "俯瞰江城的奢华落地窗大厅", env_prompt: "Luxury penthouse hall, night city view" },
        ],
        episodes: [
          {
            episode_number: 1,
            title: "第1集：异界觉醒",
            raw_script: "天地突变，萧逸在废墟中睁开双眼，体内封印的至尊龙魂轰然破封！",
            hook_point: "🔥 黄金卡点：反派率众人逼近，萧逸一掌将山峰轰塌，震撼全场！",
          },
          {
            episode_number: 2,
            title: "第2集：神威赫赫",
            raw_script: "宗门长老赶到，欲将萧逸收为亲传弟子，萧逸冷笑拒绝。",
            hook_point: "🔥 黄金卡点：萧逸展现超越宗主的惊天神识，全宗跪叩！",
          },
        ],
      });
    }

    const response = await getAI().models.generateContent({
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

// 3. Seedance 2.5 Three-in-One Storyboard Parser
app.post("/api/v1/storyboards/parse-script", async (req, res) => {
  try {
    const { project_id, episode_id, raw_script_text } = req.body;

    const project = projectsDatabase.find((p) => p.id === project_id);
    const episode = project?.episodes?.find((e: any) => e.id === episode_id);

    if (!project || !episode) {
      return res.status(400).json({ detail: "Episode 不存在或 Project ID 不匹配" });
    }

    const scriptToParse = raw_script_text || episode.raw_script || "";
    const charList = (project.characters || []).map((c: any) => `${c.name}(${c.gender})`).join(", ");

    const systemPrompt = `你是一位专注 Seedance 2.0/2.5 多模态漫剧视频的专业导演 Agent。请将输入的漫剧章节剧本解析为 Seedance 原生多镜头叙事的三位一体分镜组（视觉描述 + 运镜机位 + 台词与声音）。
已知角色列表: [${charList}]

要求：
1. gold_hook: 本集结尾的黄金高潮卡点（悬念/反转）。
2. storyboards 数组中的每个 shot 包含：
   - shot_number: 镜头序号 (1, 2, 3...)
   - camera_movement: 机位运镜 ("zoom_in", "zoom_out", "pan_left", "pan_right", "static", "2.5d_tilt", "drone_orbit")
   - visual_prompt_en: Seedance 原生视频的高品质 Prompt (画面动态构图、角色动作、微表情、环境光影、动漫质感)
   - dialogue: 角色对白或台词
   - speaker_character_name: 说话人角色名
   - audio_duration: 预估音频与镜头时长(秒，通常2.5~5秒)

返回 JSON 格式：
{
  "gold_hook": "🔥 黄金卡点：昔日仇敌推门而入，叶空凌空一指击碎大理石桌，震撼全场！",
  "storyboards": [
    {
      "shot_number": 1,
      "camera_movement": "zoom_in",
      "visual_prompt_en": "Close up shot of anime male protagonist opening eyes with glowing blue aura runes, shock expression, cinematic lighting, 8k masterpiece",
      "dialogue": "“没想到三百年后，本尊真的重回少年时代了！”",
      "speaker_character_name": "${project.characters?.[0]?.name || "叶空"}",
      "audio_duration": 3.5
    }
  ]
}`;

    let parsedResult: { gold_hook: string; storyboards: any[] } = {
      gold_hook: "🔥 黄金卡点：高能反转名场面引爆全场！",
      storyboards: [],
    };

    if (!process.env.GEMINI_API_KEY) {
      parsedResult = {
        gold_hook: "🔥 黄金卡点：仇敌逼近，主角凌空一指斩断灵木，全场肃然失色！",
        storyboards: [
          {
            shot_number: 1,
            camera_movement: "zoom_in",
            visual_prompt_en: "Close up of anime protagonist opening eyes with luminous blue magical runes in pupils, cinematic webtoon animation",
            dialogue: "“这里是...江城宿舍？我真的重生了！”",
            speaker_character_name: project.characters?.[0]?.name || "叶空",
            audio_duration: 3.5,
          },
          {
            shot_number: 2,
            camera_movement: "pan_right",
            visual_prompt_en: "Medium shot of protagonist standing near window with sunset golden rays, floating cyan energy around fingertips",
            dialogue: "“前世所有欠我的，这一世统统还回来！”",
            speaker_character_name: project.characters?.[0]?.name || "叶空",
            audio_duration: 4.2,
          },
          {
            shot_number: 3,
            camera_movement: "2.5d_tilt",
            visual_prompt_en: "Low angle dynamic shot of room door kicked open, antagonist entering with shocked expressions, electric sparks crackling",
            dialogue: "“给我跪下！”",
            speaker_character_name: project.characters?.[0]?.name || "叶空",
            audio_duration: 2.8,
          },
        ],
      };
    } else {
      const response = await getAI().models.generateContent({
        model: "gemini-3.6-flash",
        contents: `项目标题: ${project.title}\n分集: ${episode.title}\n剧本正文:\n${scriptToParse}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      parsedResult = JSON.parse(response.text || "{}");
    }

    const generatedStoryboards = (parsedResult.storyboards || []).map((shot: any, idx: number) => {
      const matchedChar = project.characters?.find(
        (c: any) => c.name === (shot.speaker_character_name || shot.speaker_name)
      );
      return {
        id: `sb-${Date.now()}-${idx + 1}`,
        episode_id,
        project_id,
        shot_number: shot.shot_number || idx + 1,
        camera_movement: shot.camera_movement || "zoom_in",
        visual_prompt: shot.visual_prompt_en || shot.visual_prompt || "High quality manga scene",
        dialogue: shot.dialogue || "",
        speaker_character_name: matchedChar?.name || shot.speaker_character_name || "",
        speaker_character_id: matchedChar?.id || project.characters?.[0]?.id,
        outfit_id: matchedChar?.outfits?.[0]?.id,
        image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
        audio_url: "",
        audio_duration: shot.audio_duration || 3.5,
        render_engine: "seedance_2.5",
        created_at: new Date().toISOString(),
      };
    });

    episode.storyboards = generatedStoryboards;
    episode.hook_point = parsedResult.gold_hook || episode.hook_point;
    episode.status = "parsed";

    return res.json(parsedResult);
  } catch (err: any) {
    console.error("Parse script endpoint error:", err);
    return res.status(500).json({ detail: `解析异常: ${err.message}` });
  }
});

// 4. Seedance 2.5 Native Multimodal Shot Render (Audio-Visual Sync)
app.post("/api/v1/seedance/render-shot", async (req, res) => {
  const {
    project_id,
    episode_id,
    shot_id,
    prompt,
    camera_movement,
    dialogue,
    speaker_name,
    aspect_ratio,
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
    description: `预冻结算力：Seedance 2.5 镜头音画生成 (#${shot_id || "shot"})`,
    created_at: new Date().toISOString(),
  };
  creditLogsStore.unshift(freezeLog);

  try {
    // Find project to inject character reference & voice seed
    const proj = projectsDatabase.find((p) => p.id === project_id);
    const matchedChar = proj?.characters?.find((c: any) => c.name === speaker_name) || proj?.characters?.[0];

    // Simulate Seedance 2.5 Multimodal API Call (or Gemini fallback)
    let finalImageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";

    if (process.env.GEMINI_API_KEY) {
      try {
        const mappedRatio = aspect_ratio === "16:9" ? "16:9" : "9:16";
        const geminiRes = await getAI().models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: `Digital webtoon manga anime style, ${camera_movement || "cinematic"} shot: ${prompt}` }],
          },
          config: {
            imageConfig: { aspectRatio: mappedRatio },
          },
        });
        const part = geminiRes.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData) {
          finalImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        }
      } catch (geminiErr) {
        // use fallback
      }
    }

    // Finalize deduction
    userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - cost);
    userCreditStore.updated_at = new Date().toISOString();

    const deductLog = {
      id: `log-${Date.now()}-deduct`,
      user_id: "user-default",
      project_id: project_id || null,
      amount: -cost,
      action_type: "deduct",
      description: `Seedance 2.5 镜头音画生成完成 (${cost} Credits)`,
      created_at: new Date().toISOString(),
    };
    creditLogsStore.unshift(deductLog);

    return res.json({
      success: true,
      image_url: finalImageUrl,
      video_motion_url: finalImageUrl,
      engine: "Seedance 2.5 Native Multimodal",
      audio_sync: "CosyVoice Native Aligned",
      cost_credits: cost,
    });
  } catch (err: any) {
    // Refund
    userCreditStore.frozen_balance = Math.max(0, userCreditStore.frozen_balance - cost);
    userCreditStore.balance += cost;
    userCreditStore.updated_at = new Date().toISOString();

    const refundLog = {
      id: `log-${Date.now()}-refund`,
      user_id: "user-default",
      project_id: project_id || null,
      amount: cost,
      action_type: "refund",
      description: `算力退还：Seedance 渲染异常 (${err.message || "异常"})`,
      created_at: new Date().toISOString(),
    };
    creditLogsStore.unshift(refundLog);

    return res.status(500).json({ detail: `Seedance API 服务异常: ${err.message}` });
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

// 7. CreditService Endpoints
app.get("/api/v1/credits/account", (req, res) => {
  res.json({
    user_credit: userCreditStore,
    logs: creditLogsStore,
  });
});

app.post("/api/v1/credits/recharge", (req, res) => {
  const { amount } = req.body;
  const numAmount = Number(amount) || 5000;

  userCreditStore.balance += numAmount;
  userCreditStore.updated_at = new Date().toISOString();

  const log = {
    id: `log-${Date.now()}`,
    user_id: "user-default",
    amount: numAmount,
    action_type: "recharge",
    description: `智算点数加购充值 (+${numAmount} PTS)`,
    created_at: new Date().toISOString(),
  };
  creditLogsStore.unshift(log);

  res.json({ success: true, balance: userCreditStore.balance, account: userCreditStore });
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
    console.log(`🎬 [MangaDrama Studio] Seedance Native Server running on http://localhost:${PORT}`);
  });
}

start();
