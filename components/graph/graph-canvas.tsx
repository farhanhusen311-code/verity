'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
  MarkerType,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react'
import { toPng, toSvg } from 'html-to-image'

import { EntityNode } from './entity-node'
import {
  getCategoryColor,
  getRelationshipLabel,
  confidenceColor,
} from './graph-config'
import type {
  GraphNodeData,
  GraphEdgeData,
  FlowNodePayload,
  GraphFilters,
} from './graph-types'

const nodeTypes = { entity: EntityNode }

interface GraphCanvasProps {
  nodes: GraphNodeData[]
  edges: GraphEdgeData[]
  filters: GraphFilters
  selectedId: string | null
  onSelectNode: (id: string | null) => void
  registerExport: (fn: (format: 'png' | 'svg' | 'json') => void) => void
}

/**
 * Deterministic circular / grid hybrid layout so the same graph always
 * renders identically. No analysis — pure presentation positioning.
 */
function computeLayout(nodes: GraphNodeData[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const count = nodes.length
  if (count === 0) return positions

  if (count === 1) {
    positions.set(nodes[0].id, { x: 0, y: 0 })
    return positions
  }

  // Spread nodes on concentric rings for readability at any scale.
  const perRing = 12
  const ringGap = 260
  nodes.forEach((node, i) => {
    const ring = Math.floor(i / perRing) + 1
    const indexInRing = i % perRing
    const nodesInThisRing = Math.min(perRing, count - (ring - 1) * perRing)
    const angle = (indexInRing / nodesInThisRing) * Math.PI * 2
    const radius = ring * ringGap
    positions.set(node.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })
  })
  return positions
}

