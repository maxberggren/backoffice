import { useState, useCallback } from 'react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
import { Plus, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type ComfortSchedule,
  type ScheduleInterval,
  type OperatingMode,
  type DayOfWeek,
  scheduleIntervalSchema,
} from './data/schema'
import { defaultSchedule, getCO2Level, mockAHUs, mockAHUOperatingHours, getAHUColor } from './data/schedule'

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
// 15-minute intervals: 96 intervals per day (24 hours * 4)
const QUARTER_HOURS = Array.from({ length: 96 }, (_, i) => i * 15) // minutes since midnight

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

// Get color for CO2 level: green < 450, yellow at 470, red at 800
// Linear transitions between thresholds
function getCO2Color(co2Level: number): string {
  // Green: RGB(34, 197, 94) - below 450
  // Yellow: RGB(234, 179, 8) - at 470
  // Red: RGB(239, 68, 68) - at 800
  
  if (co2Level < 450) {
    // Pure green
    return 'rgba(34, 197, 94, 0.3)'
  } else if (co2Level < 470) {
    // Transition from green to yellow (450-470)
    const t = (co2Level - 450) / 20 // 0 to 1
    const r = Math.round(34 + (234 - 34) * t)
    const g = Math.round(197 + (179 - 197) * t)
    const b = Math.round(94 + (8 - 94) * t)
    return `rgba(${r}, ${g}, ${b}, 0.3)`
  } else {
    // Transition from yellow to red (470-800)
    const t = Math.min((co2Level - 470) / 330, 1) // 0 to 1, capped at 1
    const r = Math.round(234 + (239 - 234) * t)
    const g = Math.round(179 + (68 - 179) * t)
    const b = Math.round(8 + (68 - 8) * t)
    return `rgba(${r}, ${g}, ${b}, 0.3)`
  }
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
      ahuTemperature: 3,
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
      ahuTemperature: 3,
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
      ahuTemperature: 3,
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
      ahuTemperature: 3,
    })
  }
  
  return intervals
}

