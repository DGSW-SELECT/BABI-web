import type { GrowthComparisonResponse, GrowthMetric, GrowthRecord } from './growthTypes'

export const growthMetrics: Record<GrowthMetric, { label: string; unit: string; tickStep: number }> = {
  heightCm: { label: '키', unit: 'cm', tickStep: 10 },
  weightKg: { label: '몸무게', unit: 'kg', tickStep: 2 },
}

// GET growth-records 응답의 item과 같은 형태인 화면 개발용 예시 데이터입니다.
export const growthMockRecords: GrowthRecord[] = [
  { growthRecordId: 1, measuredDate: '2026-04-01', heightCm: 70.5, weightKg: 6.9 },
  { growthRecordId: 2, measuredDate: '2026-05-01', heightCm: 73.6, weightKg: 7.7 },
  { growthRecordId: 3, measuredDate: '2026-06-01', heightCm: 75.6, weightKg: 8.3 },
  { growthRecordId: 4, measuredDate: '2026-07-01', heightCm: 77.7, weightKg: 8.8 },
  { growthRecordId: 5, measuredDate: '2026-08-01', heightCm: 78.7, weightKg: 9.4 },
  { growthRecordId: 6, measuredDate: '2026-09-01', heightCm: 80, weightKg: 10 },
]

// GET growth-comparison 응답처럼 직전 기록과의 변화 및 경과 일수를 제공합니다.
export const growthMockComparison: GrowthComparisonResponse = {
  current: growthMockRecords[5],
  previous: growthMockRecords[4],
  change: { days: 31, heightCm: 1.3, weightKg: 0.6 },
}
