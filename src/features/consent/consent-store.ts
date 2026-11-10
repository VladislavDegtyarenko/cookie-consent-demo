import { activateAnalytics, loadAnalytics } from "./analytics";
import { type ConsentChoice, readConsent, writeConsent } from "./consent-cookie";

type Snapshot = {
  isReady: boolean;
  choice: ConsentChoice | null;
  analytics: "off" | "loading" | "active" | "error";
  eventCount: number;
};

const INITIAL_STATE: Snapshot = {
  isReady: false,
  choice: null,
  analytics: "off",
  eventCount: 0,
};

const LISTENERS = new Set<() => void>();

let state = INITIAL_STATE;
let stopAnalytics: (() => void) | undefined;
let activation = 0;

/** Publishes a new snapshot for the live status and consent controls. */
function updateState(changes: Partial<Snapshot>) {
  state = { ...state, ...changes };

  for (const LISTENER of LISTENERS) {
    LISTENER();
  }
}

/** Applies a choice immediately and ignores any superseded script load. */
async function applyChoice(choice: ConsentChoice | null) {
  if (choice === "accepted" && (state.analytics === "active" || state.analytics === "loading")) {
    return;
  }

  const ATTEMPT = ++activation;

  if (choice !== "accepted") {
    stopAnalytics?.();
    stopAnalytics = undefined;
    updateState({ choice, analytics: "off", isReady: true });
    return;
  }

  updateState({ choice, analytics: "loading", isReady: true });

  try {
    const START = await loadAnalytics();

    if (ATTEMPT !== activation) {
      return;
    }

    stopAnalytics = activateAnalytics(START, () =>
      updateState({ eventCount: state.eventCount + 1 }),
    );
    updateState({ analytics: "active" });
  } catch {
    if (ATTEMPT === activation) {
      updateState({ analytics: "error" });
    }
  }
}

/** Restores the saved choice once the browser can read cookies. */
export function initializeConsent() {
  if (!state.isReady) {
    void applyChoice(readConsent());
  }
}

/** Saves a preference and preserves the distinction between refusal and withdrawal. */
export function saveConsent(isAnalyticsAllowed: boolean) {
  const CHOICE = isAnalyticsAllowed
    ? "accepted"
    : state.choice === "accepted" || state.choice === "withdrawn"
      ? "withdrawn"
      : "rejected";

  writeConsent(CHOICE);
  void applyChoice(CHOICE);
}

/** Subscribes a view to changes in the browser's consent state. */
export function subscribe(listener: () => void) {
  LISTENERS.add(listener);

  return () => LISTENERS.delete(listener);
}

/** Returns the latest browser state. */
export function getSnapshot() {
  return state;
}

/** Keeps the statically exported page blocked until browser initialization. */
export function getServerSnapshot() {
  return INITIAL_STATE;
}
