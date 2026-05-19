export interface VideoFileMeta {
  durationSeconds: number;
  width: number;
  height: number;
}

/** Read duration + dimensions from a local video file. */
export function readVideoFileMeta(file: File): Promise<VideoFileMeta> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      resolve({
        durationSeconds: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      cleanup();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Could not read video metadata"));
    };

    video.src = url;
  });
}

/** Capture a JPEG thumbnail from a video file (client-side). */
export function captureVideoThumbnail(
  file: File,
  seekSeconds = 0.5,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    const url = URL.createObjectURL(file);

    const fail = (err: unknown) => {
      URL.revokeObjectURL(url);
      reject(err instanceof Error ? err : new Error("Thumbnail capture failed"));
    };

    video.onloadeddata = () => {
      const t = Math.min(
        seekSeconds,
        Number.isFinite(video.duration) ? Math.max(0, video.duration * 0.1) : seekSeconds,
      );
      video.currentTime = t;
    };

    video.onseeked = () => {
      try {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 360;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          fail(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else fail(new Error("Empty thumbnail"));
          },
          "image/jpeg",
          0.88,
        );
      } catch (e) {
        fail(e);
      }
    };

    video.onerror = () => fail(new Error("Video load failed for thumbnail"));
    video.src = url;
  });
}
