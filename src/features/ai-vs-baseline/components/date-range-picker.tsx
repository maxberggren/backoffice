import { DatePicker } from '@/components/date-picker'
import { Label } from '@/components/ui/label'
import { type AIVsBaselineConfig } from '../data/schema'

interface DateRangePickerProps {
  config: AIVsBaselineConfig
  onConfigChange: (config: Partial<AIVsBaselineConfig>) => void
}

export function DateRangePicker({ config, onConfigChange }: DateRangePickerProps) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <Label htmlFor='start-date' className='whitespace-nowrap text-sm w-12'>Start</Label>
        <DatePicker
          selected={config.startDate ?? undefined}
          onSelect={(date) => onConfigChange({ startDate: date ?? null })}
          placeholder='Start date'
          className='w-[140px]'
        />
      </div>
      <div className='flex items-center gap-2'>
        <Label htmlFor='end-date' className='whitespace-nowrap text-sm w-12'>End</Label>
        <DatePicker
          selected={config.endDate ?? undefined}
          onSelect={(date) => onConfigChange({ endDate: date ?? null })}
          placeholder='End date'
          className='w-[140px]'
        />
      </div>
    </div>
  )
}

