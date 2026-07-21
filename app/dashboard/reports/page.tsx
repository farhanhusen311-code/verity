import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'Reports | Digital Investigation System',
  description: 'Generate and manage investigation reports',
}

export default function ReportsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage investigation reports
          </p>
        </div>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
          + Generate Report
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Report generation interface is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              This section will allow you to generate and manage investigation reports
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
