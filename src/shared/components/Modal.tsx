import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import './Modal.css'

type ModalProps = {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  icon?: ReactNode
}

export default function Modal({ title, subtitle, children, onClose, icon }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement
    dialog?.showModal()
    return () => {
      dialog?.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    if (!isClosing) return
    const timer = window.setTimeout(onClose, 220)
    return () => window.clearTimeout(timer)
  }, [isClosing, onClose])

  function requestClose() {
    if (isClosing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) onClose()
    else setIsClosing(true)
  }

  return (
    <dialog ref={dialogRef} data-closing={isClosing} aria-labelledby={titleId} aria-describedby={subtitle ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); requestClose() }}
      onAnimationEnd={(event) => { if (isClosing && event.target === event.currentTarget) onClose() }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const stops = [...event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        )].filter((element) => element.getClientRects().length > 0)
        const first = stops[0]
        const last = stops.at(-1)
        if (!first || !last) return
        const active = document.activeElement
        if (event.shiftKey && (active === first || !stops.includes(active as HTMLElement))) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && (active === last || !stops.includes(active as HTMLElement))) {
          event.preventDefault()
          first.focus()
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const box = event.currentTarget.getBoundingClientRect()
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) requestClose()
      }}
      className="babi-modal fixed inset-0 m-auto w-[calc(100%_-_32px)] max-w-[370px] overflow-hidden rounded-[28px] border-0 bg-white p-0 text-[#172027] shadow-[0_18px_70px_rgba(15,40,58,0.24)] outline-none backdrop:bg-[#172c3d]/35">
      <div className="flex max-h-[min(88dvh,760px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#f1f4f6] px-5 pt-5 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            {icon}
            <div className="min-w-0">
              <h2 id={titleId} className="text-xl leading-7 font-bold tracking-[-0.5px]">{title}</h2>
              {subtitle && <p id={descriptionId} className="mt-1 text-xs leading-5 text-[#74848e]">{subtitle}</p>}
            </div>
          </div>
          <button type="button" disabled={isClosing} onClick={requestClose} aria-label={`${title} 닫기`}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f3f6f7] text-[#68777e] transition-colors hover:bg-[#e9eef0] focus:outline-none focus-visible:bg-[#dce7ec] disabled:cursor-default">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div tabIndex={0} role="region" aria-label={`${title} 내용`} className="min-h-0 overflow-y-auto overscroll-contain px-5 pt-4 pb-5 outline-none">{children}</div>
      </div>
    </dialog>
  )
}
