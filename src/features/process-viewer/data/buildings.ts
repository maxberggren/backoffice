import { faker } from '@faker-js/faker'
import { type ProcessViewerBuilding, type ProcessStatus } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(12345)

const buildingNames = [
  'Building A', 'Building B', 'Building C', 'Building D', 'Building E', 'Building F',
  'Office Complex 1', 'Office Complex 2', 'Corporate Tower', 'Executive Plaza',
  'Innovation Center', 'Tech Hub', 'Business Park', 'Commerce Center',
  'Industrial Complex', 'Residential Tower', 'Retail Plaza', 'Manufacturing Plant',
]

const clientNames = [
  'Property Group Alpha', 'Real Estate Beta', 'Development Corp Gamma', 'Holdings Delta',
  'Acme Corporation', 'Tech Solutions Inc', 'Global Industries', 'Metro Properties',
  'Urban Development Group', 'Commercial Realty', 'Industrial Holdings', 'Residential Partners',
]

const countries = ['Sweden', 'Norway', 'Denmark', 'Finland', 'Germany', 'UK']

const processStatuses: ProcessStatus[] = ['active', 'inactive', 'error', 'pending']

function getRandomProcessStatus(): ProcessStatus {
  return faker.helpers.arrayElement(processStatuses)
}

function getRandomBoolean(): boolean {
  return faker.datatype.boolean()
}

export const processViewerBuildings: ProcessViewerBuilding[] = Array.from(
  { length: 30 },
  (_, index) => {
    const isOnline = index % 10 !== 0 // 90% online
    const hasError = index % 7 === 0 // Some have errors
    
    return {
      id: faker.string.uuid(),
      building: buildingNames[index % buildingNames.length],
      buildingId: `BLD-${String(index + 1).padStart(4, '0')}`,
      client: clientNames[index % clientNames.length],
      country: countries[index % countries.length],
      area: faker.number.int({ min: 1000, max: 50000 }),
      temperature: faker.number.float({ min: 18, max: 24, fractionDigits: 1 }),
      isOnline,
      
      // Process states - mix of active, inactive, error, pending
      myrDs: getRandomProcessStatus(),
      myrD: getRandomProcessStatus(),
      spov: hasError ? 'error' : getRandomProcessStatus(),
      write: getRandomProcessStatus(),
      read: {
        proMesOpe: getRandomProcessStatus(),
        smhWebProOpeMet: getRandomProcessStatus(),
        smhWebAirOpe: getRandomProcessStatus(),
        augOpe: getRandomProcessStatus(),
      },
      train: index % 3 === 0 ? 'active' : 'inactive',
      hypOpt: getRandomProcessStatus(),
      discovery: getRandomProcessStatus(),
      maintenance: isOnline ? (index % 5 === 0 ? 'active' : 'inactive') : 'error',
      
      // Metrics
      uptime24H: isOnline ? faker.number.float({ min: 85, max: 100, fractionDigits: 0 }) : 0,
      rmse: isOnline ? {
        value: faker.number.float({ min: 0.4, max: 0.8, fractionDigits: 2 }),
        target: faker.number.float({ min: 0.5, max: 0.7, fractionDigits: 2 }),
      } : undefined,
      since: !isOnline ? faker.date.past({ years: 1 }).toISOString().split('T')[0] : undefined,
      message: !isOnline ? faker.helpers.arrayElement([
        'Lost connection to BMS. Technicians are looking into it. Ask for status update from them',
        'Building vacated and most systems offline',
        'Scheduled maintenance - systems temporarily offline',
      ]) : undefined,
      
      // Additional fields
      adaptiveMin: faker.number.float({ min: 18, max: 20, fractionDigits: 1 }),
      adaptiveMax: faker.number.float({ min: 22, max: 24, fractionDigits: 1 }),
      hasClimateBaseline: getRandomBoolean(),
      hasReadWriteDiscrepancies: index % 8 === 0,
      hasZoneAssets: getRandomBoolean(),
      hasHeatingCircuit: getRandomBoolean(),
      hasVentilation: getRandomBoolean(),
      missingVSGTOVConnections: index % 10 === 0,
      missingLBGPOVConnections: index % 12 === 0,
      missingLBGTOVConnections: index % 15 === 0,
      savingEnergy: getRandomBoolean(),
      automaticComfortScheduleActive: getRandomBoolean(),
      manualComfortScheduleActive: !getRandomBoolean() && getRandomBoolean(),
      componentsErrors: index % 6 === 0 ? faker.number.int({ min: 1, max: 5 }) : 0,
      modelTrainingTestR2Score: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 3 }),
      hasDistrictHeatingMeter: getRandomBoolean(),
      hasDistrictCoolingMeter: getRandomBoolean(),
      hasElectricityMeter: getRandomBoolean(),
      lastWeekUptime: faker.number.float({ min: 80, max: 100, fractionDigits: 0 }),
    }
  }
)

