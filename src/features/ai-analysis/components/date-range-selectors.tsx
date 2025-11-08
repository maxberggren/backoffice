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
          <div className='space-y-2'>
            <Label htmlFor='on-start-date'>Start Date</Label>
            <DatePicker
              selected={config.onStartDate ?? undefined}
              onSelect={(date) => onConfigChange({ onStartDate: date ?? null })}
              placeholder='Select start date'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='on-end-date'>End Date</Label>
            <DatePicker
              selected={config.onEndDate ?? undefined}
              onSelect={(date) => onConfigChange({ onEndDate: date ?? null })}
              placeholder='Select end date'
            />
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
          <div className='space-y-2'>
            <Label htmlFor='off-start-date'>Start Date</Label>
            <DatePicker
              selected={config.offStartDate ?? undefined}
              onSelect={(date) => onConfigChange({ offStartDate: date ?? null })}
              placeholder='Select start date'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='off-end-date'>End Date</Label>
            <DatePicker
              selected={config.offEndDate ?? undefined}
              onSelect={(date) => onConfigChange({ offEndDate: date ?? null })}
              placeholder='Select end date'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

