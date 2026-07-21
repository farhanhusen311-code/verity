import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        pending: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-200",
        completed: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-200",
        running: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-200",
        low: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-200",
        medium: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-200",
        high: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-200",
        critical: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
