import { DatePicker } from '@/components/date-picker'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type AnalysisConfig } from '../data/schema'

interface DateRangeSelectorsProps {
  config: AnalysisConfig
  onConfigChange: (config: Partial<AnalysisConfig>) => void
}

export function DateRangeSelectors({ config, onConfigChange }: DateRangeSelectorsProps) {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>ON State Period</CardTitle>
          <CardDescription>
            Define the date range when AI control was active
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-2 md:grid-cols-2'>
            <div className='space-y-1'>
              <Label htmlFor='on-start-date' className='text-sm'>Start Date</Label>
              <DatePicker
                selected={config.onStartDate ?? undefined}
                onSelect={(date) => onConfigChange({ onStartDate: date ?? null })}
                placeholder='Select start date'
                className='w-full h-9'
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='on-end-date' className='text-sm'>End Date</Label>
              <DatePicker
                selected={config.onEndDate ?? undefined}
                onSelect={(date) => onConfigChange({ onEndDate: date ?? null })}
                placeholder='Select end date'
                className='w-full h-9'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OFF State Period</CardTitle>
          <CardDescription>
            Define the date range when AI control was inactive
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-2 md:grid-cols-2'>
            <div className='space-y-1'>
              <Label htmlFor='off-start-date' className='text-sm'>Start Date</Label>
              <DatePicker
                selected={config.offStartDate ?? undefined}
                onSelect={(date) => onConfigChange({ offStartDate: date ?? null })}
                placeholder='Select start date'
                className='w-full h-9'
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='off-end-date' className='text-sm'>End Date</Label>
              <DatePicker
                selected={config.offEndDate ?? undefined}
                onSelect={(date) => onConfigChange({ offEndDate: date ?? null })}
                placeholder='Select end date'
                className='w-full h-9'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

