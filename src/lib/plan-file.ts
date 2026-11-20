import { isHouseholdState, type HouseholdState } from "@/lib/plan";

export const PLAN_FILE_KIND = "faithful-household";
const LEGACY_PLAN_FILE_KIND = "faithful-house";
export const PLAN_FILE_VERSION = 1;

export function planFileName(raw: string): string | null {
  const trimmed = raw.trim().replace(/[^\w.\- ]+/g, "").slice(0, 80);
  if (!trimmed) return null;
  return trimmed.toLowerCase().endsWith(".json") ? trimmed : `${trimmed}.json`;
}

export function serializePlan(state: HouseholdState): string {
  return JSON.stringify(
    {
      kind: PLAN_FILE_KIND,
      version: PLAN_FILE_VERSION,
      household: { ...state, source: "yours" },
    },
    null,
    2,
  );
}

export function parsePlanFile(text: string): HouseholdState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as { kind?: unknown; household?: unknown };
  if (
    record.kind !== undefined &&
    record.kind !== PLAN_FILE_KIND &&
    record.kind !== LEGACY_PLAN_FILE_KIND
  ) {
    return null;
  }
  const household = "household" in record ? record.household : parsed;
  if (!household || typeof household !== "object") return null;
  const candidate = { ...(household as HouseholdState), source: "yours" as const };
  return isHouseholdState(candidate) ? candidate : null;
}

export function downloadPlan(state: HouseholdState, filename: string): boolean {
  const name = planFileName(filename);
  if (!name) return false;
  const blob = new Blob([serializePlan(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}
