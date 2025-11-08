import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type ProcessViewerBuilding, type ProcessStatus } from '../data/schema'

const getStatusBadgeVariant = (status?: ProcessStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'error':
      return 'destructive'
    case 'pending':
      return 'outline'
    default:
      return 'outline'
  }
}

const getStatusColor = (status?: ProcessStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-500 border-green-500/50'
    case 'inactive':
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
    case 'error':
      return 'bg-red-500/20 text-red-500 border-red-500/50'
    case 'pending':
      return 'bg-gray-500/20 text-gray-500 border-gray-500/50'
    default:
      return ''
  }
}

const ProcessStatusCell = ({ status }: { status?: ProcessStatus }) => {
  if (!status) return <span className="text-muted-foreground">-</span>
  const label = status === 'active' ? '✓' : status === 'error' ? '✗' : status === 'pending' ? '○' : 'X'
  return (
    <Badge variant={getStatusBadgeVariant(status)} className={cn('text-xs', getStatusColor(status))}>
      {label}
    </Badge>
  )
}

export const processViewerColumns: ColumnDef<ProcessViewerBuilding>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'building',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Building" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue('building')}</div>,
  },
  {
    accessorKey: 'buildingId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Id" />,
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue('buildingId')}</div>,
  },
  {
    accessorKey: 'client',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    cell: ({ row }) => <div>{row.getValue('client')}</div>,
  },
  {
    accessorKey: 'country',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    cell: ({ row }) => <div>{row.getValue('country')}</div>,
  },
  {
    accessorKey: 'area',
    id: 'squareMeters',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Area (m²)" />,
    cell: ({ row }) => {
      const area = row.original.area
      return area ? <div>{area.toLocaleString()}</div> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'temperature',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Temperature" />,
    cell: ({ row }) => {
      const temp = row.original.temperature
      return temp ? <div>{temp}°</div> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'isOnline',
    id: 'isOnline',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Online Status" />,
    cell: ({ row }) => {
      const isOnline = row.getValue('isOnline') as boolean
      return (
        <Badge variant={isOnline ? 'default' : 'destructive'} className={cn(isOnline ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500')}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as boolean
      return value.some((val: string) => {
        const boolVal = val === 'true'
        return rowValue === boolVal
      })
    },
  },
  {
    accessorKey: 'myrDs',
    id: 'myrDs',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Myr_Ds" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.myrDs} />,
  },
  {
    accessorKey: 'myrD',
    id: 'myrD',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Myr_D" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.myrD} />,
  },
  {
    accessorKey: 'spov',
    id: 'spov',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Spov" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.spov} />,
  },
  {
    accessorKey: 'write',
    id: 'write',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Write" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.write} />,
  },
  {
    id: 'readProMesOpe',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Read: Pro Mes Ope" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.read?.proMesOpe} />,
  },
  {
    id: 'readSmhWebProOpeMet',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Read: SMH Web Pro Ope Met" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.read?.smhWebProOpeMet} />,
  },
  {
    id: 'readSmhWebAirOpe',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Read: SMH Web Air Ope" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.read?.smhWebAirOpe} />,
  },
  {
    id: 'readAugOpe',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Read: Aug Ope" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.read?.augOpe} />,
  },
  {
    accessorKey: 'train',
    id: 'train',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Train" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.train} />,
  },
  {
    accessorKey: 'hypOpt',
    id: 'hypOpt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="HypOpt" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.hypOpt} />,
  },
  {
    accessorKey: 'discovery',
    id: 'discovery',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Discovery" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.discovery} />,
  },
  {
    accessorKey: 'maintenance',
    id: 'maintenance',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Maintenance" />,
    cell: ({ row }) => <ProcessStatusCell status={row.original.maintenance} />,
  },
  {
    accessorKey: 'uptime24H',
    id: 'uptime24H',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Uptime 24H" />,
    cell: ({ row }) => {
      const uptime = row.original.uptime24H
      return uptime !== undefined ? <div>{uptime}%</div> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    id: 'rmse',
    accessorFn: (row) => row.rmse ? `${row.rmse.value}/${row.rmse.target}` : null,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rmse" />,
    cell: ({ row }) => {
      const rmse = row.original.rmse
      return rmse ? (
        <div className="text-sm">{rmse.value.toFixed(2)} / {rmse.target.toFixed(2)}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'since',
    id: 'since',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Since" />,
    cell: ({ row }) => {
      const since = row.original.since
      return since ? <div className="text-sm">{since}</div> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'message',
    id: 'message',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Message" />,
    cell: ({ row }) => {
      const message = row.original.message
      return message ? <div className="max-w-xs truncate text-sm">{message}</div> : <span className="text-muted-foreground">-</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'adaptiveMin',
    id: 'adaptiveMin',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Adaptive Min" />,
    cell: ({ row }) => {
      const value = row.original.adaptiveMin
      return value !== undefined ? <div>{value}°</div> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'adaptiveMax',
    id: 'adaptiveMax',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Adaptive Max" />,
    cell: ({ row }) => {
      const value = row.original.adaptiveMax
      return value !== undefined ? <div>{value}°</div> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'hasClimateBaseline',
    id: 'hasClimateBaseline',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Climate Baseline" />,
    cell: ({ row }) => {
      const value = row.original.hasClimateBaseline
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'hasReadWriteDiscrepancies',
    id: 'hasReadWriteDiscrepancies',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Read/Write Issues" />,
    cell: ({ row }) => {
      const value = row.original.hasReadWriteDiscrepancies
      return (
        <Badge variant={value ? 'destructive' : 'default'} className={cn(value ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'hasZoneAssets',
    id: 'hasZoneAssets',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Zone Assets" />,
    cell: ({ row }) => {
      const value = row.original.hasZoneAssets
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'hasHeatingCircuit',
    id: 'hasHeatingCircuit',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Heating Circuit" />,
    cell: ({ row }) => {
      const value = row.original.hasHeatingCircuit
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'hasVentilation',
    id: 'hasVentilation',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ventilation" />,
    cell: ({ row }) => {
      const value = row.original.hasVentilation
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'missingVSGTOVConnections',
    id: 'missingVSGTOVConnections',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Missing VSGT OV" />,
    cell: ({ row }) => {
      const value = row.original.missingVSGTOVConnections
      return (
        <Badge variant={value ? 'destructive' : 'default'} className={cn(value ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'missingLBGPOVConnections',
    id: 'missingLBGPOVConnections',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Missing LBGP OV" />,
    cell: ({ row }) => {
      const value = row.original.missingLBGPOVConnections
      return (
        <Badge variant={value ? 'destructive' : 'default'} className={cn(value ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'missingLBGTOVConnections',
    id: 'missingLBGTOVConnections',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Missing LBGT OV" />,
    cell: ({ row }) => {
      const value = row.original.missingLBGTOVConnections
      return (
        <Badge variant={value ? 'destructive' : 'default'} className={cn(value ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'savingEnergy',
    id: 'savingEnergy',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Energy Saving" />,
    cell: ({ row }) => {
      const value = row.original.savingEnergy
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'automaticComfortScheduleActive',
    id: 'automaticComfortScheduleActive',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Comfort Schedule" />,
    cell: ({ row }) => {
      const value = row.original.automaticComfortScheduleActive
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'manualComfortScheduleActive',
    id: 'manualComfortScheduleActive',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Manual Comfort Schedule" />,
    cell: ({ row }) => {
      const value = row.original.manualComfortScheduleActive
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'componentsErrors',
    id: 'componentsErrors',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Component Errors" />,
    cell: ({ row }) => {
      const errors = row.original.componentsErrors ?? 0
      return (
        <Badge variant={errors > 0 ? 'destructive' : 'default'} className={cn(errors > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500')}>
          {errors}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'modelTrainingTestR2Score',
    id: 'modelTrainingTestR2Score',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Model R² Score" />,
    cell: ({ row }) => {
      const score = row.original.modelTrainingTestR2Score
      return score !== undefined ? <div className="text-sm">{score.toFixed(3)}</div> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: 'hasDistrictHeatingMeter',
    id: 'hasDistrictHeatingMeter',
    header: ({ column }) => <DataTableColumnHeader column={column} title="District Heating Meter" />,
    cell: ({ row }) => {
      const value = row.original.hasDistrictHeatingMeter
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'hasDistrictCoolingMeter',
    id: 'hasDistrictCoolingMeter',
    header: ({ column }) => <DataTableColumnHeader column={column} title="District Cooling Meter" />,
    cell: ({ row }) => {
      const value = row.original.hasDistrictCoolingMeter
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'hasElectricityMeter',
    id: 'hasElectricityMeter',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Electricity Meter" />,
    cell: ({ row }) => {
      const value = row.original.hasElectricityMeter
      return (
        <Badge variant={value ? 'default' : 'secondary'} className={cn(value ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'lastWeekUptime',
    id: 'lastWeekUptime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Week Uptime" />,
    cell: ({ row }) => {
      const uptime = row.original.lastWeekUptime
      return uptime !== undefined ? <div>{uptime}%</div> : <span className="text-muted-foreground">-</span>
    },
  },
]

