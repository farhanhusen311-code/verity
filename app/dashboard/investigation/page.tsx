import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Investigation | Digital Investigation System',
  description: 'Manage and track investigations',
}

export default function InvestigationPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investigations</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all active investigations
          </p>
        </div>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
          + New Investigation
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Investigation management interface is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              This section will display all active and historical investigations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
