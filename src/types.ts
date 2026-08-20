// Data models for MangaDrama Studio (Seedance Native Multimodal & Sandbox Architecture)

export type AspectRatio = "9:16" | "16:9" | "1:1";
export type ProjectStatus = "draft" | "assets_locked" | "in_production" | "completed";
export type EpisodeStatus = "pending" | "parsed" | "rendering" | "ready";
export type ReviewerType = "publisher" | "creator" | "admin";
export type AnnotationStatus = "open" | "resolved";
export type PublishStatus = "pending" | "processing" | "published" | "failed";
export type ScheduleType = "instant" | "scheduled";

// 🌟 明亮主题系统定义与预设
export type ThemeKey = "amber_daylight" | "azure_breeze" | "rose_creative" | "emerald_mint";

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  tag: string;
  badge: string;
  accentGradient: string;
  primaryColor: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
  glowShadow: string;
  bannerBg: string;
  buttonBg: string;
  buttonHover: string;
}

export const THEME_CONFIGS: Record<ThemeKey, ThemeConfig> = {
  amber_daylight: {
    key: "amber_daylight",
    name: "日光雅致 (Daylight Amber)",
    tag: "晨光通透 · 灵感活力",
    badge: "☀️ 晨曦暖阳",
    accentGradient: "from-amber-500 via-orange-500 to-rose-500",
    primaryColor: "text-orange-600",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700 border-orange-200",
    borderHover: "hover:border-orange-400",
    glowShadow: "shadow-orange-500/15",
    bannerBg: "bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent",
    buttonBg: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20",
    buttonHover: "hover:from-orange-600 hover:to-amber-600",
  },
  azure_breeze: {
    key: "azure_breeze",
    name: "蔚蓝清风 (Crisp Azure)",
    tag: "冰爽晶透 · 现代科技",
    badge: "🌊 冰晶极简",
    accentGradient: "from-sky-500 via-blue-600 to-indigo-600",
    primaryColor: "text-sky-600",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700 border-sky-200",
    borderHover: "hover:border-sky-400",
    glowShadow: "shadow-sky-500/15",
    bannerBg: "bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent",
    buttonBg: "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20",
    buttonHover: "hover:from-sky-600 hover:to-blue-700",
  },
  rose_creative: {
    key: "rose_creative",
    name: "樱粉灵感 (Rose Creative)",
    tag: "温润雅致 · 浪漫剧场",
    badge: "🌸 樱粉故事",
    accentGradient: "from-pink-500 via-rose-500 to-purple-600",
    primaryColor: "text-pink-600",
    badgeBg: "bg-pink-50",
    badgeText: "text-pink-700 border-pink-200",
    borderHover: "hover:border-pink-400",
    glowShadow: "shadow-pink-500/15",
    bannerBg: "bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-transparent",
    buttonBg: "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20",
    buttonHover: "hover:from-pink-600 hover:to-rose-600",
  },
  emerald_mint: {
    key: "emerald_mint",
    name: "翠露晨风 (Emerald Mint)",
    tag: "清新护眼 · 漫剧工坊",
    badge: "🌿 薄荷翠绿",
    accentGradient: "from-emerald-500 via-teal-500 to-cyan-600",
    primaryColor: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700 border-emerald-200",
    borderHover: "hover:border-emerald-400",
    glowShadow: "shadow-emerald-500/15",
    bannerBg: "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent",
    buttonBg: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20",
    buttonHover: "hover:from-emerald-600 hover:to-teal-700",
  },
};

// 解耦服装变体卡
export interface StylePresetCard {
  id: string;
  name: string;
  tag: string;
  lora_id: string;
  description: string;
  preview_image: string;
  badge_color: string;
  default_negative: string;
}

export const STYLE_PRESET_CARDS: StylePresetCard[] = [
  {
    id: "3d_xianxia",
    name: "3D 国漫大作",
    tag: "虚幻5光影 · 顶级建模",
    lora_id: "Xianxia_3D_Masterpiece_v2",
    description: "次世代 3D 渲染，发丝级细节与高动态范围光影，完美对标院线级国漫短剧",
    preview_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    badge_color: "bg-orange-500",
    default_negative: "blurry, low quality, bad anatomy, distorted face, 2d flat",
  },
  {
    id: "cyber_neon",
    name: "赛博修仙霓虹",
    tag: "机械义体 · 霓虹暗调",
    lora_id: "Cyber_Cultivation_Neon_v1",
    description: "未来赛博都市与东方修真异能融合，高饱和霓虹光与重工业废土机械风",
    preview_image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    badge_color: "bg-cyan-500",
    default_negative: "blurry, low quality, daytime bright, oversaturated flat",
  },
  {
    id: "webtoon_deluxe",
    name: "唯美韩漫条漫",
    tag: "精致线稿 · 赛璐璐光影",
    lora_id: "Webtoon_Deluxe_Drama_v2",
    description: "爆款条漫质感，细腻面容轮廓与高颜值人设，豪门甜宠与悬疑情绪首选",
    preview_image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    badge_color: "bg-pink-500",
    default_negative: "blurry, 3d render, rough sketch, bad hands",
  },
  {
    id: "comic_noir",
    name: "美漫硬朗暗黑",
    tag: "高对比度 · 美漫画风",
    lora_id: "Comic_Noir_Gritty_v1",
    description: "强阴影交界线与电影级排线质感，战神归来、末日求生与热血冲突首选",
    preview_image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    badge_color: "bg-purple-500",
    default_negative: "blurry, flat 2d pastel, cartoonish, low contrast",
  },
];

