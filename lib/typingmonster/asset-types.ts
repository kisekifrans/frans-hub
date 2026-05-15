export type AssetFolder = "standard" | "custom";

export interface AssetCatalog {
  bossId: string;
  basePath: string;
  frameSize: number;
  /** Relative paths inside each folder (e.g. `body/bodies/female/idle.png`). */
  standard: string[];
  custom: string[];
  /** All animation names discovered from filenames. */
  animations: string[];
  /** Files grouped by detected animation name. */
  byAnimation: Record<string, Partial<Record<AssetFolder, string[]>>>;
  /** From credits/metadata.json when present. */
  exportedStandard?: string[];
  exportedCustom?: string[];
}
