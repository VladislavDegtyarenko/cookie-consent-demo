(() => {
  const TEST_EVENT = "cookie-demo:test-event";
  const PROCESSED_EVENT = "cookie-demo:event-processed";
  const COOKIE_NAME = "cookie_demo_analytics";
  const COOKIE_MAX_AGE_SECONDS = 60 * 60;

  /** Acknowledges the test event locally so the demo can count it. */
  function processTestEvent() {
    window.dispatchEvent(new Event(PROCESSED_EVENT));
  }

  // Loading this file only registers the factory. The page must explicitly activate it.
  window.startCookieDemoAnalytics = () => {
    const SECURE = location.protocol === "https:" ? "; Secure" : "";
    const ATTRIBUTES = `Path=/; SameSite=Lax${SECURE}`;
    // biome-ignore lint/suspicious/noDocumentCookie: Keep cookie changes synchronous on browsers without Cookie Store support.
    document.cookie = `${COOKIE_NAME}=active; Max-Age=${COOKIE_MAX_AGE_SECONDS}; ${ATTRIBUTES}`;
    window.addEventListener(TEST_EVENT, processTestEvent);

    return () => {
      window.removeEventListener(TEST_EVENT, processTestEvent);
      // biome-ignore lint/suspicious/noDocumentCookie: Keep cookie changes synchronous on browsers without Cookie Store support.
      document.cookie = `${COOKIE_NAME}=; Max-Age=0; ${ATTRIBUTES}`;
    };
  };
})();
