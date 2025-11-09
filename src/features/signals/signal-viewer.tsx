import { useCallback, useMemo, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { createSignalColumns } from './signal-columns'
import { DataTableViewOptions } from '@/components/data-table'

// Sample signal data
const generateSignals = () => {
  const signals = []
  const buildings = ['Atrium Flora', 'Corporate Tower', 'Tech Hub']
  const types = ['temperature', 'co2', 'humidity', 'pressure']
  const classifications = ['GT', 'CO2', 'RH', 'P']
  const signalPositions = ['Input', 'Output', 'Feedback', 'Control']
  const signalTypes = ['Analog', 'Digital', 'Pulse', 'Modbus']
  const sourceComponents = ['AHU-01', 'VAV-02', 'RTU-03', 'FCU-04']
  const componentNames = ['Air Handler Unit', 'Variable Air Volume', 'Roof Top Unit', 'Fan Coil Unit']
  let id = 0
  
  for (const building of buildings) {
    for (let floor = 0; floor < 4; floor++) {
      for (let zone = 5; zone < 9; zone++) {
        for (let i = 0; i < types.length; i++) {
          const positionIndex = Math.floor(Math.random() * signalPositions.length)
          const typeIndex = Math.floor(Math.random() * signalTypes.length)
          const componentIndex = Math.floor(Math.random() * sourceComponents.length)
          
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
            signalPosition: signalPositions[positionIndex],
            signalType: signalTypes[typeIndex],
            sourceComponent: sourceComponents[componentIndex],
            componentName: componentNames[componentIndex],
          })
        }
      }
    }
  }
  return signals
}

export type Signal = {
  id: number
  name: string
  rw: string
  type: string
  classification: string
  description: string
  min: number
  max: number
  enabled: boolean
  signalPosition?: string
  signalType?: string
  sourceComponent?: string
  componentName?: string
}

export function SignalViewer() {
  const [signals, setSignals] = useState<Signal[]>(generateSignals())
  const [searchTerm, setSearchTerm] = useState('')
  const [validation, setValidation] = useState(false)
  const [nameEditing, setNameEditing] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    signalPosition: false,
    signalType: false,
    sourceComponent: false,
    componentName: false,
  })
  const itemsPerPage = 50

  const updateSignal = useCallback((signalId: number, field: keyof Signal, value: string | number | boolean) => {
    setSignals((prev) => {
      return prev.map((signal) =>
        signal.id === signalId ? { ...signal, [field]: value } : signal
      )
    })
  }, [])

  const columns = useMemo(
    () => createSignalColumns({ nameEditing, updateSignal }),
    [nameEditing, updateSignal]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: signals,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      return !!(
        row.original.name.toLowerCase().includes(search) ||
        row.original.description.toLowerCase().includes(search) ||
        row.original.classification.toLowerCase().includes(search) ||
        row.original.rw.toLowerCase().includes(search) ||
        row.original.type.toLowerCase().includes(search) ||
        row.original.signalPosition?.toLowerCase().includes(search) ||
        row.original.signalType?.toLowerCase().includes(search) ||
        row.original.sourceComponent?.toLowerCase().includes(search) ||
        row.original.componentName?.toLowerCase().includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: itemsPerPage,
      },
    },
  })

  const filteredCount = table.getFilteredRowModel().rows.length
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const startIndex = table.getState().pagination.pageIndex * itemsPerPage
  const endIndex = startIndex + table.getRowModel().rows.length

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
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Activity className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Signal Viewer
              </h2>
              <p className='text-muted-foreground text-sm'>
                View and manage HVAC sensor signals and control points
              </p>
            </div>
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
                  const visibleSignalIds = table.getRowModel().rows.map((row) => row.original.id)
                  setSignals((prev) =>
                    prev.map((signal) =>
                      visibleSignalIds.includes(signal.id)
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCount)} of{' '}
                {filteredCount} entries
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  placeholder='Search...'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    table.setPageIndex(0)
                  }}
                  className='max-w-xs'
                />
                <DataTableViewOptions table={table} />
              </div>
            </div>

            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={header.column.columnDef.meta?.className}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cell.column.columnDef.meta?.className}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='h-24 text-center'>
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              {[...Array(Math.min(10, totalPages))].map((_, i) => {
                const page = i
                return (
                  <Button
                    key={page}
                    variant={currentPage === page + 1 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => table.setPageIndex(page)}
                  >
                    {page + 1}
                  </Button>
                )
              })}
              {totalPages > 10 && <span className='px-2'>...</span>}
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
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

