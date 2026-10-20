import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import Modal from '../../../shared/components/Modal'
import './Header.css'

export type HeaderBaby = {
  babyId: number
  name: string
  birthDate?: string | null
  photoUrl?: string | null
}

export type HeaderNotification = {
  id: string
  title: string
  body: string
  timeLabel: string
  isRead: boolean
}

function BabyIcon() {
  return <svg width="26" height="26" viewBox="0 0 28 28" fill="white" aria-hidden="true">
    <path d="M14 5c-1-2 1-4 3-4-1 2-1 3 0 4a8 8 0 0 1 4 9c2 0 2 4 0 4-1 3-4 5-7 5s-6-2-7-5c-2 0-2-4 0-4a8 8 0 0 1 7-9Zm-7 18h14l2 4H5Z" />
  </svg>
}

function HeaderAction({ label, children, onClick, unread = false }: {
  label: string; children: ReactNode; onClick?: () => void; unread?: boolean
}) {
  return <button type="button" disabled={!onClick} onClick={onClick} aria-label={onClick ? label : `${label} (연결 전)`} aria-haspopup={label === '메시지' ? undefined : 'dialog'}
    className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#a5b2b7] text-white enabled:cursor-pointer enabled:hover:bg-[#8c9fa7] focus:outline-none focus-visible:bg-[#718e9b]">
    {children}{unread && <span aria-hidden="true" className="absolute top-0 right-0 size-2 rounded-full border border-[#f7f8f9] bg-[#399fff]" />}
  </button>
}

type HeaderProps = {
  baby: HeaderBaby
  babies?: HeaderBaby[]
  notifications?: HeaderNotification[]
  onBabyChange?: (babyId: number) => void
  onMessages?: () => void
}

export default function Header({ baby, babies = [baby], notifications = [], onBabyChange, onMessages }: HeaderProps) {
  const [panel, setPanel] = useState<'notifications' | 'baby' | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const hasUnread = notifications.some((item) => !item.isRead && !readIds.has(item.id))

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-3 px-8 pt-9 [@media(max-height:760px)]:pt-6 max-[360px]:px-5">
        <BabySwitcher baby={baby} babies={babies} onBabyChange={onBabyChange} avatar={<BabyIcon />} />
        <div className="flex shrink-0 gap-[7px] max-[360px]:gap-1">
          <HeaderAction label="메시지" onClick={onMessages}><svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11s4.5 8 10 8h3l5 3v-6c1.3-1.4 2-3.2 2-5 0-4.4-4.5-8-10-8Z" /><g fill="#a5b2b7"><circle cx="7" cy="11" r="1" /><circle cx="12" cy="11" r="1" /><circle cx="17" cy="11" r="1" /></g></svg></HeaderAction>
          <HeaderAction label="알림" unread={hasUnread} onClick={() => setPanel('notifications')}><svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M5 16V9a7 7 0 0 1 14 0v7l2 3H3ZM9 20h6a3 3 0 0 1-6 0Z" /></svg></HeaderAction>
          <HeaderAction label="아기 정보" onClick={() => setPanel('baby')}><BabyIcon /></HeaderAction>
        </div>
      </header>
      {panel === 'notifications' && <NotificationsPanel notifications={notifications} readIds={readIds}
        onReadAll={() => setReadIds(new Set(notifications.map((item) => item.id)))}
        onRead={(id) => setReadIds((previous) => new Set([...previous, id]))} onClose={() => setPanel(null)} />}
      {panel === 'baby' && <BabyInfoPanel key={`${baby.babyId}-${baby.photoUrl}`} baby={baby} onClose={() => setPanel(null)} />}
    </>
  )
}

type BabySwitcherProps = {
  baby: HeaderBaby
  babies: HeaderBaby[]
  avatar: ReactNode
  onBabyChange?: (babyId: number) => void
}

