import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function SignalExport() {
  const [signalType, setSignalType] = useState('all')
  const [experimentalType, setExperimentalType] = useState('all')

  const handleExport = () => {
    // In a real implementation, this would call an API endpoint
    // eslint-disable-next-line no-console
    console.log('Exporting signals:', { signalType, experimentalType })
    // Simulate file download
    alert('Excel file download would start here')
  }

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
            Get Signals as Excel File
          </h2>
          <p className='text-muted-foreground'>
            Export HVAC sensor signals and control data for analysis
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:w-2/3'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Select signal type</label>
            <Select value={signalType} onValueChange={setSignalType}>
              <SelectTrigger>
                <SelectValue placeholder='Select signal type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>--- All Signals ---</SelectItem>
                <SelectItem value='temperature'>Temperature</SelectItem>
                <SelectItem value='co2'>CO2</SelectItem>
                <SelectItem value='humidity'>Humidity</SelectItem>
                <SelectItem value='pressure'>Pressure</SelectItem>
                <SelectItem value='flow'>Flow Rate</SelectItem>
                <SelectItem value='power'>Power Consumption</SelectItem>
                <SelectItem value='valve'>Valve Position</SelectItem>
                <SelectItem value='setpoint'>Setpoints</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Select experimental</label>
            <Select
              value={experimentalType}
              onValueChange={setExperimentalType}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select experimental type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All types</SelectItem>
                <SelectItem value='production'>Production Only</SelectItem>
                <SelectItem value='experimental'>Experimental Only</SelectItem>
                <SelectItem value='beta'>Beta Features</SelectItem>
                <SelectItem value='archived'>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Button onClick={handleExport} size='lg' className='gap-2'>
            <Download className='h-4 w-4' />
            Get excel file (.xlsx)
          </Button>
        </div>

        <div className='bg-muted/50 rounded-lg border p-4 lg:w-2/3'>
          <h3 className='mb-2 font-semibold'>Export Information</h3>
          <ul className='text-muted-foreground space-y-1 text-sm'>
            <li>• Excel file includes all selected signal data</li>
            <li>• Data is exported with timestamps and values</li>
            <li>• File format is compatible with Excel 2010 and later</li>
            <li>
              • Historical data range: Last 30 days (configurable in settings)
            </li>
          </ul>
        </div>
      </Main>
    </>
  )
}

