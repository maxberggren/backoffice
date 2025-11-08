import { createFileRoute } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { BuildingDetailForm } from '@/features/users/components/building-detail'

export const Route = createFileRoute('/_authenticated/users/$buildingId')({
  component: BuildingDetail,
})

function BuildingDetail() {
  const { buildingId } = Route.useParams()

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Building Configuration
          </h2>
          <p className='text-muted-foreground'>
            Configure building settings and AI parameters
          </p>
        </div>
        <BuildingDetailForm buildingId={buildingId} />
      </Main>
    </>
  )
}