export function ComfortSchedule() {
  // Manage schedules: one for "all AHUs" and one per individual AHU
  const [schedules, setSchedules] = useState<Map<string | 'all', ComfortSchedule>>(
    new Map([['all', defaultSchedule]])
  )
  const [isAllAHUsMode, setIsAllAHUsMode] = useState<boolean>(true)
  const [selectedIndividualAHU, setSelectedIndividualAHU] = useState<string | null>(null)
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

  // Determine current selected AHU based on mode
  // When not in "All AHUs" mode, ensure we have a selected AHU (default to first)
  const effectiveSelectedAHU = isAllAHUsMode 
    ? 'all' 
    : (selectedIndividualAHU || mockAHUs[0]?.id || 'none')

  // Get current schedule based on selected AHU
  const schedule = schedules.get(effectiveSelectedAHU) || (effectiveSelectedAHU === 'none' ? null : defaultSchedule)
  const hasSchedule = schedule !== null

  // Update current schedule
  const updateSchedule = useCallback((updates: Partial<ComfortSchedule>) => {
    setSchedules((prev) => {
      const newMap = new Map(prev)
      const currentAHU = isAllAHUsMode ? 'all' : (selectedIndividualAHU || mockAHUs[0]?.id || 'none')
      if (currentAHU === 'none') return newMap // Can't update if no AHU selected
      const current = newMap.get(currentAHU) || { ...defaultSchedule, ahuId: currentAHU === 'all' ? undefined : currentAHU }
      newMap.set(currentAHU, { ...current, ...updates })
      return newMap
    })
  }, [isAllAHUsMode, selectedIndividualAHU])

  // Handle mode switch change
  const handleModeSwitchChange = (checked: boolean) => {
    setIsAllAHUsMode(checked)
    // When switching to individual mode, auto-select the first AHU
    if (!checked && mockAHUs.length > 0) {
      const firstAHUId = mockAHUs[0].id
      setSelectedIndividualAHU(firstAHUId)
      // Create a schedule for the first AHU if it doesn't exist
      if (!schedules.has(firstAHUId)) {
        const newSchedule: ComfortSchedule = {
          ...defaultSchedule,
          id: `schedule-${firstAHUId}`,
          name: 'Non-office hours',
          ahuId: firstAHUId,
        }
        setSchedules((prev) => {
          const newMap = new Map(prev)
          newMap.set(firstAHUId, newSchedule)
          return newMap
        })
      }
    }
  }

  // Handle individual AHU selection change
  const handleIndividualAHUChange = (ahuId: string) => {
    setSelectedIndividualAHU(ahuId)
    // Create a new schedule for this AHU if it doesn't exist
    if (!schedules.has(ahuId)) {
      const newSchedule: ComfortSchedule = {
        ...defaultSchedule,
        id: `schedule-${ahuId}`,
        name: 'Non-office hours',
        ahuId: ahuId,
      }
      setSchedules((prev) => {
        const newMap = new Map(prev)
        newMap.set(ahuId, newSchedule)
        return newMap
      })
    }
  }

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
      ahuTemperature: 3,
    },
  })

  const scheduleForm = useForm<{
    name: string
    isActive: boolean
  }>({
    defaultValues: {
      name: schedule?.name || 'Non-office hours',
      isActive: schedule?.isActive || false,
    },
  })

  // Update form when schedule changes
  React.useEffect(() => {
    if (schedule) {
      scheduleForm.reset({
        name: schedule.name,
        isActive: schedule.isActive,
      })
    }
  }, [schedule, scheduleForm])

  // Update intervals when mode changes
  const handleModeChange = (mode: OperatingMode) => {
    if (!hasSchedule) return
    if (mode === 'automatic') {
      updateSchedule({
        mode,
        intervals: generateAutomaticIntervals(),
      })
      toast.success('Switched to Automatic mode')
    } else if (mode === 'off') {
      updateSchedule({
        mode,
        intervals: [],
      })
      toast.success('AHU schedule disabled')
    } else {
      updateSchedule({
        mode,
      })
      toast.success('Switched to Manual mode')
    }
  }

  const handleAddInterval = () => {
    if (!hasSchedule) return
    form.reset({
      id: `interval-${Date.now()}`,
      day: 'monday',
      startTime: '09:00',
      durationHours: 2,
      durationMinutes: 0,
      temperatureLowering: 3,
      ahuPressure: 50,
      ahuTemperature: 3,
    })
    setSelectedInterval(null)
    setIsFormOpen(true)
  }

  const handleEditInterval = (interval: ScheduleInterval) => {
    if (!hasSchedule) return
    form.reset(interval)
    setSelectedInterval(interval)
    setIsFormOpen(true)
  }

  const handleDeleteInterval = () => {
    if (!hasSchedule || !selectedInterval) return
    updateSchedule({
      intervals: schedule!.intervals.filter((i) => i.id !== selectedInterval.id),
    })
    toast.success('Interval deleted')
    setIsFormOpen(false)
    setSelectedInterval(null)
  }

  const handleSubmitInterval = (data: ScheduleInterval) => {
    if (!hasSchedule) return
    if (selectedInterval) {
      // Update existing
      updateSchedule({
        intervals: schedule!.intervals.map((i) =>
          i.id === selectedInterval.id ? data : i
        ),
      })
      toast.success('Interval updated')
    } else {
      // Add new
      updateSchedule({
        intervals: [...schedule!.intervals, data],
      })
      toast.success('Interval added')
    }
    setIsFormOpen(false)
    setSelectedInterval(null)
  }

  const handleScheduleSubmit = (data: {
    name: string
    isActive: boolean
  }) => {
    updateSchedule(data)
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
        
        updateSchedule({
          intervals: schedule!.intervals.map((i) =>
            i.id === interval.id
              ? {
                  ...i,
                  startTime: newStartTime,
                  durationHours: newDurationHours,
                  durationMinutes: newDurationMins,
                }
              : i
          ),
        })
        toast.success('Interval resized')
      } else {
        const newDurationMinutes = Math.max(15, Math.min(24 * 60 - timeToMinutes(interval.startTime), resizeStartMinutes + deltaMinutes))
        const newDurationHours = Math.floor(newDurationMinutes / 60)
        const newDurationMins = newDurationMinutes % 60
        
        updateSchedule({
          intervals: schedule!.intervals.map((i) =>
            i.id === interval.id
              ? {
                  ...i,
                  durationHours: newDurationHours,
                  durationMinutes: newDurationMins,
                }
              : i
          ),
        })
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
      
      updateSchedule({
        intervals: schedule!.intervals.map((i) =>
          i.id === interval.id
            ? {
                ...i,
                startTime: newStartTime,
              }
            : i
        ),
      })
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
  }, [draggedInterval, dragOffset, resizeHandle, resizeStartMinutes, dragStartMinutes, schedule, updateSchedule])

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

  const isDisabled = !hasSchedule || schedule?.mode !== 'manual'

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header Section */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Calendar className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>AHU Schedule</h2>
              <p className='text-muted-foreground text-sm'>
                Manage AHU schedules for individual units or all units
              </p>
            </div>
          </div>
        </div>

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
                {hasSchedule && schedule.mode === 'manual' && (
                  <Button onClick={handleAddInterval} disabled={isDisabled}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Interval
                  </Button>
                )}
              </div>
              <div className='mt-4 flex flex-wrap items-center gap-4 pt-4 border-t'>
                <Form {...scheduleForm}>
                  <form
                    onSubmit={scheduleForm.handleSubmit(handleScheduleSubmit)}
                    className='flex flex-wrap items-center gap-4'
                  >
                    <FormField
                      control={scheduleForm.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem className='m-0'>
                          <FormControl>
                            <Input 
                              placeholder='Schedule name' 
                              {...field} 
                              disabled={!hasSchedule}
                              className='h-9 w-[180px]'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>All AHUs</span>
                      <Switch
                        checked={isAllAHUsMode}
                        onCheckedChange={handleModeSwitchChange}
                      />
                    </div>
                    {!isAllAHUsMode && (
                      <Select
                        value={selectedIndividualAHU || mockAHUs[0]?.id}
                        onValueChange={(value) => handleIndividualAHUChange(value)}
                      >
                        <SelectTrigger className='h-9 w-[200px]'>
                          <SelectValue placeholder='Select AHU' />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAHUs.map((ahu) => (
                            <SelectItem key={ahu.id} value={ahu.id}>
                              {ahu.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormField
                      control={scheduleForm.control}
                      name='isActive'
                      render={({ field }) => (
                        <FormItem className='flex items-center gap-2 m-0'>
                          <FormLabel className='text-sm font-medium m-0'>Active</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!hasSchedule}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={scheduleForm.control}
                      name='isActive'
                      render={() => (
                        <FormItem className='m-0'>
                          <Select
                            value={schedule?.mode || 'off'}
                            onValueChange={(value) =>
                              handleModeChange(value as OperatingMode)
                            }
                            disabled={!hasSchedule}
                          >
                            <FormControl>
                              <SelectTrigger className='h-9 w-[140px]'>
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
                  </form>
                </Form>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto px-6 pb-6'>
                <div className='min-w-[750px]'>
                  {/* Hour Header */}
                  <div className='mb-2 flex border-b pb-2'>
                    <div className='w-24 flex-shrink-0 font-medium'>Day</div>
                    <div className='relative flex-1'>
                      {/* Show every 2 hours to reduce crowding */}
                      {HOURS.filter((hour) => hour % 2 === 0).map((hour) => (
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

                  {/* Days with CO2 Pattern and Schedule Timeline */}
                  {hasSchedule ? (
                    DAYS_OF_WEEK.map((day) => {
                      const dayIntervals = getIntervalsForDay(schedule!.intervals, day)
                      return (
                        <div
                          key={day}
                          className='mb-4 border-b last:border-b-0 pb-4 last:pb-0'
                        >
                          {/* CO2 Pattern Row */}
                          <div className='relative mb-1 flex min-h-[30px]'>
                            <div className='w-24 flex-shrink-0 flex flex-col py-2'>
                              <div className='font-medium'>{DAY_LABELS[day]}</div>
                              <div className='text-muted-foreground text-xs'>
                                CO2 Pattern
                              </div>
                            </div>
                            <div className='relative flex-1 py-2'>
                              <div className='absolute inset-0 flex gap-px px-px'>
                                {QUARTER_HOURS.map((minutes) => {
                                  const hour = minutes / 60 // Convert to fractional hours
                                  const co2Level = getCO2Level(day, hour)
                                  // Clip y-axis at 430 ppm: 430 ppm = 0%, 520 ppm = 60% (60% of original height)
                                  const height = Math.min(Math.max(((co2Level - 430) / 90) * 60, 0), 60)
                                  const timeString = minutesToTime(minutes)
                                  const color = getCO2Color(co2Level)
                                  return (
                                    <div
                                      key={minutes}
                                      className='flex-1 rounded-sm'
                                      style={{
                                        background: `linear-gradient(to top, ${color} ${height}%, transparent ${height}%)`,
                                      }}
                                      title={`${timeString} - CO2: ${Math.round(co2Level)} ppm`}
                                    />
                                  )
                                })}
                              </div>
                              {/* Hour Grid Lines */}
                              <div className='absolute inset-0 flex'>
                                {HOURS.map((hour) => (
                                  <div
                                    key={hour}
                                    className='absolute border-r border-dashed border-muted/50'
                                    style={{ left: `${(hour / 24) * 100}%` }}
                                  />
                                ))}
                              </div>
                              {/* AHU Operating Hours Start/Stop Lines */}
                              {mockAHUOperatingHours
                                .filter((ahuHours) => {
                                  // Show all AHUs when "All AHUs" mode is selected
                                  if (isAllAHUsMode) return true
                                  // Show only the selected AHU when a specific one is selected
                                  if (selectedIndividualAHU) {
                                    return ahuHours.ahuId === selectedIndividualAHU
                                  }
                                  // Don't show any when no AHU is selected
                                  return false
                                })
                                .map((ahuHours) => {
                                  const dayHours = ahuHours[day]
                                  if (!dayHours || typeof dayHours === 'string') return null
                                  
                                  const ahuName = mockAHUs.find(ahu => ahu.id === ahuHours.ahuId)?.name || `AHU ${ahuHours.ahuId}`
                                  const color = getAHUColor(ahuHours.ahuId)
                                  const startMinutes = timeToMinutes(dayHours.startTime)
                                  const endMinutes = timeToMinutes(dayHours.endTime)
                                  const startPercent = (startMinutes / (24 * 60)) * 100
                                  const endPercent = (endMinutes / (24 * 60)) * 100
                                  
                                  return (
                                    <React.Fragment key={ahuHours.ahuId}>
                                      {/* Start line */}
                                      <div
                                        className='absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed z-10 cursor-pointer group opacity-50 hover:opacity-100 transition-opacity'
                                        style={{ 
                                          left: `${startPercent}%`,
                                          borderColor: color,
                                        }}
                                        title={`${ahuName} - Start: ${dayHours.startTime}`}
                                      >
                                        <div className='absolute left-0 top-full mt-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20'>
                                          {ahuName} - Start: {dayHours.startTime}
                                        </div>
                                      </div>
                                      {/* End line */}
                                      <div
                                        className='absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed z-10 cursor-pointer group opacity-50 hover:opacity-100 transition-opacity'
                                        style={{ 
                                          left: `${endPercent}%`,
                                          borderColor: color,
                                        }}
                                        title={`${ahuName} - End: ${dayHours.endTime}`}
                                      >
                                        <div className='absolute left-0 top-full mt-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20'>
                                          {ahuName} - End: {dayHours.endTime}
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  )
                                })}
                            </div>
                          </div>

                          {/* Schedule Timeline Row */}
                          <div className='relative flex min-h-[40px]'>
                            <div className='w-24 flex-shrink-0' />
                            <div className='relative flex-1 py-1' data-timeline>
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
                                const displayedTime = getDisplayedTime(interval)
                                return (
                                  <div
                                    key={interval.id}
                                    className={cn(
                                      'group absolute top-0.5 bottom-0.5 rounded border-2 transition-all flex items-center gap-2',
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
                                    {/* Text content inside the block: time on left, metadata on right */}
                                    <div className='flex-1 flex items-center justify-between gap-2 px-1 text-xs'>
                                      <div className='font-medium whitespace-nowrap'>
                                        {displayedTime.startTime} - {displayedTime.endTime}
                                      </div>
                                      <div className='flex items-center gap-1.5 text-[10px] leading-tight text-muted-foreground/80'>
                                        <span>Lower: {interval.temperatureLowering}°C</span>
                                        <span>AHU: {interval.ahuPressure}%</span>
                                        <span>{interval.ahuTemperature}°C</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className='flex min-h-[400px] items-center justify-center text-muted-foreground'>
                      <div className='text-center'>
                        <p className='text-lg font-medium'>No Schedule Selected</p>
                        <p className='text-sm mt-2'>
                          Select an AHU from the dropdown above to manage its schedule.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                        Maximum degrees allowed to lower comfort
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

