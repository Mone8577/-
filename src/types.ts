// Data models matching MangaDrama Studio specification and SQLAlchemy Schema

export type AspectRatio = "9:16" | "16:9" | "1:1";
export type ProjectStatus = "draft" | "processing" | "completed";
export type EpisodeStatus = "pending" | "rendering" | "ready";
export type ReviewerType = "publisher" | "creator" | "admin";
export type AnnotationStatus = "open" | "resolved";
export type PublishStatus = "pending" | "processing" | "published" | "failed";
export type ScheduleType = "instant" | "scheduled";

export interface ProjectCharacter {
  id: string;
  project_id: string;
  name: string;
  gender?: string;
  visual_description?: string;
  ref_image_urls: string[];
  ip_adapter_weight: number; // 0.65 - 0.80 default 0.75
  voice_id?: string;
  voice_name?: string;
  created_at: string;
}

export interface Storyboard {
  id: string;
  episode_id: string;
  project_id: string;
  shot_number: number;
  camera_movement?: "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "static" | "2.5d_tilt";
  visual_prompt: string;
  dialogue?: string;
  speaker_character_id?: string;
  speaker_character_name?: string;
  image_url?: string;
  audio_url?: string;
  audio_duration: number; // seconds
  video_motion_url?: string;
  created_at: string;
}

// --- Pydantic API Schemas ---
export interface ProjectCreate {
  title: string;
  description?: string;
  aspect_ratio: AspectRatio;
  style_preset?: string;
  global_style_config?: Record<string, any>;
}

export interface ProjectResponse extends ProjectCreate {
  id: string;
  user_id: string;
  status: ProjectStatus;
  created_at: string;
}

export interface StoryboardGenerateRequest {
  project_id: string;
  episode_id: string;
  raw_script_text: string;
}

export interface StoryboardItemSchema {
  shot_number: number;
  camera_movement: string;
  visual_prompt: string;
  dialogue?: string;
  speaker_character_name?: string;
}

export interface VideoAnnotationCreate {
  submission_id: string;
  storyboard_id?: string;
  time_code: number;
  frame_number: number;
  draw_data?: Record<string, any>;
  comment_text: string;
}

export interface VideoAnnotationResponse extends VideoAnnotationCreate {
  id: string;
  status: AnnotationStatus | string;
  created_at: string;
}

export interface Episode {
  id: string;
  project_id: string;
  episode_number: number;
  title: string;
  raw_script?: string;
  hook_point?: string; // Golden hook / climax description
  status: EpisodeStatus;
  created_at: string;
  storyboards: Storyboard[];
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_url?: string;
  aspect_ratio: AspectRatio;
  style_preset?: string; // 'anime_2d', '3d_real', 'cyberpunk', 'xianxia'
  global_style_config: {
    base_model: string;
    style_lora: string;
    negative_prompt: string;
  };
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  characters: ProjectCharacter[];
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

export interface CreditUsage {
  id: string;
  timestamp: string;
  action: string;
  model_used: string;
  credits_spent: number;
  project_title: string;
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
  x: number; // 相对百分比 x (0~1)，保证跨分辨率一致性
  y: number; // 相对百分比 y (0~1)
  width: number; // 相对百分比宽度
  height: number; // 相对百分比高度
}

export interface AnnotationMarker {
  id: string;
  timestamp: number; // 视频时间戳（秒）
  box: BoundingBox; // 圈画位置
  comment: string; // 审片修改意见
  author: string; // 审片员名字
  createdAt: string;
}

