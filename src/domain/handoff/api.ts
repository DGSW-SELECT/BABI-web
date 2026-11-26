import { request } from '../../global/api/sessionClient'

type Briefing = { briefingDate: string; summary: string }

export function getLatestBriefing(babyId: number, signal: AbortSignal) {
  return request<Briefing>(`/babi/api/babies/${babyId}/handover-briefings/latest`, { signal })
}

export function createBriefing(babyId: number) {
  return request<Briefing>(`/babi/api/babies/${babyId}/handover-briefings`, { method: 'POST' })
}
