"use client";

import { Cookie, Settings2 } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

import {
  getServerSnapshot,
  getSnapshot,
  initializeConsent,
  saveConsent,
  subscribe,
} from "./consent-store";
import { LiveStatus } from "./live-status";
import { PreferencesDialog } from "./preferences-dialog";

export function ConsentDemo() {
  const SNAPSHOT = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const SHOW_BANNER = SNAPSHOT.isReady && !SNAPSHOT.choice;
  const SETTINGS_BUTTON = useRef<HTMLButtonElement>(null);
  const DIALOG_TRIGGER = useRef<HTMLButtonElement>(null);

  useEffect(initializeConsent, []);

  function openPreferences(event: MouseEvent<HTMLButtonElement>) {
    DIALOG_TRIGGER.current = event.currentTarget;
    setIsDialogOpen(true);
  }

  function savePreferences(isAnalyticsAllowed: boolean) {
    saveConsent(isAnalyticsAllowed);
    setIsDialogOpen(false);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-background">
        <div className="page-frame flex items-center justify-between gap-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Cookie aria-hidden="true" className="size-4" />
            </span>
            Privacy Lab
          </span>
          <span className="text-xs font-medium text-muted-foreground">Interactive demo</span>
        </div>
      </header>

      <main className="relative isolate flex grow flex-col items-center justify-center gap-6 px-4 py-4 sm:px-8">
        <div className="demo-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="max-w-3xl text-center">
          <h1 className="font-serif text-[clamp(2rem,6vw,3.75rem)] leading-none tracking-tight text-balance">
            Cookie Consent Demo
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">
            Choose your cookies and see when analytics starts, stops, and processes events.
          </p>
        </div>

        <LiveStatus snapshot={SNAPSHOT} />
      </main>

      <div className={SHOW_BANNER ? "sticky bottom-0 z-10" : undefined}>
        <footer className="border-t border-border bg-background">
          <div className="page-frame flex items-center justify-between gap-4 py-2">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Local simulation. No event data leaves your browser.
            </p>
            <Button ref={SETTINGS_BUTTON} type="button" variant="ghost" onClick={openPreferences}>
              <Settings2 aria-hidden="true" />
              Cookie settings
            </Button>
          </div>
        </footer>

        {SHOW_BANNER && (
          <aside aria-labelledby="cookie-banner-title" className="border-t border-border bg-card">
            <div className="page-frame flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <Cookie aria-hidden="true" className="size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold" id="cookie-banner-title">
                    Your cookie choices
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We use one cookie to remember your choice. Demo analytics is optional.
                  </p>
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                <Button
                  type="button"
                  className="px-2 sm:w-36 sm:px-4"
                  onClick={() => saveConsent(true)}
                >
                  Accept all
                </Button>
                <Button
                  type="button"
                  className="px-2 sm:w-36 sm:px-4"
                  onClick={() => saveConsent(false)}
                >
                  Reject optional
                </Button>
                <Button
                  type="button"
                  className="col-span-2"
                  variant="outline"
                  onClick={openPreferences}
                >
                  Preferences
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {isDialogOpen && (
        <PreferencesDialog
          isAnalyticsAllowed={SNAPSHOT.choice === "accepted"}
          onDismiss={() => setIsDialogOpen(false)}
          onSave={savePreferences}
          returnFocusRef={DIALOG_TRIGGER}
          fallbackFocusRef={SETTINGS_BUTTON}
        />
      )}
    </div>
  );
}
