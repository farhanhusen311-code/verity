import {
  BarChart3,
  AlertTriangle,
  Search,
  TrendingUp,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { ActivityList } from '@/components/dashboard/activity-list'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Dashboard | Digital Investigation System',
  description: 'Main dashboard for digital investigation analysis',
}

// Mock data - will be replaced with real data from Supabase
const mockStats = {
  total_investigations: 24,
  total_leaks_found: 8,
  high_risk_cases: 3,
}

const mockActivities = [
  {
    id: '1',
    type: 'leak_detected' as const,
    title: 'Critical Data Leak Detected',
    description: 'Large database containing customer records identified on dark web',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: 'critical' as const,
  },
  {
    id: '2',
    type: 'investigation_created' as const,
    title: 'New Investigation Opened',
    description: 'Investigation into potential insider threat in Finance Department',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    severity: 'high' as const,
  },
  {
    id: '3',
    type: 'analysis_completed' as const,
    title: 'Analysis Report Generated',
    description: 'Network traffic analysis report for Case #2024-0542 is ready',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    severity: 'medium' as const,
  },
  {
    id: '4',
    type: 'case_closed' as const,
    title: 'Investigation Closed',
    description: 'Case #2024-0531 successfully resolved with arrests made',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    severity: 'low' as const,
  },
  {
    id: '5',
    type: 'leak_detected' as const,
    title: 'Medium Severity Leak Found',
    description: 'Employee credentials found in public GitHub repository',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    severity: 'high' as const,
  },
]

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s your investigation overview.
          </p>
        </div>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
          + New Investigation
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Investigations"
          value={mockStats.total_investigations}
          icon={Search}
          trend={{ value: 12, label: 'this month', isPositive: true }}
          accentColor="blue"
        />

        <StatCard
          title="Leaks Found"
          value={mockStats.total_leaks_found}
          icon={AlertTriangle}
          trend={{ value: 8, label: 'this month', isPositive: false }}
          accentColor="red"
        />

        <StatCard
          title="High Risk Cases"
          value={mockStats.high_risk_cases}
          icon={TrendingUp}
          trend={{ value: 25, label: 'increase', isPositive: false }}
          accentColor="orange"
        />

        <StatCard
          title="Cases Closed"
          value="18"
          icon={BarChart3}
          trend={{ value: 15, label: 'this month', isPositive: true }}
          accentColor="green"
        />
      </div>

      {/* Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <ActivityList activities={mockActivities} />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          {/* Investigation Status */}
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Investigation Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open</span>
                <span className="text-2xl font-bold text-blue-400">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-2xl font-bold text-yellow-400">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Closed</span>
                <span className="text-2xl font-bold text-green-400">4</span>
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Critical</span>
                <span className="text-sm font-semibold text-red-400">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">High</span>
                <span className="text-sm font-semibold text-orange-400">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Medium</span>
                <span className="text-sm font-semibold text-yellow-400">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Low</span>
                <span className="text-sm font-semibold text-green-400">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
