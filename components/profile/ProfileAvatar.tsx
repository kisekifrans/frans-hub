"use client";

import { Camera, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AvatarFallback, SafeImage } from "@/components/ui/SafeImage";
import { createClient } from "@/lib/supabase/client";
import { assetPath, removeAsset, uploadAsset } from "@/lib/supabase/hub-service";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const themeGradients: Record<Profile["theme"], string> = {
  violet: "from-violet-500/30 via-fuchsia-500/20 to-indigo-600/30",
  cyan: "from-cyan-400/30 via-sky-500/20 to-blue-600/30",
  rose: "from-rose-400/30 via-pink-500/20 to-orange-500/30",
  emerald: "from-emerald-400/30 via-teal-500/20 to-green-600/30",
};

interface ProfileAvatarProps {
  profile: Profile;
  profileId: string;
  editable?: boolean;
  onAvatarChange?: (url: string, storagePath: string) => void;
}

export function ProfileAvatar({
  profile,
  profileId,
  editable = false,
  onAvatarChange,
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Max file size is 8MB");
        return;
      }
      setUploading(true);
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = assetPath(profileId, "avatars", `avatar.${ext}`);
        const supabase = createClient();
        if (profile.avatarStoragePath) {
          await removeAsset(supabase, profile.avatarStoragePath).catch(() => {});
        }
        const { publicUrl, storagePath } = await uploadAsset(
          supabase,
          file,
          path,
        );
        onAvatarChange?.(publicUrl, storagePath);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [profileId, profile.avatarStoragePath, onAvatarChange],
  );

  return (
    <div
      className={cn(
        "relative mb-4 rounded-full p-1",
        "bg-gradient-to-br",
        themeGradients[profile.theme],
      )}
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/30 dark:ring-white/10 sm:h-28 sm:w-28">
        <SafeImage
          src={profile.avatarUrl}
          alt={profile.displayName}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 96px, 112px"
          fallback={
            <AvatarFallback
              name={profile.displayName}
              className="text-lg font-semibold"
            />
          }
        />
        {editable && (
          <label
            className={cn(
              "absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-white opacity-0 transition-opacity duration-200 hover:opacity-100",
              uploading && "pointer-events-none opacity-100",
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </label>
        )}
      </div>
    </div>
  );
}
