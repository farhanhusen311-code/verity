'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, BarChart3, CheckCircle2 } from 'lucide-react'

export function InvestigationSidebar() {
  return (
    <div className="space-y-6">
      {/* Investigation Tips */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Investigation Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">
                Use valid email addresses
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ensure email format is correct for better results
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">
                Use complete domain names
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Include TLD like .com, .org, .net for accurate search
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">
                Multiple identifiers improve results
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Combine email, username, and domain for comprehensive search
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Statistics */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Search Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's Searches */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-foreground">
                Today&apos;s Searches
              </p>
              <p className="text-lg font-bold text-primary">24</p>
            </div>
            <ProgressBar value={60} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              60% of daily limit
            </p>
          </div>

          {/* Successful Matches */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-foreground">
                Successful Matches
              </p>
              <p className="text-lg font-bold text-green-500">18</p>
            </div>
            <ProgressBar value={75} className="h-2" fillColor="bg-green-500" />
            <p className="text-xs text-muted-foreground mt-1">
              75% success rate
            </p>
          </div>

          {/* Average Investigation Time */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-foreground">
                Avg Investigation Time
              </p>
              <p className="text-lg font-bold text-blue-500">2.4s</p>
            </div>
            <ProgressBar value={40} className="h-2" fillColor="bg-blue-500" />
            <p className="text-xs text-muted-foreground mt-1">
              Well optimized performance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Info Card */}
      <Card className="border-primary/30 bg-primary/5 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Pro Tip</p>
            <p className="text-xs text-foreground">
              Save frequently used search profiles to quickly launch investigations
              for recurring targets and patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProgressBarProps {
  value: number
  className?: string
  fillColor?: string
}

function ProgressBar({
  value,
  className = '',
  fillColor = 'bg-primary',
}: ProgressBarProps) {
  return (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${className}`}>
      <div
        className={`${fillColor} h-full transition-all duration-300 rounded-full`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
