import { Avatar } from '@/components/ui/avatar'
import { Building2, Thermometer, AlertTriangle, CheckCircle, Settings } from 'lucide-react'

export function RecentSales() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border bg-green-500/10'>
          <CheckCircle className='h-4 w-4 text-green-500' />
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>AI Optimization Applied</p>
            <p className='text-muted-foreground text-sm'>
              Property A - Floor 3
            </p>
          </div>
          <div className='text-sm text-muted-foreground'>2m ago</div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border bg-blue-500/10'>
          <Thermometer className='h-4 w-4 text-blue-500' />
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Temperature Adjusted</p>
            <p className='text-muted-foreground text-sm'>
              Property B - Conference Room
            </p>
          </div>
          <div className='text-sm text-muted-foreground'>15m ago</div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border bg-amber-500/10'>
          <AlertTriangle className='h-4 w-4 text-amber-500' />
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Maintenance Required</p>
            <p className='text-muted-foreground text-sm'>
              Property C - HVAC Unit 2
            </p>
          </div>
          <div className='text-sm text-muted-foreground'>1h ago</div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border bg-purple-500/10'>
          <Settings className='h-4 w-4 text-purple-500' />
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Schedule Updated</p>
            <p className='text-muted-foreground text-sm'>Property A - All Zones</p>
          </div>
          <div className='text-sm text-muted-foreground'>2h ago</div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border bg-cyan-500/10'>
          <Building2 className='h-4 w-4 text-cyan-500' />
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>New Property Added</p>
            <p className='text-muted-foreground text-sm'>
              Property D - Downtown Office
            </p>
          </div>
          <div className='text-sm text-muted-foreground'>3h ago</div>
        </div>
      </div>
    </div>
  )
}
