import { type RefObject, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type Props = {
  isAnalyticsAllowed: boolean;
  onDismiss: () => void;
  onSave: (isAllowed: boolean) => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  fallbackFocusRef: RefObject<HTMLButtonElement | null>;
};

export function PreferencesDialog({
  isAnalyticsAllowed,
  onDismiss,
  onSave,
  returnFocusRef,
  fallbackFocusRef,
}: Props) {
  const [isAllowed, setIsAllowed] = useState(isAnalyticsAllowed);

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onDismiss();
        }
      }}
    >
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const TRIGGER = returnFocusRef.current;
          (TRIGGER?.isConnected ? TRIGGER : fallbackFocusRef.current)?.focus();
        }}
      >
        <DialogTitle className="pr-10">Cookie preferences</DialogTitle>
        <DialogDescription className="mt-2">
          Choose which cookies this demo can use.
        </DialogDescription>

        <div className="mt-4 divide-y divide-border rounded-xl border border-border px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p id="essential-label" className="text-sm font-semibold">
                Essential
              </p>
              <p id="essential-description" className="mt-1 text-sm text-muted-foreground">
                Remembers your choice. Always on.
              </p>
            </div>
            <Switch
              aria-labelledby="essential-label"
              aria-describedby="essential-description"
              checked
              disabled
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <label htmlFor="analytics-switch" className="text-sm font-semibold">
                Analytics
              </label>
              <p id="analytics-description" className="mt-1 text-sm text-muted-foreground">
                Loads the demo script and lets it process test events.
              </p>
            </div>
            <Switch
              id="analytics-switch"
              aria-describedby="analytics-description"
              checked={isAllowed}
              onCheckedChange={setIsAllowed}
            />
          </div>
        </div>

        <Button type="button" className="mt-4 w-full sm:w-auto" onClick={() => onSave(isAllowed)}>
          Save preferences
        </Button>
      </DialogContent>
    </Dialog>
  );
}
