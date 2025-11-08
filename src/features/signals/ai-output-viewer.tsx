import { useState } from 'react'
import { format } from 'date-fns'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
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
import { Sparkles, Clock } from 'lucide-react'

// AI Output entry type
type AiOutputEntry = {
  id: string
  created: Date
  received: Date
  sentToBms: Date | null
  signalCount: number
}

// Detailed AI Output Data
type AiOutputData = {
  signal: string
  key: string
  output: number
  readValue: number | null
  diff: number | null
  writes: number
}

// Generate sample AI Output entries
const generateAiOutputEntries = (timePeriod: string): AiOutputEntry[] => {
  const now = new Date()
  const entries: AiOutputEntry[] = []
  
  // Generate entries based on time period
  let count = 0
  if (timePeriod === '1h') count = 4
  else if (timePeriod === '24h') count = 20
  else if (timePeriod === '7d') count = 50
  else count = 100
  
  for (let i = 0; i < count; i++) {
    const created = new Date(now.getTime() - i * 60 * 60 * 1000)
    const received = new Date(created.getTime() + Math.random() * 5 * 60 * 1000)
    entries.push({
      id: `ai-output-${i}`,
      created,
      received,
      sentToBms: Math.random() > 0.7 ? new Date(received.getTime() + Math.random() * 10 * 60 * 1000) : null,
      signalCount: Math.floor(Math.random() * 15) + 10,
    })
  }
  
  return entries
}

// Generate detailed data for an entry
const generateDetailedData = (_entryId: string): AiOutputData[] => {
  return [
    { signal: 'LB11_GP101', key: 'LB11_GP101_PV', output: 118.01, readValue: null, diff: null, writes: 1 },
    { signal: 'LB11_GP102', key: 'LB11_GP102_PV', output: 175.61, readValue: null, diff: null, writes: 1 },
    { signal: 'LB11_GT101', key: 'LB11_GT101_PV', output: 15.02, readValue: null, diff: null, writes: 6 },
    { signal: 'LB21_GP101', key: 'LB21_GP101_PV', output: 150.01, readValue: null, diff: null, writes: 1 },
    { signal: 'LB21_GP102', key: 'LB21_GP102_PV', output: 108.01, readValue: null, diff: null, writes: 1 },
    { signal: 'LB21_GT101', key: 'LB21_GT101_PV', output: 18.01, readValue: null, diff: null, writes: 6 },
    { signal: 'LB22_GP101', key: 'LB22_GP101_PV', output: 210.01, readValue: null, diff: null, writes: 1 },
    { signal: 'LB22_GP102', key: 'LB22_GP102_PV', output: 168.01, readValue: null, diff: null, writes: 1 },
    { signal: 'LB22_GT101', key: 'LB22_GT101_PV', output: 18.00, readValue: null, diff: null, writes: 6 },
    { signal: 'LB23_GP101', key: 'LB23_GP101_PV', output: 80.98, readValue: null, diff: null, writes: 1 },
    { signal: 'LB23_GP102', key: 'LB23_GP102_PV', output: 60.77, readValue: null, diff: null, writes: 1 },
    { signal: 'LB23_GT101', key: 'LB23_GT101_PV', output: 11.99, readValue: null, diff: null, writes: 6 },
    { signal: 'VS01_GT101', key: 'VS01_GT101_PV', output: 45.80, readValue: null, diff: null, writes: 6 },
    { signal: 'VS13_GT101', key: 'VS13_GT101_PV', output: 20.11, readValue: null, diff: null, writes: 6 },
    { signal: 'VS14_GT101', key: 'VS14_GT101_PV', output: 29.62, readValue: null, diff: null, writes: 6 },
    { signal: 'VS21_GT101', key: 'VS21_GT101_PV', output: 20.02, readValue: null, diff: null, writes: 6 },
  ]
}

export function AiOutputViewer() {
  const [timePeriod, setTimePeriod] = useState('24h')
  const [selectedEntry, setSelectedEntry] = useState<AiOutputEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const entries = generateAiOutputEntries(timePeriod)
  const detailedData = selectedEntry ? generateDetailedData(selectedEntry.id) : []

  const handleRowClick = (entry: AiOutputEntry) => {
    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  const formatDateTime = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm:ss')
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
              <Sparkles className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>AI Output</h2>
              <p className='text-muted-foreground text-sm'>
                View and analyze AI-generated HVAC control outputs
              </p>
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>AI Output Entries</CardTitle>
                <CardDescription>
                  Select a time period to view AI output entries
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select time period' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1h'>Last Hour</SelectItem>
                    <SelectItem value='24h'>Last 24 Hours</SelectItem>
                    <SelectItem value='7d'>Last 7 Days</SelectItem>
                    <SelectItem value='30d'>Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='font-semibold'>Created</TableHead>
                    <TableHead className='font-semibold'>Received</TableHead>
                    <TableHead className='font-semibold'>Sent to BMS</TableHead>
                    <TableHead className='text-right font-semibold'>Signals</TableHead>
                    <TableHead className='text-right font-semibold'>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className='cursor-pointer hover:bg-muted/50 transition-colors'
                      onClick={() => handleRowClick(entry)}
                    >
                      <TableCell className='font-mono text-sm'>
                        {formatDateTime(entry.created)}
                      </TableCell>
                      <TableCell className='font-mono text-sm text-muted-foreground'>
                        {formatDateTime(entry.received)}
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {entry.sentToBms ? (
                          <span className='text-green-600 dark:text-green-400'>
                            {formatDateTime(entry.sentToBms)}
                          </span>
                        ) : (
                          <span className='text-muted-foreground'>--</span>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Badge variant='outline'>{entry.signalCount}</Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Badge
                          variant={entry.sentToBms ? 'default' : 'secondary'}
                        >
                          {entry.sentToBms ? 'Sent' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>AI Output Data</DialogTitle>
              <DialogDescription>
                {selectedEntry && (
                  <>
                    Created: {formatDateTime(selectedEntry.created)} • Received:{' '}
                    {formatDateTime(selectedEntry.received)}
                    {selectedEntry.sentToBms && (
                      <> • Sent to BMS: {formatDateTime(selectedEntry.sentToBms)}</>
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className='mt-4'>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='font-semibold'>Signal</TableHead>
                      <TableHead className='font-semibold'>Key</TableHead>
                      <TableHead className='text-right font-semibold'>Output</TableHead>
                      <TableHead className='text-right font-semibold'>ReadValue</TableHead>
                      <TableHead className='text-right font-semibold'>Diff</TableHead>
                      <TableHead className='text-right font-semibold'>Writes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className='font-mono text-sm'>
                          {row.signal}
                        </TableCell>
                        <TableCell className='font-mono text-sm text-muted-foreground'>
                          {row.key}
                        </TableCell>
                        <TableCell className='text-right'>
                          <span className='font-semibold'>
                            {row.output.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {row.readValue !== null
                            ? row.readValue.toFixed(2)
                            : '--'}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {row.diff !== null ? row.diff.toFixed(2) : '--'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Badge variant='outline'>{row.writes}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
