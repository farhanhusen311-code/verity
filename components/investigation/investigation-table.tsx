'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Eye } from 'lucide-react'

interface Investigation {
  id: string
  target: string
  type: string
  status: 'pending' | 'completed' | 'running'
  risk: 'low' | 'medium' | 'high' | 'critical'
  created: string
}

const mockInvestigations: Investigation[] = [
  {
    id: '1',
    target: 'john.doe@example.com',
    type: 'Email',
    status: 'completed',
    risk: 'medium',
    created: '2024-01-15',
  },
  {
    id: '2',
    target: 'johndoe123',
    type: 'Username',
    status: 'running',
    risk: 'high',
    created: '2024-01-16',
  },
  {
    id: '3',
    target: 'example.com',
    type: 'Domain',
    status: 'completed',
    risk: 'low',
    created: '2024-01-14',
  },
  {
    id: '4',
    target: '192.168.1.100',
    type: 'IP Address',
    status: 'pending',
    risk: 'critical',
    created: '2024-01-16',
  },
  {
    id: '5',
    target: 'jane.smith@email.com',
    type: 'Email',
    status: 'completed',
    risk: 'low',
    created: '2024-01-13',
  },
]

const statusVariants: Record<string, any> = {
  pending: 'pending',
  completed: 'completed',
  running: 'running',
}

const riskVariants: Record<string, any> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
}

export function InvestigationTable() {
  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle>Recent Investigations</CardTitle>
        <CardDescription>
          Latest digital investigation records and results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Target
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Risk Level
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Created
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {mockInvestigations.map((investigation) => (
                <tr
                  key={investigation.id}
                  className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="text-foreground font-medium">
                      {investigation.target}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-muted-foreground">
                      {investigation.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={statusVariants[investigation.status]}
                      className="capitalize"
                    >
                      {investigation.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={riskVariants[investigation.risk]}
                      className="capitalize"
                    >
                      {investigation.risk}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-muted-foreground">
                      {investigation.created}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
