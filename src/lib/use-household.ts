import { useEffect, useState } from "react";
import {
  BLANK,
  EXAMPLE,
  isHouseholdState,
  type Goals,
  type HouseholdInput,
  type HouseholdState,
} from "@/lib/plan";

const STORAGE_KEY = "faithful-household-v1";
const LEGACY_STORAGE_KEY = "faithful-house-v1";

export function useHousehold() {
  const [state, setState] = useState<HouseholdState>(EXAMPLE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isHouseholdState(parsed)) setState(parsed);
      }
    } catch {
      // Keep the example if stored data is unreadable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  function update(partial: Partial<HouseholdInput>) {
    setState((current) => ({ ...current, ...partial, source: "yours" }));
  }

  function toggleGoal(key: keyof Goals) {
    setState((current) => ({
      ...current,
      source: "yours",
      goals: { ...current.goals, [key]: !current.goals[key] },
    }));
  }

  function loadExample() {
    setState(EXAMPLE);
  }

  function clearAll() {
    setState(BLANK);
  }

  function replace(next: HouseholdState) {
    setState({ ...next, source: "yours" });
  }

  return { state, update, toggleGoal, loadExample, clearAll, replace };
}
