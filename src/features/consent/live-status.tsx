import { Activity, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { sendTestEvent } from "./analytics";
import type { getSnapshot } from "./consent-store";

const CHOICE_LABELS = {
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const ANALYTICS_LABELS = {
  active: "Active",
  error: "Unavailable",
  loading: "Loading",
  off: "Off",
};

/** Describes what analytics is doing for the current consent choice. */
function analyticsMessage({ choice, analytics }: ReturnType<typeof getSnapshot>) {
  if (analytics === "active") {
    return "Analytics is active";
  }

  if (analytics === "loading") {
    return "Loading the local analytics script…";
  }

  if (analytics === "error") {
    return "Analytics could not load. Save your preferences again to retry.";
  }

  if (choice === "withdrawn") {
    return "Analytics is off. Consent was withdrawn";
  }

  return choice ? "Analytics is off" : "Analytics is blocked until you opt in";
}

type Props = { snapshot: ReturnType<typeof getSnapshot> };

export function LiveStatus({ snapshot }: Props) {
  const { choice, analytics, eventCount } = snapshot;
  const IS_ACTIVE = analytics === "active";

  return (
    <Card aria-labelledby="live-status-title" className="w-full max-w-xl shadow-panel">
      <CardHeader className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Activity aria-hidden="true" className="size-5" />
        </span>
        <div>
          <CardTitle id="live-status-title">Live status</CardTitle>
          <p className="text-sm text-muted-foreground">See what the browser is doing right now.</p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border border-border bg-muted/40 px-4" aria-live="polite">
          <dl className="divide-y divide-border">
            <div className="flex min-h-10 items-center justify-between gap-3 py-2">
              <dt className="text-sm font-medium">Consent choice</dt>
              <dd>
                <Badge variant={choice ? "neutral" : "pending"}>
                  {choice ? CHOICE_LABELS[choice] : "No choice yet"}
                </Badge>
              </dd>
            </div>
            <div className="flex min-h-10 items-center justify-between gap-3 py-2">
              <dt className="text-sm font-medium">Analytics</dt>
              <dd>
                <Badge variant={IS_ACTIVE ? "positive" : "neutral"}>
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                  {ANALYTICS_LABELS[analytics]}
                </Badge>
              </dd>
            </div>
            <div className="flex min-h-10 items-center justify-between gap-3 py-2">
              <dt className="text-sm font-medium" id="event-count-label">
                Processed test events
              </dt>
              <dd>
                <output
                  aria-labelledby="event-count-label"
                  className="text-base font-semibold tabular-nums"
                >
                  {eventCount}
                </output>
              </dd>
            </div>
          </dl>
          <p
            className="border-t border-border py-3 text-sm leading-snug text-muted-foreground"
            id="analytics-message"
          >
            {analyticsMessage(snapshot)}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          onClick={sendTestEvent}
          disabled={!IS_ACTIVE}
          aria-describedby="analytics-message"
        >
          <Radio aria-hidden="true" />
          Send test event
        </Button>
      </CardFooter>
    </Card>
  );
}
