'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal, Download, X, Check, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { getNodeVisual, getRelationshipLabel } from './graph-config'
import type { GraphFilters } from './graph-types'

interface GraphToolbarProps {
  filters: GraphFilters
  onFiltersChange: (filters: GraphFilters) => void
  entityTypeOptions: string[]
  relationshipTypeOptions: string[]
  onExport: (format: 'png' | 'svg' | 'json') => void
  resultCount: number
  totalCount: number
}

export function GraphToolbar({
  filters,
  onFiltersChange,
  entityTypeOptions,
  relationshipTypeOptions,
  onExport,
  resultCount,
  totalCount,
}: GraphToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleEntityType = (type: string) => {
    const next = filters.entityTypes.includes(type)
      ? filters.entityTypes.filter((t) => t !== type)
      : [...filters.entityTypes, type]
    onFiltersChange({ ...filters, entityTypes: next })
  }

  const toggleRelationshipType = (type: string) => {
    const next = filters.relationshipTypes.includes(type)
      ? filters.relationshipTypes.filter((t) => t !== type)
      : [...filters.relationshipTypes, type]
    onFiltersChange({ ...filters, relationshipTypes: next })
  }

  const activeFilterCount =
    filters.entityTypes.length +
    filters.relationshipTypes.length +
    (filters.minConfidence > 0 ? 1 : 0)

  const clearFilters = () =>
    onFiltersChange({ search: filters.search, entityTypes: [], relationshipTypes: [], minConfidence: 0 })

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-card/50 p-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Search nodes by value or type..."
          className="pl-9 pr-9"
          aria-label="Search nodes"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onFiltersChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="relative" ref={filterRef}>
        <Button
          variant="outline"
          onClick={() => setFilterOpen((o) => !o)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {filterOpen && (
          <div className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-border bg-popover p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Filters</p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Confidence */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Min Confidence</label>
                <span className="text-xs text-muted-foreground">{filters.minConfidence}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={filters.minConfidence}
                onChange={(e) =>
                  onFiltersChange({ ...filters, minConfidence: Number(e.target.value) })
                }
                className="w-full accent-primary"
                aria-label="Minimum confidence"
              />
            </div>

            {/* Entity types */}
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-medium text-foreground">Entity Type</p>
              <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                {entityTypeOptions.map((type) => {
                  const active = filters.entityTypes.includes(type)
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleEntityType(type)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs hover:bg-secondary"
                    >
                      <span className="text-foreground">{getNodeVisual(type).label}</span>
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          active ? 'border-primary bg-primary' : 'border-border',
                        )}
                      >
                        {active && <Check className="h-3 w-3 text-primary-foreground" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Relationship types */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-foreground">Relationship Type</p>
              <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                {relationshipTypeOptions.map((type) => {
                  const active = filters.relationshipTypes.includes(type)
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleRelationshipType(type)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs hover:bg-secondary"
                    >
                      <span className="text-foreground">{getRelationshipLabel(type)}</span>
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          active ? 'border-primary bg-primary' : 'border-border',
                        )}
                      >
                        {active && <Check className="h-3 w-3 text-primary-foreground" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export */}
      <div className="relative" ref={exportRef}>
        <Button variant="outline" onClick={() => setExportOpen((o) => !o)} className="gap-2">
          <Download className="h-4 w-4" />
          Export
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        {exportOpen && (
          <div className="absolute right-0 z-30 mt-2 w-40 rounded-lg border border-border bg-popover p-1 shadow-lg">
            {(['png', 'svg', 'json'] as const).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => {
                  onExport(format)
                  setExportOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                Export {format.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden shrink-0 items-center text-xs text-muted-foreground sm:flex">
        {resultCount} / {totalCount} nodes
      </div>
    </div>
  )
}
