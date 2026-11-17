import { ApiError, clearAccessToken, getCurrentUserId, getSessionRevision, request, setAccessToken, setSessionRecovery } from '../../global/api/sessionClient'

export type LoginResult = { accessToken: string }
let loginEmail = ''
let loginUserId: number | null = null
try {
  const saved = JSON.parse(sessionStorage.getItem('babi-login-profile') ?? 'null')
  if (saved && typeof saved.email === 'string' && Number.isSafeInteger(saved.userId)) { loginEmail = saved.email; loginUserId = saved.userId }
} catch { /* 저장소가 차단되어도 로그인 가능 */ }
function rememberEmail(email: string) {
  loginEmail = email
  loginUserId = email ? getCurrentUserId() : null
  try {
    sessionStorage.removeItem('babi-login-email')
    if (email) sessionStorage.setItem('babi-login-profile', JSON.stringify({ email, userId: loginUserId }))
    else sessionStorage.removeItem('babi-login-profile')
  } catch { /* 선택 정보 */ }
}
export function getLoginEmail() { return loginUserId === getCurrentUserId() ? loginEmail : '' }
// 로그인 요청은 develop의 auth.ts를 사용하고 마이페이지 세션만 공유한다.
export function rememberLogin(accessToken: string, email: string) {
  setAccessToken(accessToken)
  rememberEmail(email.trim())
}

// 공개 백엔드 UserController/CookieCsrfFilter 계약: data.token → X-CSRF-Token.
export function getCsrf() {
  return request<{ token: string }>('/auth/csrf', { auth: false, retryAuth: false, cache: 'no-store' })
}

async function csrfHeaders(headers?: HeadersInit) {
  const result = new Headers(headers)
  const { token } = await getCsrf()
  if (!token) throw new ApiError('인증 쿠키를 확인할 수 없어요. 다시 로그인해주세요.', 401, 'UNAUTHORIZED')
  result.set('X-CSRF-Token', token)
  return result
}

let refreshPromise: Promise<LoginResult> | null = null
let endingSession = false
export function refreshLogin(headers?: HeadersInit): Promise<LoginResult> {
  if (refreshPromise) return refreshPromise
  if (endingSession) return Promise.reject(new ApiError('계정 요청을 처리하고 있어요.', 409, 'SESSION_ENDING'))
  refreshPromise = (async () => {
    const revision = getSessionRevision()
    try {
      const result = await request<LoginResult>('/auth/refresh', {
        method: 'POST', auth: false, retryAuth: false, headers: await csrfHeaders(headers),
      })
      if (getSessionRevision() !== revision) throw new ApiError('로그인 상태가 변경되었어요.', 409, 'SESSION_CHANGED')
      if (!result?.accessToken) throw new ApiError('로그인 토큰을 받지 못했어요.', 502, 'INVALID_RESPONSE')
      setAccessToken(result.accessToken, true)
      return result
    } catch (error) {
      if (getSessionRevision() === revision && error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        rememberEmail('')
        clearAccessToken()
      }
      throw error
    } finally { refreshPromise = null }
  })()
  return refreshPromise
}
setSessionRecovery(refreshLogin)

export async function logout(headers?: HeadersInit) {
  if (endingSession) throw new ApiError('이미 로그아웃 요청을 처리하고 있어요.', 409, 'SESSION_ENDING')
  endingSession = true
  try {
    if (refreshPromise) {
      try { await refreshPromise } catch (error) {
        if (!(error instanceof ApiError && (error.status === 401 || error.status === 403))) throw error
      }
    }
    let protectedHeaders: HeadersInit | undefined = headers
    try { protectedHeaders = await csrfHeaders(headers) }
    catch (error) {
      // Bearer 전용 세션에 쿠키가 없는 경우에도 로그아웃은 가능하다.
      if (!(error instanceof ApiError && error.status === 401)) throw error
    }
    const result = await request<null>('/auth/logout', { method: 'POST', headers: protectedHeaders, retryAuth: false })
    rememberEmail('')
    clearAccessToken()
    return result
  } finally { endingSession = false }
}

export async function withdrawAccount(password: string, headers?: HeadersInit) {
  if (endingSession) throw new ApiError('이미 계정 요청을 처리하고 있어요.', 409, 'SESSION_ENDING')
  // 만료된 액세스 토큰은 먼저 갱신한다. 탈퇴는 사용자 확인 후 한 번만 보낸다.
  if (refreshPromise) await refreshPromise
  const result = await request<null>('/auth/account', {
    method: 'DELETE', headers, body: JSON.stringify({ password }),
  })
  rememberEmail('')
  clearAccessToken()
  return result
}
