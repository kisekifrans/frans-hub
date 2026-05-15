import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { SocialLinksRow } from "@/components/profile/SocialLinksRow";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import type { Profile } from "@/lib/types";

interface ProfileHeaderProps {
  profile: Profile;
  profileId?: string;
  editable?: boolean;
  onAvatarChange?: (url: string, storagePath: string) => void;
  bioSlot?: React.ReactNode;
}

export function ProfileHeader({
  profile,
  profileId,
  editable = false,
  onAvatarChange,
  bioSlot,
}: ProfileHeaderProps) {
  const showBio =
    bioSlot ??
    (profile.bio ? (
      <p className="mt-2.5 max-w-sm px-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {profile.bio}
      </p>
    ) : null);

  return (
    <header className="mb-1 flex flex-col items-center text-center sm:mb-2">
      {profileId ? (
        <ProfileAvatar
          profile={profile}
          profileId={profileId}
          editable={editable}
          onAvatarChange={onAvatarChange}
        />
      ) : (
        <div className="relative mb-4 h-24 w-24 rounded-full bg-white/20 ring-4 ring-white/30 dark:ring-white/10 sm:h-28 sm:w-28" />
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          {profile.displayName}
        </h1>
        {profile.verified && <VerifiedBadge theme={profile.theme} />}
      </div>

      <p className="mt-1 text-sm text-violet-600 dark:text-violet-300">
        @{profile.username}
      </p>

      {showBio}

      <SocialLinksRow links={profile.socialLinks} className="mt-3" />
    </header>
  );
}
