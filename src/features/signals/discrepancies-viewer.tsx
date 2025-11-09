import { useMemo, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableViewOptions, DataTableColumnHeader } from '@/components/data-table'
import { Gauge } from 'lucide-react'

export type Discrepancy = {
  id: number
  variable: string
  status: 'OK' | 'WARNING' | 'ERROR'
  discrepancyValue: number
}

// Sample data based on the image
const generateDiscrepancies = (): Discrepancy[] => {
  return [
    { id: 1, variable: 'KB13_GT101', status: 'OK', discrepancyValue: 0.55 },
    { id: 2, variable: 'LB22_GT101', status: 'OK', discrepancyValue: 0.09 },
    { id: 3, variable: 'LB23_GT101', status: 'OK', discrepancyValue: 0.97 },
    { id: 4, variable: 'VS21_GT101', status: 'OK', discrepancyValue: 0.13 },
    { id: 5, variable: 'LB11_GP101', status: 'OK', discrepancyValue: 0.25 },
    { id: 6, variable: 'LB22_GP101', status: 'OK', discrepancyValue: 1.0 },
    { id: 7, variable: 'LB21_GT101', status: 'OK', discrepancyValue: 0.06 },
    { id: 8, variable: 'VS13_GT101', status: 'OK', discrepancyValue: 0.16 },
    { id: 9, variable: 'VS14_GT101', status: 'OK', discrepancyValue: 1.61 },
    { id: 10, variable: 'LB11_GT101', status: 'OK', discrepancyValue: 0.44 },
  ]
}

const createDiscrepancyColumns = (): ColumnDef<Discrepancy>[] => [
  {
    accessorKey: 'variable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Variable' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('variable')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant='outline'
          className='bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
        >
          {status}
        </Badge>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'discrepancyValue',
    header: ({ column }) => (
      <div className='flex justify-end'>
        <DataTableColumnHeader column={column} title='Discrepancy Value' />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('discrepancyValue') as number
      return (
        <div className='text-right font-mono text-sm'>
          {value.toFixed(2)} °C
        </div>
      )
    },
    enableSorting: true,
    meta: { className: 'text-right' },
  },
]

export function DiscrepanciesViewer() {
  const [discrepancies] = useState<Discrepancy[]>(generateDiscrepancies())
  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const itemsPerPage = 50

  const columns = useMemo(() => createDiscrepancyColumns(), [])

  const table = useReactTable({
    data: discrepancies,
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
      return (
        row.original.variable.toLowerCase().includes(search) ||
        row.original.status.toLowerCase().includes(search)
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
              <Gauge className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Read-Write Discrepancies
              </h2>
              <p className='text-muted-foreground text-sm'>
                Monitor discrepancies between read and write values for signal variables
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border bg-card'>
          <div className='border-b p-4'>
            <h3 className='font-semibold'>Discrepancy Data</h3>
          </div>

          <div className='space-y-4 p-4'>
            <div className='flex items-center justify-between'>
              <div className='text-muted-foreground text-sm'>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCount)} of{' '}
                {filteredCount} entries
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  placeholder='Search variables...'
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

