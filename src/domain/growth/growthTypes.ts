export type GrowthMetric = 'heightCm' | 'weightKg'

export type GrowthRecord = {
  growthRecordId: number
  measuredDate: string
  heightCm: number
  weightKg: number
}

export type CreateGrowthRecordRequest = {
  measuredDate: string
  heightCm: number
  weightKg: number
}

export type CreateGrowthRecordResponse = GrowthRecord & {
  babyId: number
  authorMemberId: number
}

export type GrowthRecordsQuery = {
  from?: string
  to?: string
  cursor?: number
  limit?: number
}

export type GrowthRecordsResponse = {
  item: GrowthRecord[]
  // 마지막 페이지의 종료값은 백엔드와 확인해야 합니다. null도 안전하게 처리합니다.
  nextCursor: number | null
}

export type GrowthChange = {
  days: number
  heightCm: number
  weightKg: number
}

export type GrowthComparisonResponse = {
  current: GrowthRecord
  // 최초 기록처럼 이전 기록이 없는 응답도 표시할 수 있도록 null을 허용합니다.
  previous: GrowthRecord | null
  change: GrowthChange | null
}
