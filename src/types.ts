// Data models for MangaDrama Studio (Seedance Native Multimodal & Sandbox Architecture)

export type AspectRatio = "9:16" | "16:9" | "1:1";
export type ProjectStatus = "draft" | "assets_locked" | "in_production" | "completed";
export type EpisodeStatus = "pending" | "parsed" | "rendering" | "ready";
export type ReviewerType = "publisher" | "creator" | "admin";
export type AnnotationStatus = "open" | "resolved";
export type PublishStatus = "pending" | "processing" | "published" | "failed";
export type ScheduleType = "instant" | "scheduled";

// 解耦服装变体卡
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
