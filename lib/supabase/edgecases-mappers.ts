import type { EdgeCase, EdgeCaseInput } from "@/lib/edgecases/types";
import { edgeCaseStoragePublicUrl } from "@/lib/edgecases/storage-paths";
import type { DbEdgeCase } from "./database.types";

export function edgeCaseFromDb(row: DbEdgeCase): EdgeCase {
  const uploadedVideoPath = row.uploaded_video_path ?? undefined;
  const thumbnailPath = row.thumbnail_path ?? undefined;

  return {
    id: row.id,
    episodeId: row.episode_id ?? undefined,
    qaUrl: row.qa_url ?? undefined,
    uploadedVideoPath,
    thumbnailPath,
    videoUrl: uploadedVideoPath
      ? edgeCaseStoragePublicUrl(uploadedVideoPath) ?? undefined
      : undefined,
    thumbnailUrl: thumbnailPath
      ? edgeCaseStoragePublicUrl(thumbnailPath) ?? undefined
      : undefined,
    projectName: row.project_name ?? undefined,
    taskId: row.task_id ?? undefined,
    taskDescription: row.task_description ?? undefined,
    title: row.title,
    description: row.description ?? "",
    decision: (row.decision as EdgeCase["decision"]) ?? undefined,
    rejectReason: row.reject_reason ?? undefined,
    tags: row.tags ?? [],
    notes: row.notes ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    fileSize: row.file_size ?? undefined,
    mimeType: row.mime_type ?? undefined,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function edgeCaseToDb(
  input: EdgeCaseInput & { id: string; isFavorite?: boolean },
): Omit<DbEdgeCase, "created_at"> {
  return {
    id: input.id,
    episode_id: input.episodeId?.trim() || null,
    qa_url: input.qaUrl?.trim() || null,
    uploaded_video_path: input.uploadedVideoPath?.trim() || null,
    thumbnail_path: input.thumbnailPath?.trim() || null,
    project_name: input.projectName?.trim() || null,
    task_id: input.taskId?.trim() || null,
    task_description: input.taskDescription?.trim() || null,
    title: input.title.trim() || "Untitled",
    description: input.description?.trim() ?? "",
    decision: input.decision ?? null,
    reject_reason: input.rejectReason?.trim() || null,
    tags: input.tags ?? [],
    notes: input.notes?.trim() || null,
    duration_seconds: input.durationSeconds ?? null,
    file_size: input.fileSize ?? null,
    mime_type: input.mimeType?.trim() || null,
    is_favorite: input.isFavorite ?? false,
    updated_at: new Date().toISOString(),
  };
}
