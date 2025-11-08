import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Download } from 'lucide-react'
import { type ProcessViewerBuilding } from '../data/schema'
import { processViewerColumns as columns } from './process-viewer-columns'
import { exportTableToCSV } from '@/lib/export-table'

type ProcessViewerTableProps = {
  data: ProcessViewerBuilding[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function ProcessViewerTable({ data, search, navigate }: ProcessViewerTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide Read process columns by default
    readProMesOpe: false,
    readSmhWebProOpeMet: false,
    readSmhWebAirOpe: false,
    readAugOpe: false,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  // Synced with URL states
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 25 },
    globalFilter: { enabled: true, key: 'search' },
    columnFilters: [
      { columnId: 'isOnline', searchKey: 'isOnline', type: 'array' },
      { columnId: 'client', searchKey: 'client', type: 'array' },
      { columnId: 'country', searchKey: 'country', type: 'array' },
    ],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  // Get unique values for filters
  const uniqueClients = Array.from(new Set(data.map((b) => b.client))).map((client) => ({
    label: client,
    value: client,
  }))

  const uniqueCountries = Array.from(new Set(data.map((b) => b.country))).map((country) => ({
    label: country,
    value: country,
  }))

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `process-viewer-export-${timestamp}.csv`
    exportTableToCSV(table, filename)
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <DataTableToolbar
            table={table}
            searchPlaceholder="Search buildings..."
            filters={[
              {
                columnId: 'isOnline',
                title: 'Online Status',
                options: [
                  { label: 'Online', value: 'true' },
                  { label: 'Offline', value: 'false' },
                ],
              },
              {
                columnId: 'client',
                title: 'Client',
                options: uniqueClients,
              },
              {
                columnId: 'country',
                title: 'Country',
                options: uniqueCountries,
              },
            ]}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="h-8 gap-2 shrink-0"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
    </div>
  )
}