export interface CharacterOutfit {
  id: string;
  name: string; // e.g. "常服-青色布衣", "战甲-九天玄金铠", "宴会-深黑长袍"
  description: string;
  ref_image_url?: string;
  is_default?: boolean;
}

// 核心角色卡（面容与音色绑定）
export interface ProjectCharacter {
  id: string;
  project_id: string;
  name: string;
  gender?: string;
  visual_description?: string;
  ref_image_urls: string[]; // 面部/主立绘三视图
  outfits?: CharacterOutfit[]; // 解耦服装变体
  voice_id?: string;
  voice_name?: string; // e.g. "CosyVoice-Seed #8821", "MiniMax-Drama-01"
  voice_seed_param?: string;
  created_at: string;
}

// 场景资产卡
export interface ProjectScene {
  id: string;
  project_id: string;
  name: string; // e.g. "乌坦城萧家大厅", "魔兽山脉断崖", "现代豪华拍卖会"
  description: string;
  env_prompt: string;
  ref_image_url?: string;
  created_at: string;
}

// 三位一体分镜组 (Shot Block for Seedance 2.0 / 2.5)
export interface Storyboard {
  id: string;
  episode_id: string;
  project_id: string;
  shot_number: number;
  camera_movement?: "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "static" | "2.5d_tilt" | "drone_orbit" | "dutch_angle";
  visual_prompt: string; // 视觉画面 Prompt
  dialogue?: string; // 角色对白/台词
  speaker_character_id?: string;
  speaker_character_name?: string;
  outfit_id?: string;
  scene_id?: string;
  image_url?: string; // 生成的画格关键帧
  audio_url?: string; // 原生音画音轨 URL
  audio_duration: number; // 预估时长(秒)
  video_motion_url?: string; // Seedance 原生生成的连贯音视频片段 (MP4)
  render_engine?: "seedance_2.5" | "seedance_2.0" | "kling_1.5" | "flux_flash";
  is_rendering?: boolean;
  created_at: string;
}

export interface Episode {
  id: string;
  project_id: string;
  episode_number: number;
  title: string;
  raw_script?: string;
  hook_point?: string; // 黄金卡点 / 高潮与反转悬念钩子 (Hook Point)
  status: EpisodeStatus;
  created_at: string;
  storyboards: Storyboard[];
  rendered_video_url?: string; // 全集合成视频流
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_url?: string;
  aspect_ratio: AspectRatio;
  style_preset?: string; // 'anime_2d', '3d_real', 'cyberpunk', 'xianxia'
  is_assets_locked: boolean; // 中央控制层强制门禁状态 (Gatekeeper)
  locked_at?: string;
  global_style_config: {
    base_model: string; // e.g. "Seedance 2.5 Multimodal Engine"
    style_lora: string;
    negative_prompt: string;
  };
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  characters: ProjectCharacter[];
  scenes?: ProjectScene[];
  episodes: Episode[];
}

export interface VideoAnnotation {
  id: string;
  submission_id: string;
  storyboard_id?: string;
  time_code: number; // seconds
  frame_number: number;
  draw_data?: {
    type: "box" | "circle" | "arrow" | "freehand";
    coords: number[]; // x1, y1, x2, y2 or points
    color?: string;
  };
  comment_text: string;
  reviewer_type: ReviewerType;
  status: AnnotationStatus;
  created_at: string;
}

export interface PublishTask {
  id: string;
  project_id: string;
  user_id: string;
  target_platforms: string[]; // ['douyin', 'kuaishou', 'tiktok', 'youtube']
  episodes_to_publish: string[];
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  publish_time?: string;
  status: PublishStatus;
  log_message?: string;
  created_at: string;
}

export interface EscrowOrder {
  id: string;
  title: string;
  publisher: string;
  publisher_logo?: string;
  budget: number;
  episodes_count: number;
  aspect_ratio: AspectRatio;
  style_requirement: string;
  deadline: string;
  status: "open" | "in_progress" | "reviewing" | "completed";
  sandbox_read_only: boolean;
  watermark_text: string;
}

export interface PlatformAccount {
  id: string;
  platform: "douyin" | "kuaishou" | "youtube" | "tiktok" | "bilibili" | "xiaohongshu";
  account_name: string;
  avatar_url: string;
  followers: number;
  qualification_bound: boolean;
  status: "active" | "expired";
}

export interface UserCredit {
  user_id: string;
  balance: number;
  frozen_balance: number;
  updated_at: string;
}

export interface CreditLog {
  id: string;
  user_id: string;
  project_id?: string;
  amount: number;
  action_type: "freeze" | "deduct" | "refund" | "recharge";
  description: string;
  created_at: string;
}

export interface BoundingBox {
  x: number; // 相对百分比 x (0~1)
  y: number; // 相对百分比 y (0~1)
  width: number;
  height: number;
}

export interface AnnotationMarker {
  id: string;
  timestamp: number;
  box: BoundingBox;
  comment: string;
  author: string;
  createdAt: string;
}
