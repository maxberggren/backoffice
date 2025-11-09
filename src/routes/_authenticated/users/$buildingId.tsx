import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PropertyDetailForm } from '@/features/users/components/property-detail'

export const Route = createFileRoute('/_authenticated/users/$buildingId')({
  component: PropertyDetail,
})

function PropertyDetail() {
  const { buildingId } = Route.useParams()

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Property Configuration
          </h2>
          <p className='text-muted-foreground'>
            Configure property settings and AI parameters
          </p>
        </div>
        <PropertyDetailForm propertyId={buildingId} />
      </Main>
    </>
  )
}
