import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Signal } from './signal-viewer'

type SignalColumnsProps = {
  nameEditing: boolean
  updateSignal: (signalId: number, field: keyof Signal, value: string | number | boolean) => void
}

export const createSignalColumns = ({
  nameEditing,
  updateSignal,
}: SignalColumnsProps): ColumnDef<Signal>[] => [
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const signal = row.original
      return (
        <div className="font-mono text-xs">
          {nameEditing ? (
            <Input
              value={signal.name}
              onChange={(e) => updateSignal(signal.id, 'name', e.target.value)}
              className="h-8 text-xs"
            />
          ) : (
            signal.name
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'rw',
    id: 'R/W',
    header: ({ column }) => <DataTableColumnHeader column={column} title="R/W" />,
    cell: ({ row }) => {
      const signal = row.original
      return (
        <Select
          value={signal.rw}
          onValueChange={(value) => updateSignal(signal.id, 'rw', value)}
        >
          <SelectTrigger className="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="R">R</SelectItem>
            <SelectItem value="W">W</SelectItem>
            <SelectItem value="RW">RW</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const signal = row.original
      return (
        <Select
          value={signal.type}
          onValueChange={(value) => updateSignal(signal.id, 'type', value)}
        >
          <SelectTrigger className="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="O">O</SelectItem>
            <SelectItem value="I">I</SelectItem>
            <SelectItem value="V">V</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    accessorKey: 'classification',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Classification" />,
    cell: ({ row }) => {
      const signal = row.original
      return (
        <Select
          value={signal.classification}
          onValueChange={(value) => updateSignal(signal.id, 'classification', value)}
        >
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GT">GT</SelectItem>
            <SelectItem value="CO2">CO2</SelectItem>
            <SelectItem value="RH">RH</SelectItem>
            <SelectItem value="P">P</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const signal = row.original
      return (
        <Input
          value={signal.description}
          onChange={(e) => updateSignal(signal.id, 'description', e.target.value)}
          className="h-8 text-sm"
        />
      )
    },
  },
  {
    accessorKey: 'min',
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Min" />
      </div>
    ),
    cell: ({ row }) => {
      const signal = row.original
      return (
        <div className="text-right">
          <Input
            type="number"
            value={signal.min}
            onChange={(e) => updateSignal(signal.id, 'min', parseFloat(e.target.value) || 0)}
            className="h-8 w-20 text-right"
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'max',
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Max" />
      </div>
    ),
    cell: ({ row }) => {
      const signal = row.original
      return (
        <div className="text-right">
          <Input
            type="number"
            value={signal.max}
            onChange={(e) => updateSignal(signal.id, 'max', parseFloat(e.target.value) || 0)}
            className="h-8 w-20 text-right"
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Enabled" />,
    cell: ({ row }) => {
      const signal = row.original
      return (
        <Checkbox
          checked={signal.enabled}
          onCheckedChange={(checked) => updateSignal(signal.id, 'enabled', checked as boolean)}
        />
      )
    },
  },
]

