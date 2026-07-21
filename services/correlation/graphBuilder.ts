import { logger } from '@/lib/logger'
import { CorrelationEntity, CorrelationRelationship, CorrelationGraph, GraphStatistics, EntityTypeStr, RelationshipTypeStr } from './types'

export class GraphBuilder {
  /**
   * Build knowledge graph from entities and relationships
   */
  build(entities: CorrelationEntity[], relationships: CorrelationRelationship[]): CorrelationGraph {
    try {
      logger.info('Building knowledge graph', { entityCount: entities.length, relationshipCount: relationships.length })

      // Build adjacency list
      const adjacencyList = new Map<string, string[]>()
      for (const entity of entities) {
        const id = entity.id || entity.normalizedHash
        adjacencyList.set(id, [])
      }

      // Add edges to adjacency list
      for (const rel of relationships) {
        if (!adjacencyList.has(rel.fromEntityId)) {
          adjacencyList.set(rel.fromEntityId, [])
        }
        if (!adjacencyList.has(rel.toEntityId)) {
          adjacencyList.set(rel.toEntityId, [])
        }

        adjacencyList.get(rel.fromEntityId)!.push(rel.toEntityId)
        adjacencyList.get(rel.toEntityId)!.push(rel.fromEntityId)
      }

      // Build adjacency matrix
      const entityIds = Array.from(adjacencyList.keys())
      const nodeCount = entityIds.length
      const adjacencyMatrix: number[][] = Array(nodeCount)
        .fill(null)
        .map(() => Array(nodeCount).fill(0))

      for (let i = 0; i < nodeCount; i++) {
        for (let j = 0; j < nodeCount; j++) {
          if (i !== j) {
            const fromId = entityIds[i]
            const toId = entityIds[j]

            // Check if there's a relationship
            const hasRelationship = relationships.some(
              (r) => r.fromEntityId === fromId && r.toEntityId === toId
            )

            if (hasRelationship) {
              // Find the relationship and use its weight
              const rel = relationships.find((r) => r.fromEntityId === fromId && r.toEntityId === toId)
              adjacencyMatrix[i][j] = rel?.weight || 1
            }
          }
        }
      }

      const graph: CorrelationGraph = {
        nodes: entities,
        edges: relationships,
        adjacencyList,
        adjacencyMatrix,
      }

      logger.info('Knowledge graph built successfully', { nodeCount: entities.length, edgeCount: relationships.length })
      return graph
    } catch (error) {
      logger.error('Error building knowledge graph', { error })
      throw error
    }
  }

  /**
   * Calculate graph statistics
   */
  calculateStatistics(graph: CorrelationGraph): GraphStatistics {
    try {
      const { nodes, edges, adjacencyList } = graph

      // Entity type distribution
      const entityTypeDistribution: Record<EntityTypeStr, number> = {} as any
      for (const entity of nodes) {
        entityTypeDistribution[entity.type] = (entityTypeDistribution[entity.type] || 0) + 1
      }

      // Relationship type distribution
      const relationshipTypeDistribution: Record<RelationshipTypeStr, number> = {} as any
      for (const rel of edges) {
        relationshipTypeDistribution[rel.type] = (relationshipTypeDistribution[rel.type] || 0) + 1
      }

      // Calculate degrees
      const degrees = new Map<string, number>()
      for (const [nodeId, neighbors] of adjacencyList.entries()) {
        degrees.set(nodeId, neighbors.length)
      }

      // Find highest connected entity
      let maxDegree = 0
      let highestNode: CorrelationEntity | null = null

      for (const node of nodes) {
        const nodeId = node.id || node.normalizedHash
        const degree = degrees.get(nodeId) || 0
        if (degree > maxDegree) {
          maxDegree = degree
          highestNode = node
        }
      }

      // Calculate average degree
      const totalDegree = Array.from(degrees.values()).reduce((a, b) => a + b, 0)
      const averageDegree = nodes.length > 0 ? totalDegree / nodes.length : 0

      // Calculate connected components
      const connectedComponents = this.countConnectedComponents(graph)

      // Calculate average confidence
      const averageConfidence =
        edges.length > 0 ? Math.round(edges.reduce((sum, e) => sum + e.confidence, 0) / edges.length) : 0

      const statistics: GraphStatistics = {
        totalEntities: nodes.length,
        totalRelationships: edges.length,
        connectedComponents,
        averageDegree: Math.round(averageDegree * 100) / 100,
        highestConnectedEntity: highestNode
          ? {
              id: highestNode.id || highestNode.normalizedHash,
              value: highestNode.value,
              degree: maxDegree,
            }
          : {
              id: '',
              value: '',
              degree: 0,
            },
        entityTypeDistribution,
        relationshipTypeDistribution,
        averageConfidence,
      }

      logger.info('Graph statistics calculated', {
        totalEntities: statistics.totalEntities,
        totalRelationships: statistics.totalRelationships,
        connectedComponents: statistics.connectedComponents,
        averageDegree: statistics.averageDegree,
        averageConfidence: statistics.averageConfidence,
      })

      return statistics
    } catch (error) {
      logger.error('Error calculating statistics', { error })
      throw error
    }
  }

