import { Button } from '@/components/ui/button'
import { SearchForm } from '@/components/investigation/search-form'
import { InvestigationTable } from '@/components/investigation/investigation-table'
import { InvestigationSidebar } from '@/components/investigation/investigation-sidebar'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'Investigation | Digital Investigation System',
  description: 'Search and investigate digital identities',
}

export default function InvestigationPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Digital Investigation
          </h1>
          <p className="text-muted-foreground mt-1">
            Search digital identities and investigate publicly available information.
          </p>
        </div>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          New Investigation
        </Button>
      </div>

      {/* Main Content - Search Form and Table with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Search Form and Results Table */}
        <div className="lg:col-span-2 space-y-6">
          <SearchForm />
          <InvestigationTable />
        </div>

        {/* Right Column - Sidebar */}
        <div>
          <InvestigationSidebar />
        </div>
      </div>
    </div>
  )
}
