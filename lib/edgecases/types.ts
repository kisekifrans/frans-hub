export type EdgeCaseDecision = "approve" | "reject" | "pending";

export interface EdgeCase {
  id: string;
  episodeId?: string;
  qaUrl?: string;
  uploadedVideoPath?: string;
  thumbnailPath?: string;
  /** Resolved public URL for playback (from storage path). */
  videoUrl?: string;
  /** Resolved public URL for card thumbnail. */
  thumbnailUrl?: string;
  projectName?: string;
  taskId?: string;
  taskDescription?: string;
  title: string;
  description: string;
  decision?: EdgeCaseDecision;
  rejectReason?: string;
  tags: string[];
  notes?: string;
  durationSeconds?: number;
  fileSize?: number;
  mimeType?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EdgeCaseInput = Omit<
  EdgeCase,
  "id" | "createdAt" | "updatedAt" | "isFavorite" | "videoUrl" | "thumbnailUrl"
> & { isFavorite?: boolean };

export interface EdgeCaseFilters {
  search: string;
  decision: EdgeCaseDecision | "all";
  project: string;
  favoritesOnly: boolean;
  datePreset: "all" | "7d" | "30d";
}

export interface EdgeCaseMediaUploadResult {
  uploadedVideoPath: string;
  thumbnailPath: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  fileSize: number;
  mimeType: string;
}
