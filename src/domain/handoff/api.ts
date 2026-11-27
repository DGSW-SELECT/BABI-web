import { request } from '../../global/api/sessionClient'

type Briefing = { briefingDate: string; summary: string }

export function getLatestBriefing(babyId: number, signal: AbortSignal) {
  return request<Briefing>(`/babi/api/babies/${babyId}/handover-briefings/latest`, { signal })
}

export function createBriefing(babyId: number) {
  return request<Briefing>(`/babi/api/babies/${babyId}/handover-briefings`, { method: 'POST' })
}

type HandoverMemo = { content: string; createdAt: string }

export function getLatestMemo(babyId: number, signal: AbortSignal) {
  return request<HandoverMemo | null>(`/babi/api/babies/${babyId}/handover-memos/latest`, { signal })
}

export function createMemo(babyId: number, content: string) {
  return request<HandoverMemo>(`/babi/api/babies/${babyId}/handover-memos`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}
