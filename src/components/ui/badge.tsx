import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const BADGE_VARIANTS = cva(
  "inline-flex min-h-6 items-center gap-2 rounded-full px-2 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        positive: "bg-accent text-accent-foreground",
        pending: "bg-pending text-pending-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

type Props = ComponentProps<"span"> & VariantProps<typeof BADGE_VARIANTS>;

export function Badge({ className, variant, ...props }: Props) {
  return (
    <span data-slot="badge" className={cn(BADGE_VARIANTS({ variant }), className)} {...props} />
  );
}
