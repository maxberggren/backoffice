import { useQuery } from '@tanstack/react-query'
import { type TrainingMetrics, type ModelMetrics, type TrainingConfig } from './schema'

// Mock data generator for training metrics
function generateMockTrainingMetrics(): TrainingMetrics[] {
  const metrics: TrainingMetrics[] = []
  const epochs = 50
  const baseDate = new Date('2024-01-01')
  
  for (let epoch = 1; epoch <= epochs; epoch++) {
    // Simulate decreasing loss with some noise
    const trainLoss = Math.max(0.01, 2.0 * Math.exp(-epoch / 15) + (Math.random() - 0.5) * 0.1)
    const valLoss = trainLoss * (1.0 + (Math.random() - 0.5) * 0.2)
    
    // Simulate increasing accuracy
    const trainAccuracy = Math.min(0.99, 0.5 + epoch * 0.01 + (Math.random() - 0.5) * 0.05)
    const valAccuracy = trainAccuracy * (0.95 + Math.random() * 0.05)
    
    // Learning rate decay
    const learningRate = 0.001 * Math.exp(-epoch / 30)
    
    metrics.push({
      epoch,
      trainLoss,
      valLoss,
      trainAccuracy,
      valAccuracy,
      learningRate,
      timestamp: new Date(baseDate.getTime() + epoch * 3600000).toISOString(),
    })
  }
  
  return metrics
}

// Mock model metrics
const mockModelMetrics: ModelMetrics = {
  modelName: 'HVAC Control Model',
  modelVersion: 'v2.1.0',
  trainingStartDate: '2024-01-01T00:00:00Z',
  trainingEndDate: '2024-01-03T02:00:00Z',
  totalEpochs: 50,
  finalTrainLoss: 0.0234,
  finalValLoss: 0.0287,
  finalTrainAccuracy: 0.987,
  finalValAccuracy: 0.964,
  bestEpoch: 45,
  trainingTime: 172800, // 2 days in seconds
  datasetSize: 87600, // hours of data
  validationSplit: 0.2,
}

const mockTrainingConfig: TrainingConfig = {
  learningRate: 0.001,
  batchSize: 32,
  optimizer: 'Adam',
  lossFunction: 'Mean Squared Error',
  metrics: ['loss', 'accuracy', 'mae'],
}

export function useTrainingMetrics() {
  return useQuery<TrainingMetrics[]>({
    queryKey: ['training-metrics'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return generateMockTrainingMetrics()
    },
  })
}

export function useModelMetrics() {
  return useQuery<ModelMetrics>({
    queryKey: ['model-metrics'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockModelMetrics
    },
  })
}

export function useTrainingConfig() {
  return useQuery<TrainingConfig>({
    queryKey: ['training-config'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return mockTrainingConfig
    },
  })
}

