import { Outlet } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Building2 } from 'lucide-react'
import { usePropertyStore } from '@/stores/property-store'

export function Configuration() {
  const { selectedProperty } = usePropertyStore()

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Building2 className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Configuration
              </h2>
              <p className='text-muted-foreground text-sm'>
                {selectedProperty?.name || 'Configure property settings and parameters'}
              </p>
            </div>
          </div>
        </div>
        <div>
          <Outlet />
        </div>
      </Main>
    </>
  )
}

