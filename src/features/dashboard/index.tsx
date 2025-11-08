import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

export function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>HVAC Control Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button>Export Report</Button>
          </div>
        </div>
        <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Avg Temperature
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>21.5°C</div>
                  <p className='text-muted-foreground text-xs'>
                    Target: 22°C across all buildings
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Buildings
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <rect width='16' height='20' x='4' y='2' rx='2' ry='2' />
                    <path d='M9 22v-4h6v4' />
                    <path d='M8 6h.01' />
                    <path d='M16 6h.01' />
                    <path d='M12 6h.01' />
                    <path d='M12 10h.01' />
                    <path d='M12 14h.01' />
                    <path d='M16 10h.01' />
                    <path d='M16 14h.01' />
                    <path d='M8 10h.01' />
                    <path d='M8 14h.01' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>18/20</div>
                  <p className='text-muted-foreground text-xs'>
                    90% operational, 2 in maintenance
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Energy Usage</CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>1,234 kWh</div>
                  <p className='text-muted-foreground text-xs'>
                    -15% vs last month (AI optimized)
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Alerts
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
                    <path d='M12 9v4' />
                    <path d='M12 17h.01' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>3</div>
                  <p className='text-muted-foreground text-xs'>
                    2 maintenance, 1 high temperature
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Temperature Trends</CardTitle>
                  <CardDescription>
                    Average temperature across all buildings over the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent System Events</CardTitle>
                  <CardDescription>
                    Latest HVAC system activities and adjustments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
        </div>
      </Main>
    </>
  )
}