function BabySwitcher({ baby, babies, avatar, onBabyChange }: BabySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const options = babies.length ? babies : [baby]

  useEffect(() => {
    if (!isOpen) return
    listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex]?.focus()
  }, [isOpen, activeIndex])

  useEffect(() => {
    if (!isOpen) return
    function onOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', onOutsidePress)
    return () => document.removeEventListener('pointerdown', onOutsidePress)
  }, [isOpen])

  function close(restoreFocus = true) {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function open(last = false) {
    const selectedIndex = options.findIndex((item) => item.babyId === baby.babyId)
    let nextIndex = Math.max(0, selectedIndex)
    if (last) nextIndex = options.length - 1
    setActiveIndex(nextIndex)
    setIsOpen(true)
  }

  function choose(item: HeaderBaby) {
    onBabyChange?.(item.babyId)
    close()
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      close()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(options[activeIndex] ?? options[0])
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    let nextIndex = activeIndex
    if (event.key === 'ArrowDown') nextIndex += 1
    if (event.key === 'ArrowUp') nextIndex -= 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = options.length - 1
    setActiveIndex(Math.max(0, Math.min(options.length - 1, nextIndex)))
  }

  return (
    <div ref={rootRef} className="relative z-30 w-[150px] min-w-0 max-w-[48%]">
      <button ref={triggerRef} type="button" aria-label="아기 선택" aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={listId}
        onClick={() => { if (isOpen) close(); else open() }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(event.key === 'ArrowUp') }
          if (event.key === 'Escape') close()
        }}
        className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-[16px] border-0 bg-white pr-3 pl-[10px] text-left outline-none transition-colors hover:bg-[#fbfcfd] focus:outline-none focus-visible:bg-[#f0f4f6] [-webkit-tap-highlight-color:transparent]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#a5b2b7]">{avatar}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-[#514949]">{baby.name}</span>
        <svg className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#222" strokeWidth="1.8" aria-hidden="true"><path d="m3 7 7 7 7-7" /></svg>
      </button>
      <div ref={listRef} id={listId} role="listbox" aria-label="아기 목록" aria-hidden={!isOpen} inert={!isOpen} data-open={isOpen}
        onKeyDown={handleListKeyDown}
        className="babi-baby-menu absolute top-[calc(100%_+_10px)] left-0 z-50 max-h-56 w-52 max-w-[calc(100vw_-_40px)] overflow-y-auto rounded-[20px] border border-[#e7edf1] bg-white p-2 shadow-[0_12px_36px_rgba(42,71,92,0.14)]">
        {options.map((item, index) => <button key={item.babyId} type="button" role="option" aria-selected={baby.babyId === item.babyId}
          tabIndex={isOpen && index === activeIndex ? 0 : -1} onClick={() => choose(item)}
          className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-left text-sm text-[#435660] transition-colors hover:bg-[#f1f7fb] focus:bg-[#edf6fd] focus:outline-none">
          <span className="truncate">{item.name}</span>
          {baby.babyId === item.babyId && <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#399fff" strokeWidth="2" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg>}
        </button>)}
      </div>
    </div>
  )
}

function NotificationsPanel({ notifications, readIds, onReadAll, onRead, onClose }: {
  notifications: HeaderNotification[]
  readIds: ReadonlySet<string>
  onReadAll: () => void
  onRead: (id: string) => void
  onClose: () => void
}) {
  const unread = notifications.filter((item) => !item.isRead && !readIds.has(item.id)).length
  return (
    <Modal title="알림" subtitle="받은 알림을 확인해보세요." onClose={onClose}>
      <div className="mb-3 flex items-center justify-between text-xs">
        <p className="text-[#7d8d95]">읽지 않은 알림 <span className="font-semibold text-[#399fff]">{unread}개</span></p>
        <button type="button" disabled={unread === 0} onClick={onReadAll} className="min-h-9 cursor-pointer rounded-lg px-2 text-[#399fff] hover:bg-[#f0f7ff] focus:outline-none focus-visible:bg-[#e4f0fa] disabled:cursor-default disabled:text-[#a6b0b5]">모두 읽음</button>
      </div>
      {notifications.length === 0 ? <p className="py-10 text-center text-sm text-[#87969d]">아직 받은 알림이 없어요.</p> :
        <ul className="space-y-3">
          {notifications.map((item) => {
            const isRead = item.isRead || readIds.has(item.id)
            return <li key={item.id}>
              <button type="button" onClick={() => onRead(item.id)} aria-label={`${item.title}${isRead ? ' (읽음)' : ' (읽지 않음)'}`}
                className={`w-full cursor-pointer rounded-2xl border p-4 text-left focus:outline-none focus-visible:bg-[#eef5fa] ${isRead ? 'border-[#edf0f2] bg-[#fafbfc]' : 'border-[#d9eafa] bg-[#f4f9ff]'}`}>
                <span className="flex items-start gap-2 text-sm leading-6 font-semibold">
                  {!isRead && <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[#399fff]" />}{item.title}
                </span>
                <span className="mt-2 block text-xs leading-6 whitespace-pre-wrap wrap-anywhere text-[#72828b]">{item.body}</span>
                <span className="mt-3 block text-[11px] text-[#a0abb1]">{item.timeLabel}</span>
              </button>
            </li>
          })}
        </ul>}
    </Modal>
  )
}

function getBabyAge(birthDate?: string | null, today = new Date()) {
  if (!birthDate) return '출생일 등록 후 표시돼요'
  const [year, month, day] = birthDate.split('-').map(Number)
  const birthday = new Date(year, month - 1, day)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || birthday.getFullYear() !== year
    || birthday.getMonth() !== month - 1 || birthday.getDate() !== day || birthday > today) {
    return '출생일을 확인해주세요'
  }
  let months = (today.getFullYear() - year) * 12 + today.getMonth() - (month - 1)
  // 말일에 태어난 아기는 해당 월의 마지막 날을 기준으로 개월수를 계산합니다.
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  if (today.getDate() < Math.min(day, monthEnd)) months -= 1
  return `생후 ${months}개월`
}

function BabyInfoPanel({ baby, onClose }: { baby: HeaderBaby; onClose: () => void }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const age = getBabyAge(baby.birthDate)
  const items = [
    { label: '이름', value: baby.name },
    { label: '출생일', value: baby.birthDate?.replaceAll('-', '. ') || '등록된 출생일이 없어요' },
    { label: '개월수', value: age },
  ]
  return (
    <Modal title="아기 정보" subtitle="현재 선택한 아기의 정보를 확인해요." onClose={onClose}>
      <div className="mb-4 flex flex-col items-center rounded-[22px] bg-[#eef6fc] px-4 py-5">
        {baby.photoUrl && !photoFailed ? (
          <img src={baby.photoUrl} alt={`${baby.name} 사진`} onError={() => setPhotoFailed(true)} className="size-24 rounded-full border-4 border-white object-cover" />
        ) : (
          <div className="flex size-24 flex-col items-center justify-center gap-1 rounded-full border-4 border-white bg-[#dceaf2] text-[#728e9e]">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true"><path d="M14 5c-1-2 1-4 3-4-1 2-1 3 0 4a8 8 0 0 1 4 9c2 0 2 4 0 4-1 3-4 5-7 5s-6-2-7-5c-2 0-2-4 0-4a8 8 0 0 1 7-9Zm-7 18h14l2 4H5Z" /></svg>
            <span className="text-[10px]">{photoFailed ? '사진을 불러올 수 없어요' : '등록된 사진 없음'}</span>
          </div>
        )}
        <h3 className="mt-3 text-lg font-bold wrap-anywhere text-[#334f60]">{baby.name}</h3>
        <p className="mt-1 text-xs text-[#4c839e]">{age}</p>
      </div>
      <dl className="divide-y divide-[#edf0f2]">
        {items.map((item) => <div key={item.label} className="flex items-start justify-between gap-4 py-3.5 text-sm">
          <dt className="shrink-0 text-[#8c989f]">{item.label}</dt><dd className="text-right wrap-anywhere text-[#394951]">{item.value}</dd>
        </div>)}
      </dl>
    </Modal>
  )
}
