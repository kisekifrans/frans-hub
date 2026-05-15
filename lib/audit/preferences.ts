export interface AuditWorkflowPrefs {
  autoNextAfterDecision: boolean;
  autoNextAfterReview: boolean;
}

const STORAGE_KEY = "frans-hub-audit-workflow";

export const DEFAULT_WORKFLOW_PREFS: AuditWorkflowPrefs = {
  autoNextAfterDecision: true,
  autoNextAfterReview: false,
};

export function loadWorkflowPrefs(): AuditWorkflowPrefs {
  if (typeof window === "undefined") return DEFAULT_WORKFLOW_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKFLOW_PREFS;
    const parsed = JSON.parse(raw) as Partial<AuditWorkflowPrefs>;
    return {
      autoNextAfterDecision:
        parsed.autoNextAfterDecision ?? DEFAULT_WORKFLOW_PREFS.autoNextAfterDecision,
      autoNextAfterReview:
        parsed.autoNextAfterReview ?? DEFAULT_WORKFLOW_PREFS.autoNextAfterReview,
    };
  } catch {
    return DEFAULT_WORKFLOW_PREFS;
  }
}

export function saveWorkflowPrefs(prefs: AuditWorkflowPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
