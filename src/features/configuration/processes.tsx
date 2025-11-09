import { Card, CardContent } from '@/components/ui/card'

export function ConfigurationProcesses() {
  return (
    <Card>
      <CardContent className='py-12'>
        <div className='flex flex-col items-center justify-center text-center'>
          <p className='text-muted-foreground text-lg'>
            Process monitoring and configuration will be available here
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

