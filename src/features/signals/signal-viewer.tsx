import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Activity } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Sample signal data
const generateSignals = () => {
  const signals = []
  const buildings = ['Atrium Flora', 'Corporate Tower', 'Tech Hub']
  const types = ['temperature', 'co2', 'humidity', 'pressure']
  const classifications = ['GT', 'CO2', 'RH', 'P']
  let id = 0
  
  for (let building of buildings) {
    for (let floor = 0; floor < 4; floor++) {
      for (let zone = 5; zone < 9; zone++) {
        for (let i = 0; i < types.length; i++) {
          signals.push({
            id: id++,
            name: `${building.replace(/\s/g, '_')}_P${floor}_S${zone}_${types[i]}`,
            rw: 'R',
            type: 'O',
            classification: classifications[i],
            description: `${building},${floor},${zone}`,
            min: types[i] === 'temperature' ? 18 : types[i] === 'co2' ? 300 : types[i] === 'humidity' ? 30 : 0,
            max: types[i] === 'temperature' ? 24 : types[i] === 'co2' ? 1000 : types[i] === 'humidity' ? 70 : 100,
            enabled: Math.random() > 0.3,
          })
        }
      }
    }
  }
  return signals
}

type Signal = {
  id: number
  name: string
  rw: string
  type: string
  classification: string
  description: string
  min: number
  max: number
  enabled: boolean
}

export function SignalViewer() {
  const [signals, setSignals] = useState<Signal[]>(generateSignals())
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [validation, setValidation] = useState(false)
  const [nameEditing, setNameEditing] = useState(false)
  const itemsPerPage = 50

  const filteredSignals = signals.filter((signal) =>
    signal.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredSignals.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSignals = filteredSignals.slice(startIndex, endIndex)

  const updateSignal = (signalId: number, field: keyof Signal, value: string | number | boolean) => {
    setSignals((prev) => {
      return prev.map((signal) =>
        signal.id === signalId ? { ...signal, [field]: value } : signal
      )
    })
  }

  const validationErrors = [
    'Signal "Atrium_Flora_P2_S7_temperature" has out-of-range value',
    'Signal "Tech_Hub_P1_S5_co2" missing last 3 readings',
  ]

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <Activity className='h-6 w-6' />
              <h2 className='text-2xl font-bold tracking-tight'>
                Signal Viewer
              </h2>
            </div>
            <p className='text-muted-foreground'>
              View and manage HVAC sensor signals and control points
            </p>
          </div>
          <Button variant='outline'>Show Changelog</Button>
        </div>

        {validation && validationErrors.length > 0 && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>
                  Validation Messages
                </span>
                <Badge variant='destructive'>{validationErrors.length}</Badge>
              </div>
              <ul className='mt-2 space-y-1 text-sm'>
                {validationErrors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className='rounded-lg border bg-card'>
          <div className='border-b p-4'>
            <h3 className='font-semibold'>Signals & Controls</h3>
          </div>

          <div className='space-y-4 p-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='validation'
                  checked={validation}
                  onCheckedChange={(checked) =>
                    setValidation(checked as boolean)
                  }
                />
                <label
                  htmlFor='validation'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Validation
                </label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='nameEditing'
                  checked={nameEditing}
                  onCheckedChange={(checked) =>
                    setNameEditing(checked as boolean)
                  }
                />
                <label
                  htmlFor='nameEditing'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Name editing
                </label>
              </div>

              <Button
                className='ms-auto'
                onClick={() => {
                  setSignals((prev) =>
                    prev.map((signal) =>
                      currentSignals.some((cs) => cs.id === signal.id)
                        ? { ...signal, enabled: true }
                        : signal
                    )
                  )
                }}
              >
                Enable all visible signals
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div className='text-muted-foreground text-sm'>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSignals.length)} of{' '}
                {filteredSignals.length} entries
              </div>
              <Input
                placeholder='Search...'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className='max-w-xs'
              />
            </div>

            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>R/W</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right'>Min</TableHead>
                    <TableHead className='text-right'>Max</TableHead>
                    <TableHead>Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSignals.map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell className='font-mono text-xs'>
                        {nameEditing ? (
                          <Input
                            value={signal.name}
                            onChange={(e) => updateSignal(signal.id, 'name', e.target.value)}
                            className='h-8 text-xs'
                          />
                        ) : (
                          signal.name
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={signal.rw}
                          onValueChange={(value) => updateSignal(signal.id, 'rw', value)}
                        >
                          <SelectTrigger className='h-8 w-16'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='R'>R</SelectItem>
                            <SelectItem value='W'>W</SelectItem>
                            <SelectItem value='RW'>RW</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={signal.type}
                          onValueChange={(value) => updateSignal(signal.id, 'type', value)}
                        >
                          <SelectTrigger className='h-8 w-16'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='O'>O</SelectItem>
                            <SelectItem value='I'>I</SelectItem>
                            <SelectItem value='V'>V</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={signal.classification}
                          onValueChange={(value) => updateSignal(signal.id, 'classification', value)}
                        >
                          <SelectTrigger className='h-8 w-20'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='GT'>GT</SelectItem>
                            <SelectItem value='CO2'>CO2</SelectItem>
                            <SelectItem value='RH'>RH</SelectItem>
                            <SelectItem value='P'>P</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className='text-sm'>
                        <Input
                          value={signal.description}
                          onChange={(e) => updateSignal(signal.id, 'description', e.target.value)}
                          className='h-8 text-sm'
                        />
                      </TableCell>
                      <TableCell className='text-right'>
                        <Input
                          type='number'
                          value={signal.min}
                          onChange={(e) => updateSignal(signal.id, 'min', parseFloat(e.target.value) || 0)}
                          className='h-8 w-20 text-right'
                        />
                      </TableCell>
                      <TableCell className='text-right'>
                        <Input
                          type='number'
                          value={signal.max}
                          onChange={(e) => updateSignal(signal.id, 'max', parseFloat(e.target.value) || 0)}
                          className='h-8 w-20 text-right'
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={signal.enabled}
                          onCheckedChange={(checked) => updateSignal(signal.id, 'enabled', checked as boolean)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {[...Array(Math.min(10, totalPages))].map((_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              {totalPages > 10 && <span className='px-2'>...</span>}
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

