export interface TrainingMetrics {
  epoch: number
  trainLoss: number
  valLoss: number
  trainAccuracy?: number
  valAccuracy?: number
  learningRate: number
  timestamp: string
}

export interface ModelMetrics {
  modelName: string
  modelVersion: string
  trainingStartDate: string
  trainingEndDate: string
  totalEpochs: number
  finalTrainLoss: number
  finalValLoss: number
  finalTrainAccuracy?: number
  finalValAccuracy?: number
  bestEpoch: number
  trainingTime: number // in seconds
  datasetSize: number
  validationSplit: number
}

export interface TrainingConfig {
  learningRate: number
  batchSize: number
  optimizer: string
  lossFunction: string
  metrics: string[]
}

