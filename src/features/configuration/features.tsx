import { Card, CardContent } from '@/components/ui/card'

export function ConfigurationFeatures() {
  return (
    <Card>
      <CardContent className='py-12'>
        <div className='flex flex-col items-center justify-center text-center'>
          <p className='text-muted-foreground text-lg'>
            Features configuration will be available here
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

