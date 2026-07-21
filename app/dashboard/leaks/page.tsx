import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Leak Detection | Digital Investigation System',
  description: 'Monitor data leaks and breaches',
}

export default function LeaksPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leak Detection</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze detected data leaks
          </p>
        </div>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
          + Report Leak
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Leak detection interface is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              This section will display detected data leaks and breach monitoring
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
