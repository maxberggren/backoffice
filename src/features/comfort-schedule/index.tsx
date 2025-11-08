import { useState, useCallback } from 'react'
import * as React from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Plus, Trash2, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ComfortSchedule,
  ScheduleInterval,
  OperatingMode,
  DayOfWeek,
} from './data/schema'
import { scheduleIntervalSchema } from './data/schema'
import { defaultSchedule, getCO2Level } from './data/schedule'

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Convert time string (HH:MM) to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Convert minutes since midnight to time string (HH:MM)
function minutesToTime(minutes: number): string {
  const roundedMinutes = Math.round(minutes)
  const hours = Math.floor(roundedMinutes / 60)
  const mins = roundedMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

// Get intervals for a specific day
function getIntervalsForDay(
  intervals: ScheduleInterval[],
  day: DayOfWeek
): ScheduleInterval[] {
  return intervals
    .filter((interval) => interval.day === day)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

// Generate automatic schedule intervals (8:00-17:00 weekdays)
function generateAutomaticIntervals(): ScheduleInterval[] {
  const intervals: ScheduleInterval[] = []
  
  // Weekdays: 8:00-17:00 occupied, rest reduced
  for (const day of DAYS_OF_WEEK.slice(0, 5)) {
    // Night: 00:00-08:00
    intervals.push({
      id: `auto-night-${day}`,
      day,
      startTime: '00:00',
      durationHours: 8,
      durationMinutes: 0,
      temperatureLowering: 5,
      ahuPressure: 30,
      ahuTemperature: 18,
    })
    
    // Occupied: 08:00-17:00
    intervals.push({
      id: `auto-occupied-${day}`,
      day,
      startTime: '08:00',
      durationHours: 9,
      durationMinutes: 0,
      temperatureLowering: 0,
      ahuPressure: 80,
      ahuTemperature: 22,
    })
    
    // Evening: 17:00-00:00
    intervals.push({
      id: `auto-evening-${day}`,
      day,
      startTime: '17:00',
      durationHours: 7,
      durationMinutes: 0,
      temperatureLowering: 4,
      ahuPressure: 40,
      ahuTemperature: 20,
    })
  }
  
  // Weekends: all reduced
  for (const day of DAYS_OF_WEEK.slice(5)) {
    intervals.push({
      id: `auto-weekend-${day}`,
      day,
      startTime: '00:00',
      durationHours: 24,
      durationMinutes: 0,
      temperatureLowering: 6,
      ahuPressure: 30,
      ahuTemperature: 18,
    })
  }
  
  return intervals
}

export function ComfortSchedule() {
  const [schedule, setSchedule] = useState<ComfortSchedule>(defaultSchedule)
  const [selectedInterval, setSelectedInterval] = useState<ScheduleInterval | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draggedInterval, setDraggedInterval] = useState<ScheduleInterval | null>(null)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [resizeHandle, setResizeHandle] = useState<'left' | 'right' | null>(null)
  const [resizeStartX, setResizeStartX] = useState<number>(0)
  const [resizeStartMinutes, setResizeStartMinutes] = useState<number>(0)
  const [dragStartX, setDragStartX] = useState<number>(0)
  const [dragStartMinutes, setDragStartMinutes] = useState<number>(0)
  const [hasDragged, setHasDragged] = useState<boolean>(false)

  const form = useForm<ScheduleInterval>({
    resolver: zodResolver(scheduleIntervalSchema),
    defaultValues: {
      id: '',
      day: 'monday',
      startTime: '09:00',
      durationHours: 2,
      durationMinutes: 0,
      temperatureLowering: 3,
      ahuPressure: 50,
      ahuTemperature: 22,
    },
  })

  const scheduleForm = useForm<{
    name: string
    fromDate: Date
    toDate: Date
    isActive: boolean
  }>({
    defaultValues: {
      name: schedule.name,
      fromDate: schedule.fromDate,
      toDate: schedule.toDate,
      isActive: schedule.isActive,
    },
  })

  // Update intervals when mode changes
  const handleModeChange = (mode: OperatingMode) => {
    if (mode === 'automatic') {
      setSchedule({
        ...schedule,
        mode,
        intervals: generateAutomaticIntervals(),
      })
      toast.success('Switched to Automatic mode')
    } else if (mode === 'off') {
      setSchedule({
        ...schedule,
        mode,
        intervals: [],
      })
      toast.success('Comfort schedule disabled')
    } else {
      setSchedule({
        ...schedule,
        mode,
      })
      toast.success('Switched to Manual mode')
    }
  }

  const handleAddInterval = () => {
    form.reset({
      id: `interval-${Date.now()}`,
      day: 'monday',
      startTime: '09:00',
      durationHours: 2,
      durationMinutes: 0,
      temperatureLowering: 3,
      ahuPressure: 50,
      ahuTemperature: 22,
    })
    setSelectedInterval(null)
    setIsFormOpen(true)
  }

  const handleEditInterval = (interval: ScheduleInterval) => {
    form.reset(interval)
    setSelectedInterval(interval)
    setIsFormOpen(true)
  }

  const handleDeleteInterval = () => {
    if (selectedInterval) {
      setSchedule({
        ...schedule,
        intervals: schedule.intervals.filter((i) => i.id !== selectedInterval.id),
      })
      toast.success('Interval deleted')
      setIsFormOpen(false)
      setSelectedInterval(null)
    }
  }

  const handleSubmitInterval = (data: ScheduleInterval) => {
    if (selectedInterval) {
      // Update existing
      setSchedule({
        ...schedule,
        intervals: schedule.intervals.map((i) =>
          i.id === selectedInterval.id ? data : i
        ),
      })
      toast.success('Interval updated')
    } else {
      // Add new
      setSchedule({
        ...schedule,
        intervals: [...schedule.intervals, data],
      })
      toast.success('Interval added')
    }
    setIsFormOpen(false)
    setSelectedInterval(null)
  }

  const handleScheduleSubmit = (data: {
    name: string
    fromDate: Date
    toDate: Date
    isActive: boolean
  }) => {
    setSchedule({
      ...schedule,
      ...data,
    })
    toast.success('Schedule updated')
  }

  // Get displayed time for an interval (accounts for drag/resize)
  const getDisplayedTime = (interval: ScheduleInterval) => {
    let startMinutes = timeToMinutes(interval.startTime)
    let durationMinutes = interval.durationHours * 60 + interval.durationMinutes
    
    // Apply drag offset if this is the dragged interval
    if (draggedInterval?.id === interval.id && !resizeHandle) {
      const newStartMinutes = dragStartMinutes + dragOffset
      startMinutes = Math.max(0, Math.min(newStartMinutes, 24 * 60 - durationMinutes))
    }
    
    // Apply resize if this is the resized interval
    if (resizeHandle && draggedInterval?.id === interval.id) {
      if (resizeHandle === 'left') {
        const newStart = resizeStartMinutes + dragOffset
        const newDuration = durationMinutes - dragOffset
        if (newStart >= 0 && newDuration > 15) {
          startMinutes = newStart
          durationMinutes = newDuration
        }
      } else if (resizeHandle === 'right') {
        const newDuration = resizeStartMinutes + dragOffset
        if (newDuration > 15 && startMinutes + newDuration <= 24 * 60) {
          durationMinutes = newDuration
        }
      }
    }
    
    // Round to whole minutes for display
    const roundedStartMinutes = Math.round(startMinutes)
    const roundedEndMinutes = Math.round(startMinutes + durationMinutes)
    
    return {
      startTime: minutesToTime(roundedStartMinutes),
      endTime: minutesToTime(roundedEndMinutes),
    }
  }

  // Calculate block position and width
  const getBlockStyle = (interval: ScheduleInterval) => {
    let startMinutes = timeToMinutes(interval.startTime)
    let durationMinutes = interval.durationHours * 60 + interval.durationMinutes
    
    // Apply drag offset if this is the dragged interval
    if (draggedInterval?.id === interval.id && !resizeHandle) {
      // dragOffset is the offset from click position to block start
      // During drag, we calculate: newStart = currentMouse - dragOffset
      // But we need to show: startMinutes = originalStart + delta
      // So we calculate delta from the original position
      const newStartMinutes = dragStartMinutes + dragOffset
      startMinutes = Math.max(0, Math.min(newStartMinutes, 24 * 60 - durationMinutes))
    }
    
    // Apply resize if this is the resized interval
    if (resizeHandle && draggedInterval?.id === interval.id) {
      if (resizeHandle === 'left') {
        const newStart = resizeStartMinutes + dragOffset
        const newDuration = durationMinutes - dragOffset
        if (newStart >= 0 && newDuration > 15) {
          startMinutes = newStart
          durationMinutes = newDuration
        }
      } else if (resizeHandle === 'right') {
        const newDuration = resizeStartMinutes + dragOffset
        if (newDuration > 15 && startMinutes + newDuration <= 24 * 60) {
          durationMinutes = newDuration
        }
      }
    }
    
    const leftPercent = (startMinutes / (24 * 60)) * 100
    const widthPercent = (durationMinutes / (24 * 60)) * 100
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    }
  }

  // Handle mouse down on block (start drag)
  const handleBlockMouseDown = (
    e: React.MouseEvent,
    interval: ScheduleInterval
  ) => {
    if (isDisabled) return
    e.preventDefault()
    e.stopPropagation()
    setDraggedInterval(interval)
    setSelectedInterval(interval)
    setHasDragged(false) // Reset drag flag
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const startMinutes = timeToMinutes(interval.startTime)
      setDragStartX(x)
      setDragStartMinutes(startMinutes)
      setDragOffset(0) // Start with no offset, will be calculated during drag
    }
  }

  // Handle mouse down on resize handle
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    interval: ScheduleInterval,
    handle: 'left' | 'right'
  ) => {
    if (isDisabled) return
    e.preventDefault()
    e.stopPropagation()
    setResizeHandle(handle)
    setDraggedInterval(interval)
    setSelectedInterval(interval)
    const rect = (e.currentTarget as HTMLElement).parentElement?.parentElement?.getBoundingClientRect()
    if (rect) {
      setResizeStartX(e.clientX - rect.left)
      if (handle === 'left') {
        setResizeStartMinutes(timeToMinutes(interval.startTime))
      } else {
        setResizeStartMinutes(interval.durationHours * 60 + interval.durationMinutes)
      }
    }
  }

  // Handle mouse move (drag/resize)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedInterval) return
    
    const timelineElement = document.querySelector('[data-timeline]') as HTMLElement
    if (!timelineElement) return
    
    const rect = timelineElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    const timelineWidth = rect.width
    
    if (resizeHandle) {
      // Resizing - calculate delta from start position
      const deltaX = x - resizeStartX
      const deltaMinutes = (deltaX / timelineWidth) * (24 * 60)
      setDragOffset(deltaMinutes)
      // Mark as dragged if moved more than a few pixels
      if (Math.abs(deltaX) > 3) {
        setHasDragged(true)
      }
    } else {
      // Dragging - calculate delta from click position
      const deltaX = x - dragStartX
      const timelineWidth = rect.width
      const deltaMinutes = (deltaX / timelineWidth) * (24 * 60)
      const durationMinutes = draggedInterval.durationHours * 60 + draggedInterval.durationMinutes
      const newStartMinutes = dragStartMinutes + deltaMinutes
      const clampedMinutes = Math.max(0, Math.min(newStartMinutes, 24 * 60 - durationMinutes))
      setDragOffset(clampedMinutes - dragStartMinutes)
      // Mark as dragged if moved more than a few pixels
      if (Math.abs(deltaX) > 3) {
        setHasDragged(true)
      }
    }
  }, [draggedInterval, resizeHandle, resizeStartX, dragStartX, dragStartMinutes])

  // Handle mouse up (end drag/resize)
  const handleMouseUp = useCallback(() => {
    if (!draggedInterval) return
    
    if (resizeHandle) {
      // Apply resize
      const interval = draggedInterval
      const deltaMinutes = Math.round(dragOffset / 15) * 15
      
      if (resizeHandle === 'left') {
        const newStartMinutes = Math.max(0, resizeStartMinutes + deltaMinutes)
        const newDurationMinutes = Math.max(15, interval.durationHours * 60 + interval.durationMinutes - deltaMinutes)
        const newStartTime = minutesToTime(newStartMinutes)
        const newDurationHours = Math.floor(newDurationMinutes / 60)
        const newDurationMins = newDurationMinutes % 60
        
        setSchedule((prevSchedule) => ({
          ...prevSchedule,
          intervals: prevSchedule.intervals.map((i) =>
            i.id === interval.id
              ? {
                  ...i,
                  startTime: newStartTime,
                  durationHours: newDurationHours,
                  durationMinutes: newDurationMins,
                }
              : i
          ),
        }))
        toast.success('Interval resized')
      } else {
        const newDurationMinutes = Math.max(15, Math.min(24 * 60 - timeToMinutes(interval.startTime), resizeStartMinutes + deltaMinutes))
        const newDurationHours = Math.floor(newDurationMinutes / 60)
        const newDurationMins = newDurationMinutes % 60
        
        setSchedule((prevSchedule) => ({
          ...prevSchedule,
          intervals: prevSchedule.intervals.map((i) =>
            i.id === interval.id
              ? {
                  ...i,
                  durationHours: newDurationHours,
                  durationMinutes: newDurationMins,
                }
              : i
          ),
        }))
        toast.success('Interval resized')
      }
    } else {
      // Apply drag - snap to 15-minute intervals on release
      const interval = draggedInterval
      const newStartMinutes = dragStartMinutes + dragOffset
      const snappedMinutes = Math.round(newStartMinutes / 15) * 15
      const durationMinutes = interval.durationHours * 60 + interval.durationMinutes
      const clampedMinutes = Math.max(0, Math.min(snappedMinutes, 24 * 60 - durationMinutes))
      const newStartTime = minutesToTime(clampedMinutes)
      
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        intervals: prevSchedule.intervals.map((i) =>
          i.id === interval.id
            ? {
                ...i,
                startTime: newStartTime,
              }
            : i
        ),
      }))
      toast.success('Interval moved')
    }
    
    setDraggedInterval(null)
    setResizeHandle(null)
    setDragOffset(0)
    setDragStartX(0)
    setDragStartMinutes(0)
    // Small delay to prevent onClick from firing after drag
    setTimeout(() => {
      setHasDragged(false)
    }, 0)
  }, [draggedInterval, dragOffset, resizeHandle, resizeStartMinutes, dragStartMinutes])

  // Set up global mouse event listeners
  React.useEffect(() => {
    if (draggedInterval) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedInterval, handleMouseMove, handleMouseUp])

  const isDisabled = schedule.mode !== 'manual'

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
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Thermometer className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Comfort Schedule</h2>
              <p className='text-muted-foreground text-sm'>
                Manage HVAC comfort settings for non-occupied hours
              </p>
            </div>
          </div>

          {/* Schedule Info Form */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
              <CardDescription>
                Configure schedule name, date range, and operating mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...scheduleForm}>
                <form
                  onSubmit={scheduleForm.handleSubmit(handleScheduleSubmit)}
                  className='space-y-4'
                >
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <FormField
                      control={scheduleForm.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule Name</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g., Emporio opening hours' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={scheduleForm.control}
                      name='isActive'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Active Status</FormLabel>
                            <div className='text-muted-foreground text-sm'>
                              Enable or disable this schedule
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='grid gap-4 sm:grid-cols-3'>
                    <FormField
                      control={scheduleForm.control}
                      name='fromDate'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>From Date</FormLabel>
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
                                    <span>Pick a date</span>
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
                      control={scheduleForm.control}
                      name='toDate'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>To Date</FormLabel>
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
                                    <span>Pick a date</span>
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
                      control={scheduleForm.control}
                      name='isActive'
                      render={() => (
                        <FormItem>
                          <FormLabel>Operating Mode</FormLabel>
                          <Select
                            value={schedule.mode}
                            onValueChange={(value) =>
                              handleModeChange(value as OperatingMode)
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='manual'>Manual</SelectItem>
                              <SelectItem value='automatic'>Automatic</SelectItem>
                              <SelectItem value='off'>Off</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='flex justify-end'>
                    <Button type='submit'>Update Schedule</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Mode Info */}
          <Card>
            <CardContent className='pt-6'>
              <div className='text-muted-foreground text-sm'>
                {schedule.mode === 'manual' && (
                  <p>
                    Manual Mode: Full control to create and customize schedule intervals.
                    Use the timeline below to add, edit, and manage intervals.
                  </p>
                )}
                {schedule.mode === 'automatic' && (
                  <p>
                    Automatic Mode: Using predefined 8:00-17:00 weekday schedule with
                    reduced settings for nights/weekends. Timeline is read-only.
                  </p>
                )}
                {schedule.mode === 'off' && (
                  <p>
                    Off Mode: Comfort schedule is completely disabled. No intervals are active.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Weekly Schedule Timeline</CardTitle>
                  <CardDescription>
                    24-hour grid showing schedule intervals for each day of the week
                  </CardDescription>
                </div>
                {schedule.mode === 'manual' && (
                  <Button onClick={handleAddInterval} disabled={isDisabled}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Interval
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <div className='min-w-[800px]'>
                  {/* Hour Header */}
                  <div className='mb-2 flex border-b pb-2'>
                    <div className='w-32 flex-shrink-0 font-medium'>Day</div>
                    <div className='relative flex-1'>
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className='absolute border-l text-muted-foreground text-xs'
                          style={{ left: `${(hour / 24) * 100}%` }}
                        >
                          <div className='-translate-x-1/2 px-1'>{hour}:00</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Days and Timeline */}
                  {DAYS_OF_WEEK.map((day) => {
                    const dayIntervals = getIntervalsForDay(schedule.intervals, day)
                    return (
                      <div
                        key={day}
                        className='relative mb-2 flex min-h-[80px] border-b last:border-b-0'
                      >
                        {/* Day Label */}
                        <div className='w-32 flex-shrink-0 py-2 font-medium'>
                          {DAY_LABELS[day]}
                        </div>

                        {/* Timeline Area */}
                        <div className='relative flex-1 py-2' data-timeline>
                          {/* CO2 Background Visualization */}
                          <div className='absolute inset-0 flex gap-0.5 px-0.5'>
                            {HOURS.map((hour) => {
                              const co2Level = getCO2Level(day, hour)
                              const height = Math.min((co2Level / 1200) * 100, 100)
                              return (
                                <div
                                  key={hour}
                                  className='flex-1 rounded-sm'
                                  style={{
                                    background: `linear-gradient(to top, rgba(128, 128, 128, 0.25) ${height}%, transparent ${height}%)`,
                                  }}
                                />
                              )
                            })}
                          </div>

                          {/* Hour Grid Lines */}
                          <div className='absolute inset-0 flex'>
                            {HOURS.map((hour) => (
                              <div
                                key={hour}
                                className='flex-1 border-r border-dashed border-muted last:border-r-0'
                              />
                            ))}
                          </div>

                          {/* Schedule Blocks */}
                          {dayIntervals.map((interval) => {
                            const style = getBlockStyle(interval)
                            const isSelected = selectedInterval?.id === interval.id
                            const isDragging = draggedInterval?.id === interval.id
                            return (
                              <div
                                key={interval.id}
                                className={cn(
                                  'group absolute top-1 bottom-1 rounded border-2 transition-all',
                                  isSelected || isDragging
                                    ? 'border-primary bg-primary/20 z-10'
                                    : 'border-primary/50 bg-primary/10 hover:bg-primary/15',
                                  isDisabled && 'cursor-not-allowed opacity-50',
                                  !isDisabled && 'cursor-move'
                                )}
                                style={style}
                                onMouseDown={(e) => !isDisabled && handleBlockMouseDown(e, interval)}
                                onClick={(e) => {
                                  if (!isDisabled && !hasDragged) {
                                    e.stopPropagation()
                                    handleEditInterval(interval)
                                  }
                                }}
                              >
                                {/* Left Resize Handle */}
                                {!isDisabled && (
                                  <div
                                    className='absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-primary/30 opacity-0 transition-opacity group-hover:opacity-100'
                                    onMouseDown={(e) => handleResizeMouseDown(e, interval, 'left')}
                                  />
                                )}
                                {/* Right Resize Handle */}
                                {!isDisabled && (
                                  <div
                                    className='absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-primary/30 opacity-0 transition-opacity group-hover:opacity-100'
                                    onMouseDown={(e) => handleResizeMouseDown(e, interval, 'right')}
                                  />
                                )}
                                <div className='flex h-full flex-col justify-between gap-0.5 p-1 text-xs'>
                                  <div className='font-medium'>
                                    {(() => {
                                      const displayedTime = getDisplayedTime(interval)
                                      return `${displayedTime.startTime} - ${displayedTime.endTime}`
                                    })()}
                                  </div>
                                  <div className='flex flex-col gap-0.5 text-[10px] leading-tight'>
                                    <div className='text-muted-foreground'>
                                      Lower: {interval.temperatureLowering}°C
                                    </div>
                                    <div className='flex items-center gap-1.5 text-muted-foreground/80'>
                                      <span>AHU: {interval.ahuPressure}%</span>
                                      <span>•</span>
                                      <span>{interval.ahuTemperature}°C</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interval Detail Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {selectedInterval ? 'Edit Interval' : 'Add New Interval'}
              </DialogTitle>
              <DialogDescription>
                Configure schedule interval settings
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmitInterval)}
                className='space-y-4'
              >
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='day'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>
                                {DAY_LABELS[day]}
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
                    name='startTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type='time' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='durationHours'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Hours)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={23}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='durationMinutes'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={59}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='temperatureLowering'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature Lowering: {field.value}°C</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10}
                          step={0.5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <div className='text-muted-foreground text-xs'>
                        Maximum degrees allowed to lower temperature
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ahuPressure'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AHU Pressure Lowering: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ahuTemperature'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AHU Supply Temperature Lowering: {field.value}°C</FormLabel>
                      <FormControl>
                        <Slider
                          min={-10}
                          max={40}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex justify-between'>
                  {selectedInterval && (
                    <Button
                      type='button'
                      variant='destructive'
                      onClick={handleDeleteInterval}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete Interval
                    </Button>
                  )}
                  <div className='ml-auto flex gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setIsFormOpen(false)
                        setSelectedInterval(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type='submit'>
                      {selectedInterval ? 'Update' : 'Add'} Interval
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}

