import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Upload } from 'lucide-react'

export function SignalImport() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!file) {
      alert('Please select a file to import')
      return
    }
    // In a real implementation, this would call an API endpoint
    // eslint-disable-next-line no-console
    console.log('Importing signals from file:', file.name)
    alert(`Importing signals from ${file.name}`)
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
            Import Signals from Excel File
          </h2>
          <p className='text-muted-foreground'>
            Upload and import HVAC sensor signals and control data from Excel files
          </p>
        </div>

        <Card className='lg:w-2/3'>
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
            <CardDescription>
              Select an Excel file (.xlsx) containing signal data to import
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              <label
                htmlFor='file-upload'
                className='cursor-pointer'
              >
                <input
                  id='file-upload'
                  type='file'
                  accept='.xlsx,.xls'
                  onChange={handleFileChange}
                  className='hidden'
                />
                <Button variant='outline' type='button' asChild>
                  <span className='gap-2'>
                    <Upload className='h-4 w-4' />
                    Choose File
                  </span>
                </Button>
              </label>
              {file && (
                <span className='text-sm text-muted-foreground'>
                  {file.name}
                </span>
              )}
            </div>

            <Button onClick={handleImport} size='lg' className='gap-2' disabled={!file}>
              <Upload className='h-4 w-4' />
              Import Signals
            </Button>
          </CardContent>
        </Card>

        <div className='bg-muted/50 rounded-lg border p-4 lg:w-2/3'>
          <h3 className='mb-2 font-semibold'>Import Information</h3>
          <ul className='text-muted-foreground space-y-1 text-sm'>
            <li>• Excel file must be in .xlsx or .xls format</li>
            <li>• File should contain signal names, timestamps, and values</li>
            <li>• First row should contain column headers</li>
            <li>• Supported date formats: ISO 8601, Excel date serial numbers</li>
            <li>• Duplicate signals will be updated with new values</li>
          </ul>
        </div>
      </Main>
    </>
  )
}

