import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { ApiError, getCurrentUserId } from '../../global/api/sessionClient'
import { useSession } from './useSession'
import { refreshLogin } from './authApi'

export function SessionBoundary({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(() => getCurrentUserId() === null ? 'loading' : 'ready')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (getCurrentUserId() !== null) return
    let active = true
    refreshLogin().then(() => { if (active) setState('ready') }).catch((error: unknown) => {
      if (active) setState(error instanceof ApiError && (error.status === 401 || error.status === 403) ? 'ready' : 'error')
    })
    return () => { active = false }
  }, [attempt])
  if (state === 'ready') return children
  return <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col items-center justify-center gap-4 bg-[#f7f8f9] px-6 text-center text-sm">
    {state === 'loading' ? <p role="status">로그인 상태를 확인하고 있어요…</p> : <>
      <p role="alert">서버에 연결하지 못했어요. 네트워크를 확인해주세요.</p>
      <button className="rounded-xl bg-[#121212] px-5 py-3 text-white" onClick={() => { setState('loading'); setAttempt((value) => value + 1) }}>다시 시도</button>
      <button className="underline" onClick={() => setState('ready')}>로그인 화면으로</button>
    </>}
  </main>
}

export function RequireSession({ children }: { children: ReactNode }) {
  const { userId } = useSession()
  const location = useLocation()
  if (userId === null) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  return children
}
