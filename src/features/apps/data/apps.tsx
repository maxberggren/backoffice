import { Cpu, Brain, Activity, Zap, TrendingUp, Gauge, Wind, Thermometer, Lightbulb, Timer, BarChart3, LineChart, Network } from 'lucide-react'

export const apps = [
  {
    name: 'Temperature Optimization',
    logo: <Thermometer className='h-6 w-6' />,
    connected: true,
    desc: 'AI model that optimizes temperature settings based on occupancy and weather patterns.',
  },
  {
    name: 'Energy Efficiency',
    logo: <Zap className='h-6 w-6' />,
    connected: true,
    desc: 'Reduces energy consumption by predicting usage patterns and adjusting HVAC operations.',
  },
  {
    name: 'Predictive Maintenance',
    logo: <Activity className='h-6 w-6' />,
    connected: true,
    desc: 'Predicts equipment failures before they occur, enabling proactive maintenance.',
  },
  {
    name: 'Occupancy Detection',
    logo: <Brain className='h-6 w-6' />,
    connected: true,
    desc: 'Uses sensor data to detect building occupancy and adjust HVAC settings accordingly.',
  },
  {
    name: 'Weather Prediction',
    logo: <Wind className='h-6 w-6' />,
    connected: true,
    desc: 'Integrates weather forecasts to pre-adjust HVAC systems for optimal comfort.',
  },
  {
    name: 'Load Balancing',
    logo: <Gauge className='h-6 w-6' />,
    connected: false,
    desc: 'Distributes HVAC load across systems to prevent overuse and extend equipment life.',
  },
  {
    name: 'Air Quality Monitor',
    logo: <Activity className='h-6 w-6' />,
    connected: true,
    desc: 'Monitors and optimizes indoor air quality by adjusting ventilation rates.',
  },
  {
    name: 'Demand Response',
    logo: <TrendingUp className='h-6 w-6' />,
    connected: false,
    desc: 'Automatically responds to grid demand signals to reduce peak energy usage.',
  },
  {
    name: 'Smart Scheduling',
    logo: <Timer className='h-6 w-6' />,
    connected: true,
    desc: 'Creates optimal HVAC schedules based on building usage patterns and preferences.',
  },
  {
    name: 'Anomaly Detection',
    logo: <BarChart3 className='h-6 w-6' />,
    connected: true,
    desc: 'Detects unusual system behavior and alerts operators to potential issues.',
  },
  {
    name: 'Comfort Optimization',
    logo: <Lightbulb className='h-6 w-6' />,
    connected: false,
    desc: 'Balances temperature, humidity, and air flow for optimal occupant comfort.',
  },
  {
    name: 'Multi-Zone Control',
    logo: <Network className='h-6 w-6' />,
    connected: false,
    desc: 'Independently manages multiple zones for precise climate control.',
  },
  {
    name: 'Trend Analysis',
    logo: <LineChart className='h-6 w-6' />,
    connected: true,
    desc: 'Analyzes historical data to identify trends and optimization opportunities.',
  },
  {
    name: 'Reinforcement Learning',
    logo: <Cpu className='h-6 w-6' />,
    connected: false,
    desc: 'Advanced AI that continuously learns and improves HVAC control strategies.',
  },
]
