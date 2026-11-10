"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof SwitchPrimitive.Root>;

export function Switch({ className, ...props }: Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-switch-off p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-default data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none size-6 rounded-full bg-card shadow-sm motion-safe:transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}