function GraphCanvasInner({
  nodes: rawNodes,
  edges: rawEdges,
  filters,
  selectedId,
  onSelectNode,
  registerExport,
}: GraphCanvasProps) {
  const { fitView, getNodes } = useReactFlow()
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)

  // Degree map (connection count) — memoized.
  const degreeMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const edge of rawEdges) {
      map.set(edge.fromEntityId, (map.get(edge.fromEntityId) ?? 0) + 1)
      map.set(edge.toEntityId, (map.get(edge.toEntityId) ?? 0) + 1)
    }
    return map
  }, [rawEdges])

  // Adjacency for highlight of connected nodes — memoized.
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const edge of rawEdges) {
      if (!map.has(edge.fromEntityId)) map.set(edge.fromEntityId, new Set())
      if (!map.has(edge.toEntityId)) map.set(edge.toEntityId, new Set())
      map.get(edge.fromEntityId)!.add(edge.toEntityId)
      map.get(edge.toEntityId)!.add(edge.fromEntityId)
    }
    return map
  }, [rawEdges])

  // Apply filters (search, entity types, relationship types, confidence) — memoized.
  const { visibleNodes, visibleEdges } = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    const nodePassesType =
      filters.entityTypes.length === 0
        ? () => true
        : (n: GraphNodeData) => filters.entityTypes.includes(n.type)

    const nodePassesConfidence = (n: GraphNodeData) => n.confidence >= filters.minConfidence
    const nodePassesSearch = search
      ? (n: GraphNodeData) =>
          n.value.toLowerCase().includes(search) || n.type.toLowerCase().includes(search)
      : () => true

    const keptNodes = rawNodes.filter(
      (n) => nodePassesType(n) && nodePassesConfidence(n) && nodePassesSearch(n),
    )
    const keptIds = new Set(keptNodes.map((n) => n.id))

    const edgePassesType =
      filters.relationshipTypes.length === 0
        ? () => true
        : (e: GraphEdgeData) => filters.relationshipTypes.includes(e.type)

    const keptEdges = rawEdges.filter(
      (e) =>
        keptIds.has(e.fromEntityId) &&
        keptIds.has(e.toEntityId) &&
        edgePassesType(e) &&
        e.confidence >= filters.minConfidence,
    )

    return { visibleNodes: keptNodes, visibleEdges: keptEdges }
  }, [rawNodes, rawEdges, filters])

  const layout = useMemo(() => computeLayout(visibleNodes), [visibleNodes])

  // Build React Flow nodes — memoized on visibility, selection, and layout.
  const flowNodes: Node[] = useMemo(() => {
    const connectedToSelected = selectedId ? adjacency.get(selectedId) ?? new Set<string>() : null
    return visibleNodes.map((entity) => {
      const highlighted =
        !!selectedId && (entity.id === selectedId || !!connectedToSelected?.has(entity.id))
      const dimmed = !!selectedId && !highlighted
      const payload: FlowNodePayload = {
        entity,
        degree: degreeMap.get(entity.id) ?? 0,
        dimmed,
        highlighted,
      }
      return {
        id: entity.id,
        type: 'entity',
        position: layout.get(entity.id) ?? { x: 0, y: 0 },
        data: payload,
        selected: entity.id === selectedId,
      }
    })
  }, [visibleNodes, layout, degreeMap, adjacency, selectedId])

  // Build React Flow edges — memoized.
  const flowEdges: Edge[] = useMemo(() => {
    const connectedToSelected = selectedId ? adjacency.get(selectedId) ?? new Set<string>() : null
    return visibleEdges.map((edge) => {
      const touchesSelected =
        !!selectedId && (edge.fromEntityId === selectedId || edge.toEntityId === selectedId)
      const dimmed = !!selectedId && !touchesSelected
      const color = getCategoryColor(
        rawNodes.find((n) => n.id === edge.fromEntityId)?.type ?? 'other',
      ).hex
      return {
        id: edge.id,
        source: edge.fromEntityId,
        target: edge.toEntityId,
        label: `${getRelationshipLabel(edge.type)} · ${edge.confidence}%`,
        animated: touchesSelected,
        style: {
          stroke: color,
          strokeWidth: touchesSelected ? 2.5 : 1.5,
          opacity: dimmed ? 0.12 : 0.9,
        },
        labelStyle: { fontSize: 10, fill: 'var(--foreground)', fontWeight: 500 },
        labelBgStyle: { fill: 'var(--card)', fillOpacity: 0.9 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
        data: { edge },
        connectedToSelected,
      }
    })
  }, [visibleEdges, rawNodes, selectedId, adjacency])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  // Keep internal state in sync when derived data changes.
  useEffect(() => setNodes(flowNodes), [flowNodes, setNodes])
  useEffect(() => setEdges(flowEdges), [flowEdges, setEdges])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_evt, node) => onSelectNode(node.id),
    [onSelectNode],
  )

  const handlePaneClick = useCallback(() => onSelectNode(null), [onSelectNode])

  // ---- Export ----
  const doExport = useCallback(
    async (format: 'png' | 'svg' | 'json') => {
      if (format === 'json') {
        const payload = {
          nodes: rawNodes,
          edges: rawEdges,
          exportedAt: new Date().toISOString(),
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        triggerDownload(URL.createObjectURL(blob), 'relationship-graph.json')
        return
      }

      const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport')
      if (!viewportEl) return

      const bounds = getNodesBounds(getNodes())
      const width = Math.max(bounds.width + 200, 800)
      const height = Math.max(bounds.height + 200, 600)
      const transform = getViewportForBounds(bounds, width, height, 0.5, 2, 0.1)

      const style = {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      }
      const bgColor = getComputedStyle(document.body).backgroundColor || '#0a0a0a'

      const exporter = format === 'png' ? toPng : toSvg
      const dataUrl = await exporter(viewportEl, {
        backgroundColor: bgColor,
        width,
        height,
        style,
      })
      triggerDownload(dataUrl, `relationship-graph.${format}`)
    },
    [getNodes, rawNodes, rawEdges],
  )

  useEffect(() => {
    registerExport(doExport)
  }, [doExport, registerExport])

  const minimapNodeColor = useCallback(
    (node: Node) => getCategoryColor((node.data as FlowNodePayload).entity.type).hex,
    [],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      onEdgeMouseEnter={(_e, edge) => setHoveredEdge(edge.id)}
      onEdgeMouseLeave={() => setHoveredEdge(null)}
      fitView
      minZoom={0.1}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      className="bg-background"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-40" />
      <Controls className="!border-border !bg-card !shadow-md [&_button]:!border-border [&_button]:!bg-card [&_button]:!fill-foreground hover:[&_button]:!bg-secondary" />
      <MiniMap
        pannable
        zoomable
        nodeColor={minimapNodeColor}
        maskColor="rgba(0,0,0,0.6)"
        className="!border !border-border !bg-card"
      />
      {hoveredEdge && <EdgeTooltip edgeId={hoveredEdge} edges={visibleEdges} />}
    </ReactFlow>
  )
}

/** Small floating tooltip for the hovered edge. */
function EdgeTooltip({ edgeId, edges }: { edgeId: string; edges: GraphEdgeData[] }) {
  const edge = edges.find((e) => e.id === edgeId)
  if (!edge) return null
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-lg">
      <span className="font-semibold text-foreground">{getRelationshipLabel(edge.type)}</span>
      <span className="mx-1.5 text-muted-foreground">·</span>
      <span className={confidenceColor(edge.confidence)}>{edge.confidence}% confidence</span>
      {edge.evidence && (
        <span className="ml-1.5 text-muted-foreground">— {edge.evidence}</span>
      )}
    </div>
  )
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function GraphCanvas(props: GraphCanvasProps) {
  return <GraphCanvasInner {...props} />
}
