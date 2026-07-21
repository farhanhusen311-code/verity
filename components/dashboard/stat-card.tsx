import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  accentColor?: 'blue' | 'green' | 'orange' | 'red'
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = 'blue',
}: StatCardProps) {
  const accentClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    orange: 'bg-orange-500/10 text-orange-400',
    red: 'bg-red-500/10 text-red-400',
  }

  return (
    <Card className="border-border/50 hover:border-border/80 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('p-2 rounded-lg', accentClasses[accentColor])}>
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-foreground">{value}</p>

          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}% {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
