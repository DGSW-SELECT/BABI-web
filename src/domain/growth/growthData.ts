export type GrowthType = 'height' | 'weight'

export type GrowthRecord = {
  id: number
  date: string
  height?: number
  weight?: number
  memo?: string
}

export type GrowthInput = { date: string; height: string; weight: string }
export type GrowthErrors = { date?: string; height?: string; weight?: string }

export const growthTypes: GrowthType[] = ['height', 'weight']
export const growthLabels = {
  height: { name: '키', unit: 'cm', step: 10 },
  weight: { name: '몸무게', unit: 'kg', step: 2 },
}

export const growthRecords: GrowthRecord[] = [
  { id: 1, date: '2026-04-01', height: 70.5, weight: 6.9 },
  { id: 2, date: '2026-05-01', height: 73.6, weight: 7.7 },
  { id: 3, date: '2026-06-01', height: 75.6, weight: 8.3 },
  { id: 4, date: '2026-07-01', height: 77.7, weight: 8.8 },
  { id: 5, date: '2026-08-01', height: 78.7, weight: 9.4 },
  { id: 6, date: '2026-09-01', height: 80, weight: 10 },
]
