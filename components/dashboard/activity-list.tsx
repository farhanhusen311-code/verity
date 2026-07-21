import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Clock,
} from 'lucide-react'
import { formatDateTime } from '@/utils/cn'
import { cn } from '@/utils/cn'

interface Activity {
  id: string
  type: 'leak_detected' | 'investigation_created' | 'case_closed' | 'analysis_completed'
  title: string
  description: string
  timestamp: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface ActivityListProps {
  activities: Activity[]
}

export function ActivityList({ activities }: ActivityListProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'leak_detected':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'investigation_created':
        return <Search className="w-4 h-4 text-blue-400" />
      case 'case_closed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'analysis_completed':
        return <FileText className="w-4 h-4 text-purple-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400'
      case 'high':
        return 'bg-orange-500/10 text-orange-400'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400'
      case 'low':
        return 'bg-green-500/10 text-green-400'
      default:
        return 'bg-blue-500/10 text-blue-400'
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>
          Latest events and investigations from your dashboard
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  'flex gap-4 pb-4 border-border/50',
                  index !== activities.length - 1 && 'border-b'
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 pt-1">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>

                    {activity.severity && (
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-1 rounded',
                          getSeverityColor(activity.severity)
                        )}
                      >
                        {activity.severity}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
