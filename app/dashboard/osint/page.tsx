import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network } from 'lucide-react'

export const metadata = {
  title: 'OSINT | Digital Investigation System',
  description: 'Open Source Intelligence gathering and analysis',
}

export default function OSINTPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">OSINT</h1>
          <p className="text-muted-foreground mt-1">
            Open Source Intelligence gathering and analysis
          </p>
        </div>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
          + New Query
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            OSINT analysis interface is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Network className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              This section will provide OSINT tools for intelligence gathering
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
