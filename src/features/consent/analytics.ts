const SCRIPT_URL = "./demo-analytics.js";

const TEST_EVENT = "cookie-demo:test-event";

const PROCESSED_EVENT = "cookie-demo:event-processed";

type StartAnalytics = () => () => void;

declare global {
  interface Window {
    startCookieDemoAnalytics?: StartAnalytics;
  }
}

let pendingScript: Promise<StartAnalytics> | undefined;

/** Loads the local script once and lets a failed request be retried. */
export function loadAnalytics(): Promise<StartAnalytics> {
  pendingScript ??= new Promise<StartAnalytics>((resolve, reject) => {
    const SCRIPT = document.createElement("script");
    SCRIPT.src = SCRIPT_URL;
    SCRIPT.async = true;

    SCRIPT.onload = () => {
      if (window.startCookieDemoAnalytics) {
        resolve(window.startCookieDemoAnalytics);
      } else {
        reject(new Error("The demo script did not register an analytics handler."));
      }
    };

    SCRIPT.onerror = () => {
      reject(new Error("The demo script could not be loaded."));
    };

    document.head.append(SCRIPT);
  }).catch((error: unknown) => {
    pendingScript = undefined;
    throw error;
  });

  return pendingScript;
}

/** Starts analytics and counts only the script's processing acknowledgements. */
export function activateAnalytics(start: StartAnalytics, onProcessed: () => void) {
  const STOP = start();
  window.addEventListener(PROCESSED_EVENT, onProcessed);

  return () => {
    window.removeEventListener(PROCESSED_EVENT, onProcessed);
    STOP();
  };
}

/** Offers a sample event to the active analytics handler. */
export function sendTestEvent() {
  window.dispatchEvent(new Event(TEST_EVENT));
}
