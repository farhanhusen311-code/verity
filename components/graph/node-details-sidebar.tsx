'use client'

import { X, MousePointerClick } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { getNodeVisual, getCategoryColor, confidenceColor } from './graph-config'
import type { GraphNodeData } from './graph-types'

interface ConnectedEntity {
  entity: GraphNodeData
  relationshipLabel: string
  confidence: number
}

interface NodeDetailsSidebarProps {
  node: GraphNodeData | null
  connected: ConnectedEntity[]
  onClose: () => void
  onSelectConnected: (id: string) => void
}

export function NodeDetailsSidebar({
  node,
  connected,
  onClose,
  onSelectConnected,
}: NodeDetailsSidebarProps) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <MousePointerClick className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">Node Details</p>
        <p className="text-xs text-muted-foreground">
          Select a node in the graph to inspect its entity type, value, metadata, and connections.
        </p>
      </div>
    )
  }

  const visual = getNodeVisual(node.type)
  const colors = getCategoryColor(node.type)
  const Icon = visual.icon
  const metadataEntries = Object.entries(node.metadata ?? {})

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <h2 className="text-sm font-semibold text-foreground">Node Details</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Close details">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-5 p-4">
        {/* Identity */}
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.text)} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className={cn('text-xs font-medium uppercase tracking-wide', colors.text)}>
              {visual.label}
            </p>
            <p className="break-words text-sm font-semibold text-foreground">{node.value}</p>
            {node.originalValue && node.originalValue !== node.value && (
              <p className="break-words text-xs text-muted-foreground">Original: {node.originalValue}</p>
            )}
          </div>
        </div>

        {/* Core fields */}
        <div className="space-y-2">
          <DetailField label="Entity Type" value={node.type} />
          <DetailField label="Value" value={node.value} />
          <div className="flex items-center justify-between gap-2 rounded-md border border-border/50 bg-card/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">Confidence</span>
            <span className={cn('text-sm font-semibold', confidenceColor(node.confidence))}>
              {node.confidence}%
            </span>
          </div>
          {node.source && <DetailField label="Source" value={node.source} />}
        </div>

        {/* Metadata */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Metadata
          </h3>
          {metadataEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground">No metadata available.</p>
          ) : (
            <div className="space-y-1.5">
              {metadataEntries.map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-3 rounded-md border border-border/50 bg-card/50 px-3 py-2"
                >
                  <span className="shrink-0 text-xs text-muted-foreground">{key}</span>
                  <span className="break-all text-right text-xs font-medium text-foreground">
                    {formatValue(val)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connected entities */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Connected Entities
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {connected.length}
            </Badge>
          </h3>
          {connected.length === 0 ? (
            <p className="text-xs text-muted-foreground">No connections.</p>
          ) : (
            <div className="space-y-1.5">
              {connected.map(({ entity, relationshipLabel, confidence }) => {
                const cVisual = getNodeVisual(entity.type)
                const cColors = getCategoryColor(entity.type)
                const CIcon = cVisual.icon
                return (
                  <button
                    key={entity.id}
                    type="button"
                    onClick={() => onSelectConnected(entity.id)}
                    className="flex w-full items-center gap-2 rounded-md border border-border/50 bg-card/50 px-3 py-2 text-left transition-colors hover:border-primary/50 hover:bg-secondary"
                  >
                    <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', cColors.bg)}>
                      <CIcon className={cn('h-3.5 w-3.5', cColors.text)} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">{entity.value}</p>
                      <p className="text-[10px] text-muted-foreground">{relationshipLabel}</p>
                    </div>
                    <span className={cn('text-[10px] font-medium', confidenceColor(confidence))}>
                      {confidence}%
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/50 bg-card/50 px-3 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="break-all text-right text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
