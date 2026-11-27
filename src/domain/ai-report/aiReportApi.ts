import { request } from '../../global/api/sessionClient'

export type DailyReport = {
  reportId: number
  babyId: number
  reportDate: string
  summary: string
  status: string
  generatedAt: string
  sevenDayAverage: {
    averageDailyFeedingAmountMl: number
    averageDailySleepMinutes: number
    averageTemperatureCelsius: number
  } | null
}

export type DailyReportInput = { reportDate: string; summary: string }

// 배포 Swagger의 날짜별 CRUD다. 돌봄 구간별 AI 생성 API로 취급하지 않는다.
const reportPath = (babyId: number) => `/babies/${babyId}/daily-reports`

export function createDailyReport(babyId: number, input: DailyReportInput) {
  return request<DailyReport>(reportPath(babyId), {
    method: 'POST', body: JSON.stringify(input),
  })
}

export function getDailyReport(babyId: number, date: string) {
  return request<DailyReport>(`${reportPath(babyId)}/${encodeURIComponent(date)}`)
}

export function updateDailyReport(babyId: number, date: string, summary: string) {
  return request<DailyReport>(`${reportPath(babyId)}/${encodeURIComponent(date)}`, {
    method: 'PATCH', body: JSON.stringify({ summary }),
  })
}

export function deleteDailyReport(babyId: number, date: string) {
  return request<null>(`${reportPath(babyId)}/${encodeURIComponent(date)}`, { method: 'DELETE' })
}

export function generateDailyReport(babyId: number, date: string) {
  return request<DailyReport>(`${reportPath(babyId)}/${encodeURIComponent(date)}/generate`, { method: 'POST' })
}