  /**
   * Count connected components using DFS
   */
  private countConnectedComponents(graph: CorrelationGraph): number {
    const { nodes, adjacencyList } = graph
    const visited = new Set<string>()
    let components = 0

    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return

      visited.add(nodeId)
      const neighbors = adjacencyList.get(nodeId) || []

      for (const neighbor of neighbors) {
        dfs(neighbor)
      }
    }

    for (const node of nodes) {
      const nodeId = node.id || node.normalizedHash
      if (!visited.has(nodeId)) {
        dfs(nodeId)
        components++
      }
    }

    return components
  }

  /**
   * Find shortest path between two entities
   */
  findShortestPath(graph: CorrelationGraph, fromId: string, toId: string): string[] | null {
    try {
      const { adjacencyList } = graph
      const queue: string[] = [fromId]
      const visited = new Set<string>([fromId])
      const previous = new Map<string, string>()

      while (queue.length > 0) {
        const current = queue.shift()!

        if (current === toId) {
          // Reconstruct path
          const path: string[] = []
          let node: string | undefined = toId

          while (node !== undefined) {
            path.unshift(node)
            node = previous.get(node)
          }

          return path
        }

        const neighbors = adjacencyList.get(current) || []
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            previous.set(neighbor, current)
            queue.push(neighbor)
          }
        }
      }

      return null
    } catch (error) {
      logger.warn('Error finding shortest path', { error })
      return null
    }
  }

  /**
   * Find all nodes connected to a given node (connected component)
   */
  findConnectedComponent(graph: CorrelationGraph, nodeId: string): string[] {
    try {
      const { adjacencyList } = graph
      const visited = new Set<string>()
      const stack = [nodeId]

      while (stack.length > 0) {
        const current = stack.pop()!

        if (visited.has(current)) continue

        visited.add(current)
        const neighbors = adjacencyList.get(current) || []

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor)
          }
        }
      }

      return Array.from(visited)
    } catch (error) {
      logger.warn('Error finding connected component', { error })
      return []
    }
  }

  /**
   * Calculate centrality score for nodes (degree centrality)
   */
  calculateCentrality(graph: CorrelationGraph): Map<string, number> {
    const { nodes, adjacencyList } = graph
    const centrality = new Map<string, number>()

    const maxDegree = Math.max(...Array.from(adjacencyList.values()).map((neighbors) => neighbors.length), 1)

    for (const node of nodes) {
      const nodeId = node.id || node.normalizedHash
      const degree = adjacencyList.get(nodeId)?.length || 0
      const normalizedCentrality = maxDegree > 0 ? degree / maxDegree : 0

      centrality.set(nodeId, Math.round(normalizedCentrality * 100) / 100)
    }

    return centrality
  }
}

export const graphBuilder = new GraphBuilder()
