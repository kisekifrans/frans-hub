"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Pencil, Save } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ThemePicker } from "@/components/profile/ThemePicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { SOCIAL_PLATFORMS, type Profile, type SocialLink } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProfileEditorProps {
  profile: Profile;
  profileId: string;
  saving?: boolean;
  onSave: (patch: Partial<Profile>) => Promise<void>;
}

function emptySocialMap(links: SocialLink[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of SOCIAL_PLATFORMS) map[p.id] = "";
  for (const l of links) map[l.platform] = l.url;
  return map;
}

export function ProfileEditor({
  profile,
  profileId,
  saving,
  onSave,
}: ProfileEditorProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [socialDraft, setSocialDraft] = useState(() =>
    emptySocialMap(profile.socialLinks),
  );
  const [theme, setTheme] = useState(profile.theme);

  useEffect(() => {
    setBio(profile.bio);
    setSocialDraft(emptySocialMap(profile.socialLinks));
    setTheme(profile.theme);
  }, [profile]);

  const draftProfile: Profile = { ...profile, bio, theme };

  const handleSave = async () => {
    const socialLinks: SocialLink[] = SOCIAL_PLATFORMS.filter((p) =>
      socialDraft[p.id]?.trim(),
    ).map((p) => ({ platform: p.id, url: socialDraft[p.id].trim() }));
    await onSave({ bio, socialLinks, theme });
    setEditing(false);
    setOpen(false);
  };

  const bioEditor = editing ? (
    <textarea
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      rows={3}
      className="mt-3 w-full max-w-sm resize-none rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm leading-relaxed text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/40 dark:bg-white/10 dark:text-zinc-100"
      placeholder="Write your bio…"
    />
  ) : null;

  return (
    <div className="w-full">
      <div className="relative">
        <ProfileHeader
          profile={draftProfile}
          profileId={profileId}
          editable={editing}
          onAvatarChange={(url, storagePath) =>
            onSave({ avatarUrl: url, avatarStoragePath: storagePath })
          }
          bioSlot={bioEditor}
        />
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="glass-card absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
          aria-label={editing ? "Done editing" : "Edit profile"}
        >
          <Pencil className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
        </button>
      </div>

      <GlassCard padding="sm" className="mt-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 px-1 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          <span>Profile settings</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
            {SOCIAL_PLATFORMS.map((p) => (
              <label
                key={p.id}
                className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
              >
                {p.label}
                <input
                  type="url"
                  value={socialDraft[p.id] ?? ""}
                  onChange={(e) =>
                    setSocialDraft((d) => ({ ...d, [p.id]: e.target.value }))
                  }
                  placeholder={`https://${p.id === "website" ? "yoursite.com" : `${p.id}.com`}`}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
                />
              </label>
            ))}

            <ThemePicker
              value={theme}
              onChange={(t) => {
                setTheme(t);
                onSave({ theme: t });
              }}
            />

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
