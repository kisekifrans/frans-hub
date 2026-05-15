import {
  RiGlobalLine,
  RiInstagramLine,
  RiTiktokLine,
  RiTwitterXLine,
  RiYoutubeLine,
} from "react-icons/ri";
import type { IconType } from "react-icons";
import type { SocialLink, SocialPlatform } from "@/lib/types";
import { cn } from "@/lib/utils";

const platformMeta: Record<
  SocialPlatform,
  { label: string; icon: IconType; iconClassName?: string }
> = {
  instagram: { label: "Instagram", icon: RiInstagramLine },
  tiktok: { label: "TikTok", icon: RiTiktokLine, iconClassName: "h-[17px] w-[17px]" },
  youtube: { label: "YouTube", icon: RiYoutubeLine },
  x: { label: "X", icon: RiTwitterXLine },
  website: { label: "Website", icon: RiGlobalLine },
};

const linkButtonClass =
  "glass-card flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-white/55 hover:shadow-lg hover:shadow-violet-500/30 hover:ring-1 hover:ring-violet-400/25 dark:hover:bg-white/15 sm:h-9 sm:w-9";

const iconBaseClass =
  "shrink-0 text-zinc-600 dark:text-zinc-300 h-[18px] w-[18px]";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

interface SocialLinksRowProps {
  links: SocialLink[];
  className?: string;
}

export function SocialLinksRow({ links, className }: SocialLinksRowProps) {
  const active = links.filter((l) => l.url?.trim());
  if (active.length === 0) return null;

  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
      role="list"
      aria-label="Social links"
    >
      {active.map((link) => {
        const meta = platformMeta[link.platform];
        const Icon = meta.icon;
        const href = normalizeUrl(link.url);

        return (
          <a
            key={link.platform}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            className={linkButtonClass}
            aria-label={meta.label}
            title={meta.label}
          >
            <Icon
              className={cn(iconBaseClass, meta.iconClassName)}
              aria-hidden
            />
          </a>
        );
      })}
    </div>
  );
}
