import { useSyncExternalStore } from 'react'
import { getAccessToken, getCurrentUserId, subscribeSession } from '../../global/api/sessionClient'

export function useSession() {
  const token = useSyncExternalStore(subscribeSession, getAccessToken, () => '')
  return { token, userId: getCurrentUserId() }
}

// 외부 URL을 복귀 주소로 사용하지 않는다.
export function getReturnPath(search: string) {
  const path = new URLSearchParams(search).get('next') ?? '/voice-record'
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') && !/^\/(login|signup)(\?|$)/.test(path)
    ? path : '/voice-record'
}

