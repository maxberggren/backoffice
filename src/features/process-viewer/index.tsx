import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProcessViewerTable } from './components/process-viewer-table'
import { processViewerBuildings } from './data/buildings'

const route = getRouteApi('/_authenticated/process-viewer/')

export function ProcessViewer() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Process Viewer</h2>
            <p className="text-muted-foreground">
              Overview of all buildings and their state for specific processes.
            </p>
          </div>
        </div>
        <ProcessViewerTable data={processViewerBuildings} search={search} navigate={navigate} />
      </Main>
    </>
  )
}

