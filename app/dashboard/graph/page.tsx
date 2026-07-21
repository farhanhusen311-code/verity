import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

export const metadata = {
  title: 'Relationship Graph | Digital Investigation System',
  description: 'Visualize entity relationships and connections',
}

export default function GraphPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relationship Graph</h1>
          <p className="text-muted-foreground mt-1">
            Visualize entity relationships and connections
          </p>
        </div>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
          + New Graph
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Relationship graph visualization is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              This section will display relationship graphs and entity connections
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
