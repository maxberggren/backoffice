import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { InfoIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePropertyStore } from '@/stores/property-store'

const aiSettingsSchema = z.object({
  // AI Parameters
  aiVersion: z.string(),
  maxChangeVSGT: z.number().min(0).max(100),
  adaptiveMinVSGT: z.number().min(0).max(100),
  adaptiveMaxVSGT: z.number().min(0).max(100),
  aiFreedom: z.number().min(0).max(100),
  bidailyOffline: z.boolean(),
  autoComfortScheduleObservables: z.number(),
  autoComfortScheduleLBGP: z.boolean(),
  autoComfortScheduleLBGT: z.number(),
  indoorClimateBaseline: z.boolean(),
  heatWithVentilation: z.boolean(),
})

type AISettingsValues = z.infer<typeof aiSettingsSchema>

interface AISettingsFormProps {
  propertyId?: string
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className='inline-flex items-center'
          onClick={(e) => e.preventDefault()}
        >
          <InfoIcon className='ml-1.5 size-4 text-muted-foreground' />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className='max-w-xs'>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function ConfigurationAISettings({ propertyId: _propertyId = '1126' }: AISettingsFormProps) {
  const { selectedProperty } = usePropertyStore()

  const form = useForm<AISettingsValues>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      // AI Parameters
      aiVersion: 'AI5',
      maxChangeVSGT: 25.0,
      adaptiveMinVSGT: 100.0,
      adaptiveMaxVSGT: 25.0,
      aiFreedom: 100.0,
      bidailyOffline: false,
      autoComfortScheduleObservables: 0.0,
      autoComfortScheduleLBGP: false,
      autoComfortScheduleLBGT: 0.0,
      indoorClimateBaseline: false,
      heatWithVentilation: false,
    },
  })

  // Update form when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      // Could load AI settings from property if available
    }
  }, [selectedProperty])

  function onSubmit(data: AISettingsValues) {
    showSubmittedData(data)
  }

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* AI Configuration Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>
                    Advanced AI parameters for property optimization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='aiVersion'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        AI Version
                        <InfoTooltip content='Current AI model version in use' />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled className='bg-muted' />
                      </FormControl>
                      <FormDescription>
                        Version of the AI optimization model
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='aiFreedom'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        AI Freedom (%)
                        <InfoTooltip content='Degree of autonomy for AI decision-making' />
                      </FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                          <div className='flex items-center justify-between text-sm text-muted-foreground'>
                            <span>0%</span>
                            <span className='font-medium'>{field.value.toFixed(1)}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Percentage of autonomy allowed for AI decisions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='maxChangeVSGT'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        Max Change VSGT (%)
                        <InfoTooltip content='Maximum allowed change in VSGT (Ventilation Supply Gas Temperature)' />
                      </FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                          <div className='flex items-center justify-between text-sm text-muted-foreground'>
                            <span>0%</span>
                            <span className='font-medium'>{field.value.toFixed(1)}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='adaptiveMinVSGT'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        Adaptive Min VSGT (%)
                        <InfoTooltip content='Minimum adaptive VSGT threshold' />
                      </FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                          <div className='flex items-center justify-between text-sm text-muted-foreground'>
                            <span>0%</span>
                            <span className='font-medium'>{field.value.toFixed(1)}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='adaptiveMaxVSGT'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        Adaptive Max VSGT (%)
                        <InfoTooltip content='Maximum adaptive VSGT threshold' />
                      </FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                          <div className='flex items-center justify-between text-sm text-muted-foreground'>
                            <span>0%</span>
                            <span className='font-medium'>{field.value.toFixed(1)}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bidailyOffline'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base flex items-center'>
                          Bidaily Offline
                          <InfoTooltip content='Enable bidaily offline processing' />
                        </FormLabel>
                        <FormDescription>
                          Process data offline every two days
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name='autoComfortScheduleObservables'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        Auto Comfort Schedule Observables (°C)
                        <InfoTooltip content='Temperature observables for automatic comfort scheduling' />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          step='0.0001'
                          placeholder='0.0000'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='autoComfortScheduleLBGP'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base flex items-center'>
                          Auto Comfort Schedule
                          <InfoTooltip content='Enable automatic comfort schedule' />
                        </FormLabel>
                        <FormDescription>
                          Automatically adjust comfort schedule based on conditions
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name='autoComfortScheduleLBGT'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        Auto Comfort Schedule LBGT (°C)
                        <InfoTooltip content='Lower bound gas temperature for automatic comfort schedule' />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          step='0.0001'
                          placeholder='0.0000'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='indoorClimateBaseline'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base flex items-center'>
                          Indoor Climate Baseline
                          <InfoTooltip content='Enable baseline tracking for indoor climate measurements' />
                        </FormLabel>
                        <FormDescription>
                          Use baseline values for indoor climate monitoring
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name='heatWithVentilation'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base flex items-center'>
                          Heat With Ventilation (Beta)
                          <InfoTooltip content='Experimental feature for heating with ventilation system' />
                        </FormLabel>
                        <FormDescription>
                          Beta feature - use with caution
                        </FormDescription>
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
            </CardContent>
          </Card>

          <div className='flex justify-end'>
            <Button type='submit' size='lg'>
              Update AI Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

