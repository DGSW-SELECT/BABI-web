import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { handoffBriefing, handoffCheckMessages, handoffRecords } from './handoffData'
import type { HandoffMessage } from './handoffData'

type HandoffPageProps = {
  mode: 'check' | 'send'
  memo: string
  onSave: (memo: string) => void
  onClose: () => void
}

export default function HandoffPage({ mode, memo, onSave, onClose }: HandoffPageProps) {
  const isChecking = mode === 'check'
  const titleRef = useRef<HTMLHeadingElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [note, setNote] = useState(memo)
  const [messages, setMessages] = useState<HandoffMessage[]>(() => isChecking ? handoffCheckMessages : [
    { sender: 'babi', texts: ['오늘 남겨진 돌봄 내용을 정리해서 전달드릴게요.'] },
    { sender: 'babi', texts: handoffBriefing },
  ])
  const initialMessageCount = useRef(messages.length)

  useEffect(() => { titleRef.current?.focus() }, [])
  useEffect(() => {
    if (messages.length <= initialMessageCount.current) return
    const chat = chatRef.current
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text) return
    setMessages((previous) => [...previous,
      { sender: 'me', texts: [text] },
      { sender: 'babi', texts: [isChecking
        ? '추가 메모에 반영했어요. 내용을 확인한 뒤 저장해주세요.'
        : 'AI 답변은 아직 연결 전이에요. 지금은 아래 돌봄 요약과 전달 메모를 확인할 수 있어요.'] },
    ])
    if (isChecking) setNote((previous) => previous ? `${previous}\n${text}` : text)
    setInput('')
  }

  function saveBriefing() {
    onSave([note.trim(), input.trim()].filter(Boolean).join('\n'))
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
      <div ref={chatRef} data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 pb-5 max-[360px]:px-4">
        <div role="log" aria-label="인수인계 대화" aria-live="polite" aria-relevant="additions" className="space-y-5">
          {messages.map((message, index) => <ChatMessage key={index} message={message} />)}
        </div>
        <section aria-label={isChecking ? '다음 보호자에게 남길 내용' : '전달받은 돌봄 요약'} className="mt-6 rounded-xl bg-[#eceefa] p-3">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-medium text-[#625bd1]">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d9d4ff] text-[#292449]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h6" /></svg>
            </span>
            {isChecking ? '다음 보호자님이 확인할 내용' : '보호자님이 확인할 내용'}
          </h2>
          {isChecking ? <div className="rounded-xl bg-white px-4 py-3 text-xs leading-5 whitespace-pre-wrap wrap-anywhere">
            <p>{handoffBriefing.join('\n')}</p>
            {note && <p className="mt-3">{note}</p>}
          </div> : <>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-2">
              {handoffRecords.map((record) => <article key={record.type} className={`min-w-0 rounded-xl border p-2 ${recordStyles[record.type]}`}>
                <h3 className="flex flex-wrap items-center gap-1 text-[11px] font-medium">
                  <CareIcon type={record.type} /><span>{record.name}</span><span>{record.value}</span>
                </h3>
                <p className="mt-2 text-[11px] leading-4 text-[#68727b]">{record.description}</p>
                <p className="mt-1 text-[10px] leading-4 text-[#68727b]">{record.detail}</p>
              </article>)}
            </div>
            {memo && <div className="mt-3 rounded-xl bg-white px-3 py-3 text-xs leading-5 whitespace-pre-wrap wrap-anywhere"><h3 className="mb-1 font-semibold">전달 메모</h3>{memo}</div>}
          </>}
        </section>
      </div>
      <div className="shrink-0 border-t border-[#e5e7eb] px-6 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] max-[360px]:px-4">
        <form onSubmit={sendMessage} className="flex min-h-14 items-center gap-2 rounded-xl border border-[#b9b7ff] bg-[#eef0fb] py-1 pl-4 pr-1 focus-within:outline-2 focus-within:outline-[#8d8aff]">
          <textarea value={input} rows={1} aria-label={isChecking ? '추가할 내용' : '인수인계 질문'}
            placeholder={isChecking ? '추가할 내용을 입력해보세요' : '무엇이든 물어보세요'} enterKeyHint="send"
            onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }} className="min-w-0 flex-1 resize-none bg-transparent py-2 text-base leading-6 outline-none placeholder:text-sm placeholder:text-[#92979d]" />
          <button type="submit" disabled={!input.trim()} aria-label="메시지 보내기" onPointerDown={(event) => event.preventDefault()}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#121212] hover:bg-[#e0e3fa] focus-visible:outline-2 focus-visible:outline-[#8d8aff] disabled:cursor-default disabled:text-[#a5aab5]">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 18-7-7 18-3-8-8-3ZM11 13 21 3" /></svg>
          </button>
        </form>
        <button type="button" onClick={isChecking ? saveBriefing : onClose}
          className="mt-2 min-h-[54px] w-full cursor-pointer rounded-xl bg-[#121212] text-sm text-white hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d8aff]">{isChecking ? '저장하기' : '닫기'}</button>
      </div>
    </main>
  )
}

function ChatMessage({ message }: { message: HandoffMessage }) {
  const isBabi = message.sender === 'babi'
  return (
    <div className={`flex items-start gap-3 ${isBabi ? '' : 'justify-end'}`}>
      {isBabi && <span aria-hidden="true" className="relative size-[42px] shrink-0 overflow-hidden rounded-full border border-[#399fff] bg-[#e5f2ff]">
        <img src="/ai-report-mascot.svg" alt="" width="64" height="70" className="absolute -top-1 left-1/2 w-16 max-w-none -translate-x-1/2" />
      </span>}
      <div className={`flex min-w-0 flex-col gap-2 ${isBabi ? 'max-w-[80%] items-start' : 'max-w-[85%] items-end'}`}>
        <p className="px-1 text-[11px]">{isBabi ? 'babi' : '나'}</p>
        {message.texts.map((text, index) => <p key={index} className={`rounded-xl px-3 py-2 text-xs leading-[18px] whitespace-pre-wrap wrap-anywhere ${isBabi ? 'bg-[#eae5ff] text-[#6258c8]' : 'bg-[#dff0ff] text-[#20252a]'}`}>{text}</p>)}
      </div>
    </div>
  )
}

const recordStyles = {
  sleep: 'border-[#b8a3ff] bg-[#f7f3ff] text-[#8b6ed2]',
  feeding: 'border-[#8fc8ff] bg-[#f0f7ff] text-[#3c92d6]',
  temperature: 'border-[#8dd5a1] bg-[#f0f9f3] text-[#429c60]',
  crying: 'border-[#ffc2ac] bg-[#fff5f0] text-[#d68c6d]',
}

function CareIcon({ type }: { type: keyof typeof recordStyles }) {
  return (
    <svg width="20" height="20" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === 'sleep' && <path d="M18 3A15 15 0 1 0 33 19 12 12 0 0 1 18 3Z" />}
      {type === 'feeding' && <g transform="rotate(43 18 18)"><path d="M15 8V5a3 3 0 0 1 6 0v3M13 8h10v5H13zM13 13h10l2 3v14a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3V16zM11 21h5M11 27h5" /></g>}
      {type === 'temperature' && <><path d="M13 7a5 5 0 0 1 10 0v12a10 10 0 1 1-10 0ZM18 10v13" /><circle cx="18" cy="27" r="5" /></>}
      {type === 'crying' && <><circle cx="18" cy="18" r="15" /><path d="M9 16v4M14 11v14M19 14v8M24 10v16M29 15v6" /></>}
    </svg>
  )
}
