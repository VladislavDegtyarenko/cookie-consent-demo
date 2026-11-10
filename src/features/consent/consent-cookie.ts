const COOKIE_NAME = "cookie_demo_consent";

const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

const CONSENT_VALUES = {
  accepted: "v1.accepted",
  rejected: "v1.rejected",
  withdrawn: "v1.withdrawn",
} as const;

export type ConsentChoice = keyof typeof CONSENT_VALUES;

/** Reads only known choices for the current cookie version. */
export function readConsent(): ConsentChoice | null {
  const PREFIX = `${COOKIE_NAME}=`;
  const VALUE = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(PREFIX))
    ?.slice(PREFIX.length);

  if (VALUE === CONSENT_VALUES.accepted) {
    return "accepted";
  }

  if (VALUE === CONSENT_VALUES.rejected) {
    return "rejected";
  }

  if (VALUE === CONSENT_VALUES.withdrawn) {
    return "withdrawn";
  }

  return null;
}

/** Stores the visitor's choice for this site, including an explicit refusal. */
export function writeConsent(choice: ConsentChoice) {
  const SECURE = location.protocol === "https:" ? "; Secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: Keep cookie changes synchronous on browsers without Cookie Store support.
  document.cookie = `${COOKIE_NAME}=${CONSENT_VALUES[choice]}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${SECURE}`;
}
