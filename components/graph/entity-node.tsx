'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/utils/cn'
import { getNodeVisual, getCategoryColor } from './graph-config'
import type { FlowNodePayload } from './graph-types'

function EntityNodeComponent({ data, selected }: NodeProps) {
  const { entity, degree, dimmed, highlighted } = data as FlowNodePayload
  const visual = getNodeVisual(entity.type)
  const colors = getCategoryColor(entity.type)
  const Icon = visual.icon

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm transition-all duration-200',
        'min-w-[140px] max-w-[220px]',
        colors.border,
        dimmed ? 'opacity-25' : 'opacity-100',
        (selected || highlighted) && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-border !bg-muted-foreground"
      />

      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', colors.bg)}>
        <Icon className={cn('h-4 w-4', colors.text)} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('text-[10px] font-medium uppercase tracking-wide', colors.text)}>
          {visual.label}
        </p>
        <p className="truncate text-xs font-semibold text-foreground" title={entity.value}>
          {entity.value}
        </p>
      </div>

      {degree > 0 && (
        <span
          className="ml-1 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-semibold text-secondary-foreground"
          title={`${degree} connection${degree === 1 ? '' : 's'}`}
        >
          {degree}
        </span>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-border !bg-muted-foreground"
      />
    </div>
  )
}

export const EntityNode = memo(EntityNodeComponent)
