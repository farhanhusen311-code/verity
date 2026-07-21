'use client'

import { Network, GitBranch, Boxes, Star, Activity } from 'lucide-react'
import { cn } from '@/utils/cn'
import { LEGEND_ITEMS, CATEGORY_COLORS } from './graph-config'
import type { GraphStatisticsData } from './graph-types'

interface GraphStatsSidebarProps {
  statistics: GraphStatisticsData
}

interface StatRowProps {
  icon: typeof Network
  label: string
  value: string | number
  hint?: string
}

function StatRow({ icon: Icon, label, value, hint }: StatRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold text-foreground" title={hint ?? String(value)}>
          {value}
        </p>
      </div>
    </div>
  )
}

export function GraphStatsSidebar({ statistics }: GraphStatsSidebarProps) {
  const highest = statistics.highestConnectedEntity

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Graph Statistics</h2>
        <p className="text-xs text-muted-foreground">Overview of the knowledge graph</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <StatRow icon={Boxes} label="Total Nodes" value={statistics.totalEntities} />
        <StatRow icon={GitBranch} label="Total Relationships" value={statistics.totalRelationships} />
        <StatRow icon={Network} label="Connected Components" value={statistics.connectedComponents} />
        <StatRow
          icon={Star}
          label="Highest Connected Entity"
          value={highest ? highest.value : '—'}
          hint={highest ? `${highest.value} (${highest.degree} connections)` : undefined}
        />
        <StatRow
          icon={Activity}
          label="Average Degree"
          value={statistics.averageDegree.toFixed(2)}
        />
      </div>

      <div className="mt-2">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Legend
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', CATEGORY_COLORS[item.category].dot)} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
