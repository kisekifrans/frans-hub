export interface DiscordOutreachConfig {
  webhookUrl: string;
  username: string;
  avatarUrl: string;
  /** Default Discord user ID to mention (optional) */
  defaultMentionId: string;
  /** email (lowercase) -> Discord snowflake user ID */
  mentionMap: Record<string, string>;
}

const STORAGE_KEY = "frans-hub-qa-outreach-discord";

export const DEFAULT_DISCORD_CONFIG: DiscordOutreachConfig = {
  webhookUrl: "",
  username: "QA Outreach",
  avatarUrl: "",
  defaultMentionId: "",
  mentionMap: {},
};

export function loadDiscordConfig(): DiscordOutreachConfig {
  if (typeof window === "undefined") return DEFAULT_DISCORD_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DISCORD_CONFIG;
    const parsed = JSON.parse(raw) as Partial<DiscordOutreachConfig>;
    return {
      webhookUrl: parsed.webhookUrl ?? "",
      username: parsed.username ?? DEFAULT_DISCORD_CONFIG.username,
      avatarUrl: parsed.avatarUrl ?? "",
      defaultMentionId: parsed.defaultMentionId ?? "",
      mentionMap: parsed.mentionMap ?? {},
    };
  } catch {
    return DEFAULT_DISCORD_CONFIG;
  }
}

export function saveDiscordConfig(config: DiscordOutreachConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function parseMentionMapPaste(text: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const line of text.split(/[\n\r]+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [email, id] = trimmed.split(/[,;\t|]/).map((p) => p.trim());
    if (email?.includes("@") && id && /^\d{17,20}$/.test(id)) {
      map[email.toLowerCase()] = id;
    }
  }
  return map;
}

export function mentionMapToPaste(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([email, id]) => `${email}, ${id}`)
    .join("\n");
}

export function resolveDiscordMentionId(
  email: string,
  config: DiscordOutreachConfig,
  opts?: {
    overrideId?: string;
    batchMap?: Record<string, string>;
  },
): string | undefined {
  const key = email.toLowerCase();
  const id =
    opts?.overrideId?.trim() ||
    opts?.batchMap?.[key] ||
    config.mentionMap[key] ||
    config.defaultMentionId.trim();
  return id && /^\d{17,20}$/.test(id) ? id : undefined;
}
