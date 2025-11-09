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
import { Separator } from '@/components/ui/separator'
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
import { DatePicker } from '@/components/date-picker'
import { InfoIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePropertyStore } from '@/stores/property-store'

const propertyDetailSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  lat: z.string(),
  long: z.string(),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  squareMeters: z.string(),
  dataSetStartDate: z.date(),
  rmsThreshold: z.string(),
  editSignalsExternal: z.boolean(),
  externalLink: z.string().optional(),
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

type PropertyDetailValues = z.infer<typeof propertyDetailSchema>

interface PropertyDetailFormProps {
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

export function PropertyDetailForm({ propertyId = '1126' }: PropertyDetailFormProps) {
  const { selectedProperty } = usePropertyStore()

  const form = useForm<PropertyDetailValues>({
    resolver: zodResolver(propertyDetailSchema),
    defaultValues: {
      id: propertyId,
      name: selectedProperty?.name || '',
      lat: '50.07965',
      long: '14.45357',
      city: selectedProperty?.city || '',
      country: 'Czechia',
      timezone: 'Europe/Prague',
      squareMeters: '36800',
      dataSetStartDate: new Date('2021-12-14T06:00:00'),
      rmsThreshold: '1.700',
      editSignalsExternal: true,
      externalLink: 'https://portal.myrspoven.se/EditSignalsWithToken/EditSignalsToken?webNum',
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
      form.setValue('name', selectedProperty.name)
      form.setValue('city', selectedProperty.city)
      form.setValue('id', selectedProperty.id)
    }
  }, [selectedProperty, form])

  function onSubmit(data: PropertyDetailValues) {
    showSubmittedData(data)
  }

  return (
    <div className='space-y-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-6 lg:grid-cols-2'>
              {/* General Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>
                    Basic property details and location information
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property ID</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className='bg-muted' />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for this property
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Enter property name' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='lat'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center'>
                            Latitude
                            <InfoTooltip content='Geographic latitude coordinate' />
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='number'
                              step='0.00001'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='long'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center'>
                            Longitude
                            <InfoTooltip content='Geographic longitude coordinate' />
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='number'
                              step='0.00001'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='country'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='timezone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Europe/Prague' />
                        </FormControl>
                        <FormDescription>
                          IANA timezone identifier (e.g., Europe/Prague)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='squareMeters'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Meters</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='number'
                            placeholder='36800'
                          />
                        </FormControl>
                        <FormDescription>
                          Total floor area in square meters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* System Configuration Card */}
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>
                    HVAC system settings and thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='dataSetStartDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Dataset Start Date</FormLabel>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                        <FormDescription>
                          Date when data collection began for this property
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='rmsThreshold'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center'>
                          RMS Degree Threshold to Close Property
                          <InfoTooltip content='Temperature threshold for automatic property closure' />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='number'
                            step='0.001'
                            placeholder='1.700'
                            value={field.value ? parseFloat(field.value).toFixed(3) : ''}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                field.onChange('')
                              } else {
                                const numValue = parseFloat(value)
                                if (!isNaN(numValue)) {
                                  field.onChange(numValue.toFixed(3))
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Root mean square temperature deviation threshold
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className='my-4' />

                  <FormField
                    control={form.control}
                    name='editSignalsExternal'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            Enable External Signal Editing
                          </FormLabel>
                          <FormDescription>
                            Allow external systems to edit signals via API
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

                  {form.watch('editSignalsExternal') && (
                    <FormField
                      control={form.control}
                      name='externalLink'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>External Link</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='url'
                              placeholder='https://portal.myrspoven.se/...'
                            />
                          </FormControl>
                          <FormDescription>
                            URL for external signal editing portal
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

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
                Update Configuration
              </Button>
            </div>
          </form>
        </Form>
    </div>
  )
}

