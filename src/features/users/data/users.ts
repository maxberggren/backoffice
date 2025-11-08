import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(67890)

const buildingNames = [
  'Corporate Tower', 'Executive Plaza', 'Innovation Center', 'Tech Hub',
  'Business Park', 'Commerce Center', 'Industrial Complex', 'Residential Tower',
  'Retail Plaza', 'Office Park', 'Manufacturing Plant', 'Distribution Center',
  'Research Lab', 'Data Center', 'Medical Center', 'Education Building'
]

const companyNames = [
  'Acme Corporation', 'Tech Solutions Inc', 'Global Industries', 'Metro Properties',
  'Urban Development Group', 'Commercial Realty', 'Industrial Holdings', 'Residential Partners',
  'Retail Ventures', 'Office Space Co', 'Manufacturing Corp', 'Logistics Group',
  'Research Institute', 'Data Systems Ltd', 'Healthcare Facilities', 'Education Services'
]

export const users = Array.from({ length: 50 }, (_, index) => {
  const baseTemp = 20 + faker.number.float({ min: -2, max: 4, fractionDigits: 1 })
  const targetTemp = 22
  
  return {
    id: faker.string.uuid(),
    name: `${buildingNames[index % buildingNames.length]} ${faker.location.direction()}`,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    company: companyNames[index % companyNames.length],
    type: faker.helpers.arrayElement([
      'office',
      'residential',
      'retail',
      'industrial',
    ]),
    status: faker.helpers.arrayElement([
      'operational',
      'operational',
      'operational',
      'operational',
      'maintenance',
      'warning',
    ]),
    temperature: baseTemp,
    targetTemperature: targetTemp,
    humidity: faker.number.int({ min: 30, max: 60 }),
    energyUsage: faker.number.float({ min: 500, max: 5000, fractionDigits: 0 }),
    floors: faker.number.int({ min: 1, max: 50 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
