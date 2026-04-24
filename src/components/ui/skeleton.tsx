"use client"

import { Card, CardContent } from "@/components/ui/card"

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuestionCardSkeleton() {
  return (
    <Card className="hover:border-primary transition-colors">
      <CardContent className="p-6 space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

export function GridSkeleton({ columns = 3, count = 6 }: { columns?: number; count?: number }) {
  return (
    <div className={`grid grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
