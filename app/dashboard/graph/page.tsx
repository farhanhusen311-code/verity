import { RelationshipGraphClient } from '@/components/graph/relationship-graph-client'

export const metadata = {
  title: 'Relationship Graph | Digital Investigation System',
  description: 'Visualize digital entities and their relationships.',
}

export default async function GraphPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  return (
    <div className="h-[calc(100vh-4rem)]">
      <RelationshipGraphClient initialInvestigationId={id ?? ''} />
    </div>
  )
}
