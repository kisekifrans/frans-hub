export interface ParsedUserAgent {
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
  browser: string;
  os: string;
}

export function parseUserAgent(ua: string | null): ParsedUserAgent {
  if (!ua) {
    return { deviceType: "unknown", browser: "unknown", os: "unknown" };
  }

  const lower = ua.toLowerCase();

  let deviceType: ParsedUserAgent["deviceType"] = "desktop";
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    deviceType = "mobile";
  }

  let browser = "other";
  if (lower.includes("edg/")) browser = "edge";
  else if (lower.includes("chrome/") && !lower.includes("chromium")) browser = "chrome";
  else if (lower.includes("safari/") && !lower.includes("chrome")) browser = "safari";
  else if (lower.includes("firefox/")) browser = "firefox";
  else if (lower.includes("opr/") || lower.includes("opera")) browser = "opera";

  let os = "other";
  if (lower.includes("windows")) os = "windows";
  else if (lower.includes("mac os") || lower.includes("macintosh")) os = "macos";
  else if (lower.includes("android")) os = "android";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "ios";
  else if (lower.includes("linux")) os = "linux";

  return { deviceType, browser, os };
}
