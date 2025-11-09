import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Table2 } from 'lucide-react'
import { ProcessViewerTable } from './components/process-viewer-table'
import { processViewerProperties } from './data/properties'

const route = getRouteApi('/_authenticated/process-viewer/')

export function ProcessViewer() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Table2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Process Viewer</h2>
              <p className="text-muted-foreground text-sm">
                Overview of all properties and their state for specific processes
              </p>
            </div>
          </div>
        </div>
        <ProcessViewerTable data={processViewerProperties} search={search} navigate={navigate} />
      </Main>
    </>
  )
}

