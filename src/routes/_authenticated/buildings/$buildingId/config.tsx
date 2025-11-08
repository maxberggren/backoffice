import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { BuildingDetailForm } from '@/features/users/components/building-detail'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config')({
  component: BuildingConfig,
})

function BuildingConfig() {
  const { buildingId } = Route.useParams()

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Atrium Flora</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              Building ID: {buildingId}
            </p>
          </div>
        </div>
        <BuildingDetailForm buildingId={buildingId} />
      </Main>
    </>
  )
}

