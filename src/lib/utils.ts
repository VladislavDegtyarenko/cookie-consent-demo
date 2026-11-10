import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combines class names and lets later Tailwind utilities override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
