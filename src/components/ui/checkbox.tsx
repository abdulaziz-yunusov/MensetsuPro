"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "peer relative h-5 w-5 shrink-0 rounded-md border border-[var(--color-border)] outline-none bg-background ring-offset-background transition-all checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
    <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
  </label>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
