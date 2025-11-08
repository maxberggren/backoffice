import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(12345)

const hvacAlertTitles = [
  'Temperature deviation detected in Zone',
  'HVAC filter replacement required for Unit',
  'High energy consumption detected in',
  'System pressure abnormality in',
  'Humidity levels outside normal range in',
  'Scheduled maintenance due for',
  'Thermostat malfunction reported in',
  'Air quality sensors need calibration in',
  'Compressor performance degraded in',
  'Ventilation system blocked in',
  'Refrigerant levels low in',
  'Fan motor noise detected in',
  'Control system communication error in',
  'Temperature sensor fault in',
]

const buildings = [
  'Corporate Tower North',
  'Executive Plaza',
  'Innovation Center',
  'Tech Hub Building A',
  'Business Park West',
  'Retail Plaza Downtown',
  'Office Park Complex',
  'Medical Center',
]

export const tasks = Array.from({ length: 100 }, () => {
  const statuses = [
    'open',
    'in-progress',
    'resolved',
    'resolved',
    'open',
  ] as const
  const labels = ['maintenance', 'temperature', 'energy', 'system-error'] as const
  const priorities = ['low', 'medium', 'high', 'critical'] as const
  
  const building = faker.helpers.arrayElement(buildings)
  const alertTitle = faker.helpers.arrayElement(hvacAlertTitles)
  const location = `Floor ${faker.number.int({ min: 1, max: 20 })}, Zone ${faker.helpers.arrayElement(['A', 'B', 'C', 'D'])}`

  return {
    id: `ALERT-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: `${alertTitle} ${location}`,
    status: faker.helpers.arrayElement(statuses),
    label: faker.helpers.arrayElement(labels),
    priority: faker.helpers.arrayElement(priorities),
    building,
    location,
    createdAt: faker.date.recent({ days: 7 }),
  }
})
