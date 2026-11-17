import { request } from '../../global/api/sessionClient'

export type Baby = { babyId: number; name: string; birthDate: string }
export type BabyInput = Pick<Baby, 'name' | 'birthDate'>
export type BabyMember = {
  userId: number
  nickname: string
  role: 'OWNER' | 'GUARDIAN' | 'PARENT' | 'CAREGIVER' | 'VIEWER'
}
export type BabyInvitation = { babyId: number; name: string; expiresAt: string }

export function getBabies() {
  return request<Baby[]>('/babies')
}

export function createBaby(input: BabyInput) {
  return request<Baby>('/babies', { method: 'POST', body: JSON.stringify(input) })
}

export function getBaby(babyId: number) {
  return request<Baby>(`/babies/${babyId}`)
}

export function updateBaby(babyId: number, input: Partial<BabyInput>) {
  return request<Baby>(`/babies/${babyId}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function getBabyMembers(babyId: number) {
  return request<BabyMember[]>(`/babies/${babyId}/members`)
}

export function sendBabyInvitation(babyId: number, email: string) {
  return request<BabyInvitation>(`/babies/${babyId}/invitations`, {
    method: 'POST', body: JSON.stringify({ email }),
  })
}

export function transferBabyOwnership(babyId: number, newOwnerUserId: number) {
  return request<null>(`/babies/${babyId}/members/owner`, {
    method: 'PATCH', body: JSON.stringify({ newOwnerUserId }),
  })
}

export function leaveBabyGroup(babyId: number) {
  return request<null>(`/babies/${babyId}/members/me`, { method: 'DELETE' })
}
