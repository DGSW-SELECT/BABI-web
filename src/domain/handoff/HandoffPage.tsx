import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../global/api/sessionClient'
import { createBriefing, getLatestBriefing } from './api'

type HandoffPageProps = {
  mode: 'check' | 'send'
  babyId?: number
  onClose: () => void
}

type BriefingState =
  | { kind: 'idle' | 'loading' | 'empty' }
  | { kind: 'ready'; date: string; summary: string }
  | { kind: 'error'; message: string }

export default function HandoffPage({ mode, babyId, onClose }: HandoffPageProps) {
  const isChecking = mode === 'check'
  const titleRef = useRef<HTMLHeadingElement>(null)
  const creating = useRef(false)
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState<BriefingState>({ kind: isChecking && babyId ? 'loading' : 'idle' })

  useEffect(() => { titleRef.current?.focus() }, [])
  useEffect(() => {
    if (!isChecking || babyId === undefined) return
    const controller = new AbortController()
    getLatestBriefing(babyId, controller.signal).then((briefing) => {
      if (controller.signal.aborted) return
      setState(briefing?.summary?.trim()
        ? { kind: 'ready', date: briefing.briefingDate, summary: briefing.summary }
        : { kind: 'empty' })
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      setState(error instanceof ApiError && error.status === 404
        ? { kind: 'empty' }
        : { kind: 'error', message: error instanceof Error ? error.message : '브리핑을 불러오지 못했어요.' })
    })
    return () => controller.abort()
  }, [babyId, isChecking, retry])

  async function generateBriefing() {
    if (babyId === undefined || creating.current || state.kind === 'ready') return
    creating.current = true
    setState({ kind: 'loading' })
    try {
      const briefing = await createBriefing(babyId)
      if (!briefing?.summary?.trim()) throw new Error('서버에서 브리핑 내용을 받지 못했어요.')
      setState({ kind: 'ready', date: briefing.briefingDate, summary: briefing.summary })
    } catch (error) {
      setState({ kind: 'error', message: error instanceof Error ? error.message : '브리핑을 생성하지 못했어요.' })
    } finally {
      creating.current = false
    }
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-[#121212]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <header className="relative flex min-h-14 shrink-0 items-center justify-center px-5">
        <button type="button" onClick={onClose} aria-label="인수인계 닫기"
          className="absolute left-5 flex size-9 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-[#8d8aff]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m4 4 16 16M20 4 4 20" /></svg>
        </button>
        <h1 ref={titleRef} tabIndex={-1} className="text-[22px] font-medium outline-none">육아인수인계</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-5">
        <section className="rounded-xl bg-[#eceefa] p-4" aria-live="polite" aria-busy={state.kind === 'loading'}>
          <h2 className="mb-3 text-sm font-medium text-[#625bd1]">{isChecking ? '최신 인수인계 브리핑' : '인계할 브리핑'}</h2>
          {babyId === undefined && <p>로그인한 뒤 아기를 선택해주세요.</p>}
          {babyId !== undefined && state.kind === 'idle' && <p>돌봄 기록을 바탕으로 다음 보호자에게 전달할 브리핑을 만들 수 있어요.</p>}
          {state.kind === 'loading' && <p>{isChecking ? '브리핑을 불러오는 중이에요.' : '브리핑을 만드는 중이에요.'}</p>}
          {state.kind === 'empty' && <p>아직 전달된 브리핑이 없어요.</p>}
          {state.kind === 'error' && <p role="alert">{state.message}</p>}
          {state.kind === 'ready' && <div className="rounded-xl bg-white p-4">
            <p className="mb-2 text-xs text-[#68727b]">{state.date}</p>
            <p className="text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{state.summary}</p>
          </div>}
        </section>
      </div>
      <div className="shrink-0 px-6 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        {isChecking && state.kind === 'error' && <button type="button" onClick={() => {
          setState({ kind: 'loading' })
          setRetry((count) => count + 1)
        }} className="mb-2 min-h-11 w-full rounded-xl border">다시 불러오기</button>}
        {!isChecking && babyId !== undefined && state.kind !== 'ready' &&
          <button type="button" onClick={generateBriefing} disabled={state.kind === 'loading'}
            className="mb-2 min-h-[54px] w-full rounded-xl bg-[#121212] text-sm text-white disabled:opacity-50">브리핑 생성하기</button>}
        <button type="button" onClick={onClose} className="min-h-11 w-full rounded-xl border text-sm">닫기</button>
      </div>
    </main>
  )
}
