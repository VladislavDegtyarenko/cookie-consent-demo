import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const BUTTON_VARIANTS = cva(
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground",
        outline: "border border-border bg-background text-foreground hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type Props = ComponentProps<"button"> &
  VariantProps<typeof BUTTON_VARIANTS> & { asChild?: boolean };

export function Button({ className, variant, asChild, ...props }: Props) {
  const COMPONENT = asChild ? Slot.Root : "button";

  return (
    <COMPONENT
      data-slot="button"
      className={cn(BUTTON_VARIANTS({ variant }), className)}
      {...props}
    />
  );
}
