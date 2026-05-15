import Image from "next/image";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const themeGradients: Record<Profile["theme"], string> = {
  violet: "from-violet-500/30 via-fuchsia-500/20 to-indigo-600/30",
  cyan: "from-cyan-400/30 via-sky-500/20 to-blue-600/30",
  rose: "from-rose-400/30 via-pink-500/20 to-orange-500/30",
  emerald: "from-emerald-400/30 via-teal-500/20 to-green-600/30",
};

export function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center text-center">
      <div
        className={cn(
          "relative mb-4 rounded-full p-1",
          "bg-gradient-to-br",
          themeGradients[profile.theme],
        )}
      >
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/30 dark:ring-white/10 sm:h-28 sm:w-28">
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 112px"
            unoptimized
          />
        </div>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
        {profile.displayName}
      </h1>
      <p className="mt-1 text-sm text-violet-600 dark:text-violet-300">
        @{profile.username}
      </p>
      {profile.bio && (
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {profile.bio}
        </p>
      )}
    </header>
  );
}
