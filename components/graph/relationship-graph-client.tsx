'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AlertCircle, Loader2, Network, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GraphCanvas } from './graph-canvas'
import { GraphStatsSidebar } from './graph-stats-sidebar'
import { NodeDetailsSidebar } from './node-details-sidebar'
import { GraphToolbar } from './graph-toolbar'
import { getRelationshipLabel } from './graph-config'
import type {
  GraphApiResponse,
  GraphResponseData,
  GraphFilters,
} from './graph-types'

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: GraphResponseData }

const EMPTY_FILTERS: GraphFilters = {
  search: '',
  entityTypes: [],
  relationshipTypes: [],
  minConfidence: 0,
}

interface RelationshipGraphClientProps {
  initialInvestigationId?: string
}

export function RelationshipGraphClient({
  initialInvestigationId = '',
}: RelationshipGraphClientProps) {
  const [investigationId, setInvestigationId] = useState(initialInvestigationId)
  const [inputValue, setInputValue] = useState(initialInvestigationId)
  const [state, setState] = useState<LoadState>({ status: 'idle' })
  const [filters, setFilters] = useState<GraphFilters>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const exportFnRef = useRef<((format: 'png' | 'svg' | 'json') => void) | null>(null)
  const registerExport = useCallback((fn: (format: 'png' | 'svg' | 'json') => void) => {
    exportFnRef.current = fn
  }, [])

  const loadGraph = useCallback(async (id: string) => {
    const trimmed = id.trim()
    if (!trimmed) return
    setState({ status: 'loading' })
    setSelectedId(null)
    setFilters(EMPTY_FILTERS)
    try {
      const res = await fetch(`/api/investigations/${encodeURIComponent(trimmed)}/graph`)
      const json = (await res.json()) as GraphApiResponse
      if (!res.ok || !json.success || !json.data) {
        setState({
          status: 'error',
          message: json.error ?? `Request failed with status ${res.status}`,
        })
        return
      }
      setInvestigationId(trimmed)
      setState({ status: 'success', data: json.data })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to fetch graph data',
      })
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadGraph(inputValue)
  }

  const data = state.status === 'success' ? state.data : null

  // Options for filter dropdowns — derived from the fetched data only.
  const entityTypeOptions = useMemo(
    () => (data ? Array.from(new Set(data.nodes.map((n) => n.type))).sort() : []),
    [data],
  )
  const relationshipTypeOptions = useMemo(
    () => (data ? Array.from(new Set(data.edges.map((e) => e.type))).sort() : []),
    [data],
  )

  // Selected node + its connections — memoized.
  const selectedNode = useMemo(
    () => (data && selectedId ? data.nodes.find((n) => n.id === selectedId) ?? null : null),
    [data, selectedId],
  )

  const connectedEntities = useMemo(() => {
    if (!data || !selectedId) return []
    const nodeById = new Map(data.nodes.map((n) => [n.id, n]))
    const result: {
      entity: (typeof data.nodes)[number]
      relationshipLabel: string
      confidence: number
    }[] = []
    for (const edge of data.edges) {
      let otherId: string | null = null
      if (edge.fromEntityId === selectedId) otherId = edge.toEntityId
      else if (edge.toEntityId === selectedId) otherId = edge.fromEntityId
      if (!otherId) continue
      const entity = nodeById.get(otherId)
      if (!entity) continue
      result.push({
        entity,
        relationshipLabel: getRelationshipLabel(edge.type),
        confidence: edge.confidence,
      })
    }
    return result
  }, [data, selectedId])

  const handleExport = useCallback((format: 'png' | 'svg' | 'json') => {
    exportFnRef.current?.(format)
  }, [])

  const resultCount = useMemo(() => {
    if (!data) return 0
    const search = filters.search.trim().toLowerCase()
    return data.nodes.filter((n) => {
      const typeOk = filters.entityTypes.length === 0 || filters.entityTypes.includes(n.type)
      const confOk = n.confidence >= filters.minConfidence
      const searchOk =
        !search || n.value.toLowerCase().includes(search) || n.type.toLowerCase().includes(search)
      return typeOk && confOk && searchOk
    }).length
  }, [data, filters])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance text-foreground">Relationship Graph</h1>
          <p className="mt-1 text-muted-foreground">
            Visualize digital entities and their relationships.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full gap-2 md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Investigation ID"
              className="pl-9"
              aria-label="Investigation ID"
            />
          </div>
          <Button type="submit" disabled={state.status === 'loading' || !inputValue.trim()}>
            {state.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Load Graph'
            )}
          </Button>
        </form>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {state.status === 'idle' && (
          <PlaceholderState
            icon={Network}
            title="Load a graph to begin"
            message="Enter an investigation ID above to visualize its knowledge graph produced by the Correlation Engine."
          />
        )}

        {state.status === 'loading' && (
          <PlaceholderState icon={Loader2} title="Loading graph..." spinning />
        )}

        {state.status === 'error' && (
          <PlaceholderState
            icon={AlertCircle}
            title="Unable to load graph"
            message={state.message}
            tone="error"
          />
        )}

        {data && data.nodes.length === 0 && (
          <PlaceholderState
            icon={Network}
            title="No relationship data available."
            message="This investigation does not have any correlated entities yet."
          />
        )}

        {data && data.nodes.length > 0 && (
          <>
            {/* Left sidebar */}
            <aside className="hidden w-64 shrink-0 border-r border-border/50 bg-card/30 lg:block">
              <GraphStatsSidebar statistics={data.statistics} />
            </aside>

            {/* Center */}
            <div className="flex min-w-0 flex-1 flex-col">
              <GraphToolbar
                filters={filters}
                onFiltersChange={setFilters}
                entityTypeOptions={entityTypeOptions}
                relationshipTypeOptions={relationshipTypeOptions}
                onExport={handleExport}
                resultCount={resultCount}
                totalCount={data.nodes.length}
              />
              <div className="relative flex-1">
                <ReactFlowProvider>
                  <GraphCanvas
                    nodes={data.nodes}
                    edges={data.edges}
                    filters={filters}
                    selectedId={selectedId}
                    onSelectNode={setSelectedId}
                    registerExport={registerExport}
                  />
                </ReactFlowProvider>
              </div>
            </div>

            {/* Right sidebar */}
            <aside className="hidden w-80 shrink-0 border-l border-border/50 bg-card/30 xl:block">
              <NodeDetailsSidebar
                node={selectedNode}
                connected={connectedEntities}
                onClose={() => setSelectedId(null)}
                onSelectConnected={setSelectedId}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  )
}

function PlaceholderState({
  icon: Icon,
  title,
  message,
  spinning = false,
  tone = 'default',
}: {
  icon: typeof Network
  title: string
  message?: string
  spinning?: boolean
  tone?: 'default' | 'error'
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div
          className={
            tone === 'error'
              ? 'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'
              : 'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary'
          }
        >
          <Icon
            className={
              (tone === 'error' ? 'text-destructive' : 'text-muted-foreground') +
              (spinning ? ' animate-spin' : '')
            }
            style={{ width: 24, height: 24 }}
            aria-hidden="true"
          />
        </div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}
