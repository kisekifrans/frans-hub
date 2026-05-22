export const DASHBOARD_TUTORIAL_STORAGE_KEY = "kawaragi-dashboard-tutorial-v1";

export function isDashboardTutorialDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(DASHBOARD_TUTORIAL_STORAGE_KEY) === "1";
}

export function dismissDashboardTutorial(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DASHBOARD_TUTORIAL_STORAGE_KEY, "1");
}
