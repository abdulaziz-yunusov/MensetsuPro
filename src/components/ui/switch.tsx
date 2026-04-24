"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "peer relative h-6 w-11 shrink-0 rounded-full border-2 border-transparent appearance-none bg-muted outline-none ring-offset-background transition-all checked:bg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
    <div className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-lg transition-transform peer-checked:translate-x-5" />
  </label>
))
Switch.displayName = "Switch"

export { Switch }
