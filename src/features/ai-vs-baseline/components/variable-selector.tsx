import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface VariableSelectorProps {
  selectedVariable: string | null
  availableVariables: string[]
  onVariableChange: (variable: string) => void
}

export function VariableSelector({
  selectedVariable,
  availableVariables,
  onVariableChange,
}: VariableSelectorProps) {
  return (
    <div className='flex flex-col gap-2'>
      <Label htmlFor='variable-select' className='text-sm'>Variable</Label>
      <Select value={selectedVariable ?? ''} onValueChange={onVariableChange}>
        <SelectTrigger id='variable-select' className='w-[200px]'>
          <SelectValue placeholder='Select a variable' />
        </SelectTrigger>
        <SelectContent>
          {availableVariables.map((variable) => (
            <SelectItem key={variable} value={variable}>
              {variable}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

