import { type Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

/**
 * Converts a value to a CSV-safe string
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Extracts text content from a React element recursively
 */
function extractTextContent(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  // If it's a string or number, return it
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  
  // If it's a React element (has props)
  if (typeof value === 'object' && value !== null && 'props' in value) {
    const props = value.props as { children?: unknown }
    
    // If it has children, recursively extract text
    if (props?.children !== undefined) {
      if (Array.isArray(props.children)) {
        return props.children.map(extractTextContent).join('')
      }
      return extractTextContent(props.children)
    }
    
    // Check for common text props
    if ('title' in props && typeof props.title === 'string') {
      return props.title
    }
    
    return ''
  }
  
  return String(value)
}

/**
 * Gets a readable value from a cell for CSV export
 */
function getCellValueForCSV<TData>(
  cell: ReturnType<typeof flexRender>,
  columnId: string,
  rowData: TData,
  cellValue: unknown
): string {
  // First, try to get the raw value from the row data
  if (rowData && typeof rowData === 'object') {
    const data = rowData as Record<string, unknown>
    
    // Handle nested properties (e.g., read.proMesOpe)
    if (columnId.startsWith('read')) {
      if ('read' in data && data.read && typeof data.read === 'object') {
        const readData = data.read as Record<string, unknown>
        if (columnId === 'readProMesOpe' && 'proMesOpe' in readData) {
          return String(readData.proMesOpe || '')
        }
        if (columnId === 'readSmhWebProOpeMet' && 'smhWebProOpeMet' in readData) {
          return String(readData.smhWebProOpeMet || '')
        }
        if (columnId === 'readSmhWebAirOpe' && 'smhWebAirOpe' in readData) {
          return String(readData.smhWebAirOpe || '')
        }
        if (columnId === 'readAugOpe' && 'augOpe' in readData) {
          return String(readData.augOpe || '')
        }
      }
    }
    
    // Handle direct properties
    if (columnId in data) {
      const rawValue = data[columnId]
      if (rawValue !== null && rawValue !== undefined) {
        // Handle special cases
        if (typeof rawValue === 'boolean') {
          return rawValue ? 'Yes' : 'No'
        }
        if (typeof rawValue === 'object') {
          // Handle nested objects (like rmse: { value, target })
          if ('value' in rawValue && 'target' in rawValue) {
            const rmse = rawValue as { value: number; target: number }
            return `${rmse.value.toFixed(2)} / ${rmse.target.toFixed(2)}`
          }
          return JSON.stringify(rawValue)
        }
        return String(rawValue)
      }
    }
  }
  
  // Use the cell value if available
  if (cellValue !== null && cellValue !== undefined) {
    if (typeof cellValue === 'boolean') {
      return cellValue ? 'Yes' : 'No'
    }
    return String(cellValue)
  }
  
  // Try to extract text from rendered React element
  const textContent = extractTextContent(cell)
  
  // If we got meaningful text, use it
  if (textContent && textContent.trim()) {
    return textContent.trim()
  }
  
  return ''
}

/**
 * Exports table data to CSV
 */
export function exportTableToCSV<TData>(
  table: Table<TData>,
  filename: string = 'export.csv'
): void {
  // Get visible columns (excluding select and actions columns)
  const visibleColumns = table
    .getVisibleFlatColumns()
    .filter((column) => column.id !== 'select' && column.id !== 'actions')

  if (visibleColumns.length === 0) {
    alert('No columns to export')
    return
  }

  // Get rows to export (selected rows if any, otherwise all filtered rows)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const rowsToExport = selectedRows.length > 0 
    ? selectedRows 
    : table.getFilteredRowModel().rows

  if (rowsToExport.length === 0) {
    alert('No data to export')
    return
  }

  // Build CSV header - get header text from column definitions
  const headers = visibleColumns.map((column) => {
    const headerDef = column.columnDef.header
    if (typeof headerDef === 'function') {
      // Render the header to get its text content
      try {
        const headerValue = headerDef({ column, header: column, table })
        const text = extractTextContent(headerValue)
        if (text) return text
      } catch {
        // Fallback if rendering fails
      }
    }
    // Fallback to column ID or title
    return column.id || String(headerDef || '')
  })

  // Build CSV rows
  const rows = rowsToExport.map((row) => {
    return visibleColumns.map((column) => {
      const cell = row.getVisibleCells().find((c) => c.column.id === column.id)
      if (!cell) {
        return ''
      }

      // Get the rendered cell value
      const renderedValue = flexRender(cell.column.columnDef.cell, cell.getContext())
      const rawCellValue = cell.getValue()
      
      // Extract text content from the rendered value, using row data as fallback
      const cellText = getCellValueForCSV(renderedValue, column.id, row.original, rawCellValue)
      
      // If no text found, use the raw cell value as final fallback
      if (!cellText && rawCellValue !== null && rawCellValue !== undefined) {
        return String(rawCellValue)
      }
      
      return cellText || ''
    })
  })

  // Combine header and rows
  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map((row) => row.map(escapeCSVValue).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

