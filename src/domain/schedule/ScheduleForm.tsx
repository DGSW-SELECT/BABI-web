import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { getDateKey, isValidScheduleDate } from './scheduleData'
import type { Schedule } from './scheduleData'

type ScheduleFormProps = {
  date: string
  onSave: (schedule: Schedule) => void
  onClose: () => void
}

export default function ScheduleForm({ date, onSave, onClose }: ScheduleFormProps) {
  const formId = useId()
  const [title, setTitle] = useState('')
  const [scheduledDate, setScheduledDate] = useState(isValidScheduleDate(date) ? date : getDateKey())
  const [time, setTime] = useState('10:30')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<{ title?: string; date?: string; time?: string; memo?: string }>({})

  function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors: typeof errors = {}
    if (!title.trim()) newErrors.title = '일정 제목을 입력해주세요.'
    else if (title.trim().length > 100) newErrors.title = '제목은 100자까지 입력할 수 있어요.'
    if (!isValidScheduleDate(scheduledDate)) newErrors.date = '올바른 날짜를 선택해주세요.'
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) newErrors.time = '올바른 시간을 선택해주세요.'
    if (memo.length > 500) newErrors.memo = '메모는 500자까지 입력할 수 있어요.'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    onSave({ id: Date.now(), title: title.trim(), date: scheduledDate, time, memo: memo.trim() })
  }

  const fieldClass = 'min-h-12 w-full min-w-0 rounded-2xl border border-[#d6d6d6] bg-white px-3 text-base outline-none placeholder:text-[#92979d] focus-visible:outline-2 focus-visible:outline-[#399fff]'

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-sm text-[#121212]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <header className="relative z-10 flex min-h-14 shrink-0 items-center justify-center bg-[#f7f8f9] px-5">
        <button type="button" onClick={onClose} aria-label="일정으로 돌아가기"
          className="absolute left-2.5 flex size-11 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-[#399fff]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m4 4 16 16M20 4 4 20" /></svg>
        </button>
        <h1 className="text-[22px] font-bold">기록 추가</h1>
      </header>
      <div data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-none px-5 pt-3 pb-5 max-[360px]:px-3" style={{ scrollPaddingBlock: 24 }}>
        <form onSubmit={saveSchedule} noValidate aria-label="일정 입력" className="space-y-5 rounded-[17px] border border-[#d6d6d6] bg-white px-5 py-5">
          <div>
            <label htmlFor={`${formId}-title`} className="mb-2 block text-sm font-bold">제목</label>
            <input id={`${formId}-title`} value={title} required maxLength={100} placeholder="예) 소아과 정기검진"
              onChange={(event) => { setTitle(event.target.value); setErrors({ ...errors, title: undefined }) }}
              aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? `${formId}-title-error` : undefined}
              className={fieldClass} />
            {errors.title && <p id={`${formId}-title-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-date`} className="mb-2 block text-sm font-bold">날짜</label>
            <input id={`${formId}-date`} type="date" value={scheduledDate} required max="9999-12-31"
              onInput={(event) => { setScheduledDate(event.currentTarget.value); setErrors({ ...errors, date: undefined }) }}
              aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? `${formId}-date-error` : undefined}
              className={`${fieldClass} cursor-pointer`} />
            {errors.date && <p id={`${formId}-date-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-time`} className="mb-2 block text-sm font-bold">시간</label>
            <input id={`${formId}-time`} type="time" value={time} required
              onInput={(event) => { setTime(event.currentTarget.value); setErrors({ ...errors, time: undefined }) }}
              aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? `${formId}-time-error` : undefined}
              className={`${fieldClass} cursor-pointer`} />
            {errors.time && <p id={`${formId}-time-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.time}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-memo`} className="mb-2 block text-sm font-bold">메모 <span className="text-[#92979d]">(선택)</span></label>
            <textarea id={`${formId}-memo`} value={memo} rows={5} maxLength={500} placeholder="메모를 입력하세요"
              onChange={(event) => { setMemo(event.target.value); setErrors({ ...errors, memo: undefined }) }}
              aria-invalid={Boolean(errors.memo)} aria-describedby={errors.memo ? `${formId}-memo-error` : undefined}
              className={`${fieldClass} min-h-[138px] resize-none py-3`} />
            {errors.memo && <p id={`${formId}-memo-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.memo}</p>}
          </div>
          <button type="submit" className="min-h-[50px] w-full cursor-pointer rounded-2xl bg-[#121212] text-base font-medium text-white hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#399fff]">추가</button>
        </form>
      </div>
    </main>
  )
}
