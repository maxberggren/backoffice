import { useState } from 'react'
import { format } from 'date-fns'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ConfigDrawer } from '@/components/config-drawer'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Wrench, Clock, Plus, AlertTriangle, Pencil } from 'lucide-react'
import { users as buildings } from '@/features/users/data/users'
import { useBuildingStore } from '@/stores/building-store'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'

// Maintenance types
const maintenanceTypes = [
  'Scheduled Maintenance',
  'Emergency Repair',
  'System Upgrade',
  'Inspection',
  'Calibration',
  'Filter Replacement',
  'Component Replacement',
  'Other',
]

// Maintenance entry type
type MaintenanceEntry = {
  id: string
  buildingId: string
  buildingName: string
  maintenanceType: string
  comment: string
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'scheduled'
}

// Form schema
const maintenanceFormSchema = z.object({
  buildingId: z.string().min(1, 'Please select a building'),
  maintenanceType: z.string().min(1, 'Please select a maintenance type'),
  comment: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>

// Generate sample maintenance entries
const generateMaintenanceEntries = (
  timePeriod: string,
  filter: 'all' | 'maintenance' | 'faulty',
  buildingId?: string
): MaintenanceEntry[] => {
  const now = new Date()
  const entries: MaintenanceEntry[] = []
  
  let count = 0
  if (timePeriod === '1w') count = 5
  else if (timePeriod === '1m') count = 15
  else if (timePeriod === '3m') count = 30
  else count = 50
  
  // Filter buildings by selected building if provided
  const filteredBuildings = buildingId
    ? buildings.filter(b => b.id === buildingId)
    : buildings
  
  if (filteredBuildings.length === 0) return []
  
  for (let i = 0; i < count; i++) {
    const building = filteredBuildings[i % filteredBuildings.length]
    const startDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    const endDate = new Date(startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    const isActive = endDate > now
    
    entries.push({
      id: `maintenance-${i}`,
      buildingId: building.id,
      buildingName: building.name,
      maintenanceType: maintenanceTypes[i % maintenanceTypes.length],
      comment: i % 3 === 0 ? `Maintenance note ${i + 1}` : '',
      startDate,
      endDate,
      status: isActive ? 'active' : endDate < now ? 'completed' : 'scheduled',
    })
  }
  
  // Filter based on type
  if (filter === 'maintenance') {
    return entries.filter(e => e.status === 'active' || e.status === 'scheduled')
  } else if (filter === 'faulty') {
    return entries.filter(e => e.comment.includes('faulty') || e.maintenanceType === 'Emergency Repair')
  }
  
  return entries
}

export function Maintenance() {
  const { selectedBuilding } = useBuildingStore()
  const [timePeriod, setTimePeriod] = useState('1m')
  const [activeTab, setActiveTab] = useState<'all' | 'maintenance' | 'faulty'>('all')
  const [selectedEntry, setSelectedEntry] = useState<MaintenanceEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const entries = generateMaintenanceEntries(timePeriod, activeTab, selectedBuilding?.id)
  
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      buildingId: selectedBuilding?.id || '',
      maintenanceType: '',
      comment: '',
      startDate: undefined,
      endDate: undefined,
    },
  })

  const editForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      buildingId: '',
      maintenanceType: '',
      comment: '',
      startDate: undefined,
      endDate: undefined,
    },
  })

  const handleSubmit = (data: MaintenanceFormValues) => {
    showSubmittedData(data)
    form.reset({
      buildingId: selectedBuilding?.id || '',
      maintenanceType: '',
      comment: '',
      startDate: undefined,
      endDate: undefined,
    })
    setIsFormOpen(false)
  }

  const handleEditSubmit = (data: MaintenanceFormValues) => {
    showSubmittedData({ ...data, id: selectedEntry?.id })
    setIsDialogOpen(false)
    setIsEditMode(false)
    setSelectedEntry(null)
  }

  const handleRowClick = (entry: MaintenanceEntry) => {
    setSelectedEntry(entry)
    editForm.reset({
      buildingId: entry.buildingId,
      maintenanceType: entry.maintenanceType,
      comment: entry.comment,
      startDate: entry.startDate,
      endDate: entry.endDate,
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedEntry) {
      setIsEditMode(true)
    }
  }

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy')
  }

  const getStatusBadge = (status: MaintenanceEntry['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant='default'>Active</Badge>
      case 'completed':
        return <Badge variant='secondary'>Completed</Badge>
      case 'scheduled':
        return <Badge variant='outline'>Scheduled</Badge>
    }
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header Section */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Wrench className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Maintenance</h2>
              <p className='text-muted-foreground text-sm'>
                Manage maintenance periods for {selectedBuilding?.name || 'selected building'}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsFormOpen(true)} disabled={!selectedBuilding}>
            <Plus className='mr-2 h-4 w-4' />
            Add Maintenance
          </Button>
        </div>

        {!selectedBuilding && (
          <Card>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <Wrench className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No Building Selected</h3>
                <p className='text-muted-foreground text-sm'>
                  Please select a building from the top left to view and manage maintenance periods.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Maintenance Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Add New Maintenance</DialogTitle>
              <DialogDescription>
                Create a new maintenance period to inform the AI system about special states
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='buildingId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={selectedBuilding?.id || field.value}
                          disabled={!!selectedBuilding}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='---Select Building---' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buildings.map((building) => (
                              <SelectItem key={building.id} value={building.id}>
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='maintenanceType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='---Select Maintenance---' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maintenanceTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='comment'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter comment...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'yyyy-MM-dd')
                                ) : (
                                  <span>yyyy-MM-dd</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'yyyy-MM-dd')
                                ) : (
                                  <span>yyyy-MM-dd</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button type='button' variant='outline' onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type='submit'>Add Maintenance</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Tabs and Time Period Selector */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Maintenance Entries</CardTitle>
                <CardDescription>
                  View and manage maintenance periods for AI system states
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select time period' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1w'>Last Week</SelectItem>
                    <SelectItem value='1m'>Last Month</SelectItem>
                    <SelectItem value='3m'>Last 3 Months</SelectItem>
                    <SelectItem value='1y'>Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value='all'>All</TabsTrigger>
                <TabsTrigger value='maintenance'>Maintenance</TabsTrigger>
                <TabsTrigger value='faulty'>
                  <AlertTriangle className='mr-2 h-4 w-4' />
                  Faulty Data
                </TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className='mt-4'>
                {entries.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <Wrench className='h-12 w-12 text-muted-foreground mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No Maintenance Entries</h3>
                    <p className='text-muted-foreground text-sm mb-4'>
                      No maintenance entries found for the selected time period and filter.
                    </p>
                    <Button onClick={() => setIsFormOpen(true)}>
                      <Plus className='mr-2 h-4 w-4' />
                      Add Maintenance
                    </Button>
                  </div>
                ) : (
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='font-semibold'>Building</TableHead>
                          <TableHead className='font-semibold'>Maintenance Type</TableHead>
                          <TableHead className='font-semibold'>Start Date</TableHead>
                          <TableHead className='font-semibold'>End Date</TableHead>
                          <TableHead className='font-semibold'>Status</TableHead>
                          <TableHead className='font-semibold'>Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow
                            key={entry.id}
                            className='cursor-pointer hover:bg-muted/50 transition-colors'
                            onClick={() => handleRowClick(entry)}
                          >
                            <TableCell className='font-medium'>
                              {entry.buildingName}
                            </TableCell>
                            <TableCell>{entry.maintenanceType}</TableCell>
                            <TableCell className='font-mono text-sm'>
                              {formatDate(entry.startDate)}
                            </TableCell>
                            <TableCell className='font-mono text-sm'>
                              {formatDate(entry.endDate)}
                            </TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell className='text-muted-foreground max-w-xs truncate'>
                              {entry.comment || '--'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detail/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setIsEditMode(false)
            setSelectedEntry(null)
          }
        }}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Edit Maintenance' : 'Maintenance Details'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Update maintenance type and period dates'
                  : 'Detailed information about this maintenance period'}
              </DialogDescription>
            </DialogHeader>
            {selectedEntry && (
              <>
                {isEditMode ? (
                  <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className='space-y-4'>
                      <FormField
                        control={editForm.control}
                        name='maintenanceType'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maintenance Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='---Select Maintenance---' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {maintenanceTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <FormField
                          control={editForm.control}
                          name='startDate'
                          render={({ field }) => (
                            <FormItem className='flex flex-col'>
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant='outline'
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'yyyy-MM-dd')
                                      ) : (
                                        <span>yyyy-MM-dd</span>
                                      )}
                                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                  <Calendar
                                    mode='single'
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name='endDate'
                          render={({ field }) => (
                            <FormItem className='flex flex-col'>
                              <FormLabel>End Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant='outline'
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'yyyy-MM-dd')
                                      ) : (
                                        <span>yyyy-MM-dd</span>
                                      )}
                                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                  <Calendar
                                    mode='single'
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={editForm.control}
                        name='comment'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comment</FormLabel>
                            <FormControl>
                              <Input placeholder='Enter comment...' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='flex justify-end gap-2'>
                        <Button 
                          type='button' 
                          variant='outline' 
                          onClick={() => {
                            setIsEditMode(false)
                            editForm.reset({
                              buildingId: selectedEntry.buildingId,
                              maintenanceType: selectedEntry.maintenanceType,
                              comment: selectedEntry.comment,
                              startDate: selectedEntry.startDate,
                              endDate: selectedEntry.endDate,
                            })
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type='submit'>Save Changes</Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className='mt-4 space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='grid gap-4 sm:grid-cols-2 flex-1'>
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>Building</p>
                          <p className='mt-1 font-medium'>{selectedEntry.buildingName}</p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>Status</p>
                          <div className='mt-1'>{getStatusBadge(selectedEntry.status)}</div>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>Maintenance Type</p>
                          <p className='mt-1'>{selectedEntry.maintenanceType}</p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-muted-foreground'>Duration</p>
                          <p className='mt-1 font-mono text-sm'>
                            {formatDate(selectedEntry.startDate)} - {formatDate(selectedEntry.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {selectedEntry.comment && (
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Comment</p>
                        <p className='mt-1'>{selectedEntry.comment}</p>
                      </div>
                    )}
                    <div className='flex justify-end pt-4'>
                      <Button onClick={handleEditClick}>
                        <Pencil className='mr-2 h-4 w-4' />
                        Edit Maintenance
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}

