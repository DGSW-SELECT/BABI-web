export const BASE_URL = (import.meta.env.VITE_PROFILE_API_URL?.trim() || '/backend').replace(/\/+$/, '')
export type ApiErrorDetail = { field: string; reason: string }

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  error?: { code: string; details: ApiErrorDetail[] } | null
}

export class ApiError extends Error {
  status: number
  code: string
  details: ApiErrorDetail[]

  constructor(message: string, status: number, code = '', details: ApiErrorDetail[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// JWT는 메모리에만 보관한다. 새로고침 후에는 refresh API로 다시 받아야 한다.
let accessToken = ''
let sessionRevision = 0
let sessionEpoch = 0
export function getSessionRevision() { return sessionRevision }
let sessionRecovery: (() => Promise<unknown>) | null = null
const sessionListeners = new Set<() => void>()

export function getAccessToken() { return accessToken }
export function subscribeSession(listener: () => void) {
  sessionListeners.add(listener)
  return () => { sessionListeners.delete(listener) }
}
export function setSessionRecovery(recover: () => Promise<unknown>) { sessionRecovery = recover }

export function setAccessToken(token: string, refreshing = false) {
  if (!refreshing || (readUserId(accessToken) !== null && readUserId(accessToken) !== readUserId(token))) sessionEpoch += 1
  accessToken = token
  sessionRevision += 1
  sessionListeners.forEach((listener) => listener())
}

export function clearAccessToken() {
  sessionEpoch += 1
  accessToken = ''
  sessionRevision += 1
  sessionListeners.forEach((listener) => listener())
}

// 서버 JwtProvider의 sub는 userId다. 화면 표시용이며 실제 인증·권한 검증은 서버가 한다.
export function getCurrentUserId(): number | null { return readUserId(accessToken) }
function readUserId(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof payload.sub !== 'string' || !/^[1-9]\d*$/.test(payload.sub)) return null
    const id = Number(payload.sub)
    return Number.isSafeInteger(id) ? id : null
  } catch {
    return null
  }
}

type RequestOptions = RequestInit & { auth?: boolean; retryAuth?: boolean }

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retryAuth = true, ...init } = options
  const requestToken = accessToken
  const requestEpoch = sessionEpoch
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth && accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  if (!auth) headers.delete('Authorization')

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new ApiError('서버에 연결할 수 없어요. 네트워크와 API 서버 주소를 확인해주세요.', 0, 'NETWORK_ERROR')
  }

  if (auth && requestEpoch !== sessionEpoch) throw new ApiError('로그인 상태가 변경되어 이전 요청을 중단했어요.', 409, 'SESSION_CHANGED')
  if (response.status === 401 && auth && requestToken && sessionRecovery && retryAuth) {
    if (accessToken === requestToken) await sessionRecovery()
    if (requestEpoch !== sessionEpoch) throw new ApiError('로그인 상태가 변경되어 이전 요청을 중단했어요.', 409, 'SESSION_CHANGED')
    if (init.signal?.aborted) throw new DOMException('요청을 취소했어요.', 'AbortError')
    if (!accessToken) throw new ApiError('로그인이 만료되었어요. 다시 로그인해주세요.', 401, 'UNAUTHORIZED')
    // 직접 전달한 이전 Bearer도 새 토큰으로 교체한다.
    const retryHeaders = new Headers(init.headers)
    retryHeaders.delete('Authorization')
    return request<T>(path, { ...init, headers: retryHeaders, auth, retryAuth: false })
  }
  if (response.status === 401 && auth && !retryAuth && requestToken === accessToken) clearAccessToken()
  if (response.status === 204) return undefined as T
  if (!response.headers.get('Content-Type')?.toLowerCase().includes('json')) {
    throw new ApiError('API 서버의 JSON 응답을 받지 못했어요. 서버 주소와 프록시 설정을 확인해주세요.', response.status, 'INVALID_RESPONSE')
  }

  let body: ApiResponse<T> & { code?: string }
  try {
    body = await response.json()
  } catch {
    throw new ApiError('API 응답을 읽을 수 없어요.', response.status, 'INVALID_RESPONSE')
  }
  if (!body || typeof body !== 'object') {
    throw new ApiError('API 응답 형식이 올바르지 않아요.', response.status, 'INVALID_RESPONSE')
  }
  if (!response.ok || body.success === false) {
    throw new ApiError(
      body.message || `요청에 실패했어요. (${response.status})`,
      response.status,
      body.error?.code || body.code,
      body.error?.details,
    )
  }
  if (body.success !== true || !('data' in body)) {
    throw new ApiError('API 공통 응답 형식을 확인해주세요.', response.status, 'INVALID_RESPONSE')
  }
  return body.data
}
