import { useEffect, useId, useRef, useState } from 'react'
import HandoffPage from './HandoffPage'

type HandoffDialogProps = {
  memo: string
  onSave: (memo: string) => void
  onClose: () => void
  height: number
  offsetTop: number
}

export default function HandoffDialog({ memo, onSave, onClose, height, offsetTop }: HandoffDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<'check' | 'send' | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const opener = document.activeElement
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => {
      dialog?.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog ref={dialogRef} aria-label={mode ? '육아인수인계' : undefined}
      aria-labelledby={mode ? undefined : titleId} aria-describedby={mode ? undefined : descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const box = event.currentTarget.getBoundingClientRect()
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose()
      }}
      style={mode ? { top: offsetTop, height: height || '100dvh' } : undefined}
      className={`fixed overflow-hidden border-0 bg-white p-0 text-[#121212] shadow-xl outline-none backdrop:bg-black/60 ${mode ? 'inset-x-0 m-0 mx-auto max-h-none w-full max-w-[402px] rounded-none' : 'inset-0 m-auto w-[calc(100%_-_32px)] max-w-[310px] rounded-2xl'}`}>
      {mode ? <HandoffPage key={mode} mode={mode} memo={memo} onSave={onSave} onClose={onClose} /> : <>
        <div className="relative px-5 pt-7 pb-4 text-center">
          <button type="button" onClick={onClose} aria-label="인수인계 닫기"
            className="absolute top-1 right-1 flex size-8 cursor-pointer items-center justify-center rounded-full text-lg text-[#68777e] hover:bg-[#f3f6f7] focus-visible:outline-2 focus-visible:outline-[#399fff]">×</button>
          <h2 id={titleId} className="text-lg font-semibold">인수인계 하시겠습니까?</h2>
          <p id={descriptionId} className="mt-1 text-xs leading-[18px]">오늘의 육아를 마치고<br />인수인계를 진행하시겠습니까?</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#d6d6d6] border-t border-[#d6d6d6] text-xs text-[#1689ff]">
          <button type="button" onClick={() => setMode('check')} className="min-h-11 cursor-pointer px-2 hover:bg-[#f2f7ff] focus-visible:bg-[#eaf3ff] focus-visible:outline-none">인수할 정보 확인하기</button>
          <button type="button" onClick={() => setMode('send')} className="min-h-11 cursor-pointer px-2 hover:bg-[#f2f7ff] focus-visible:bg-[#eaf3ff] focus-visible:outline-none">인계할 정보 전달하기</button>
        </div>
      </>}
    </dialog>
  )
}
