import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, PointerEvent } from 'react'
import GrowthTabs from './GrowthTabs'
import { growthLabels, growthTypes } from './growthData'
import type { GrowthErrors, GrowthInput, GrowthRecord, GrowthType } from './growthData'

type GrowthFormProps = {
  onSave: (record: GrowthRecord) => void
  onClose: () => void
  isEditing?: boolean
  onFinishEditing?: () => void
}

export default function GrowthForm({ onSave, onClose, isEditing = false, onFinishEditing }: GrowthFormProps) {
  const formId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState<GrowthInput>(() => ({ date: getToday(), height: '', weight: '' }))
  const [selectedType, setSelectedType] = useState<GrowthType>('height')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<GrowthErrors>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const { name, unit } = growthLabels[selectedType]
  const warnings = getGrowthWarnings(input)

  useEffect(() => { titleRef.current?.focus() }, [])

  function saveRecord() {
    const record: GrowthRecord = { id: Date.now(), date: input.date, memo: memo.trim() }
    if (input.height.trim()) record.height = Number(input.height)
    if (input.weight.trim()) record.weight = Number(input.weight)
    onSave(record)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors = checkGrowthInput(input)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.height) setSelectedType('height')
      else if (newErrors.weight) setSelectedType('weight')
      return
    }
    if (warnings.length > 0) setShowConfirm(true)
    else saveRecord()
  }

  function changeValue(change: number) {
    setInput({ ...input, [selectedType]: changeGrowthValue(input[selectedType], change) })
    setErrors({ ...errors, [selectedType]: undefined })
  }

  function openDatePicker() {
    try { dateRef.current?.showPicker() }
    catch { dateRef.current?.focus() }
  }

  function keepKeyboardOpen(event: PointerEvent<HTMLFormElement>) {
    const field = document.activeElement
    if (!(event.target instanceof Element) || !event.target.closest('button')) return
    if (field instanceof HTMLElement && event.currentTarget.contains(field)
      && field.matches('input[type="number"], textarea')) event.preventDefault()
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-sm text-[#121212]">
      <header className="relative z-10 flex min-h-14 shrink-0 items-center justify-center bg-[#f7f8f9] px-5">
        <button type="button" onClick={onClose} aria-label="성장 기록으로 돌아가기" onPointerDown={(event) => { if (isEditing) event.preventDefault() }}
          className="absolute left-[10px] flex size-8 cursor-pointer items-center justify-center rounded-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m4 4 16 16M20 4 4 20" /></svg>
        </button>
        <h1 ref={titleRef} tabIndex={-1} className="text-[22px] font-bold outline-none">기록 추가</h1>
        {isEditing && onFinishEditing && <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={onFinishEditing}
          className="absolute right-3 min-h-8 cursor-pointer rounded-lg px-2 text-xs font-semibold text-[#256b3c]">입력 완료</button>}
      </header>
      <div data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-none px-5 pt-3 pb-6 max-[360px]:px-3" style={{ scrollPaddingBlock: 24 }}>
        <GrowthTabs />
        <form onSubmit={handleSubmit} onPointerDown={keepKeyboardOpen} noValidate aria-label="성장 기록 입력" className="rounded-[17px] border border-[#d6d6d6] bg-white px-5 py-4">
          <label htmlFor={`${formId}-date`} className="mb-1.5 block text-sm font-bold">날짜</label>
          <input ref={dateRef} id={`${formId}-date`} type="date" required value={input.date} onClick={openDatePicker}
            onChange={(event) => setInput({ ...input, date: event.target.value })} aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? `${formId}-date-error` : undefined}
            className="min-h-11 w-full min-w-0 cursor-pointer rounded-2xl border border-[#d6d6d6] bg-transparent px-3 text-base font-medium outline-none focus:outline-2 focus:outline-[#63c980]" />
          {errors.date && <p id={`${formId}-date-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.date}</p>}
          <fieldset className="mt-4">
            <legend className="mb-2.5 text-sm font-bold">측정 항목</legend>
            <div className="grid grid-cols-2 gap-4 px-[10px] max-[360px]:gap-3 max-[360px]:px-0">
              {growthTypes.map((type) => <button key={type} type="button" aria-pressed={selectedType === type} onClick={() => setSelectedType(type)}
                className={`min-h-[58px] cursor-pointer rounded-[14px] border text-base font-bold ${selectedType === type ? 'border-[#63c980] bg-[#f0f8f2]' : 'border-[#d6d6d6] bg-white'}`}>{growthLabels[type].name}</button>)}
            </div>
            <p className="mt-1.5 text-[11px] text-[#92979d]">키 또는 몸무게 중 하나만 입력해도 추가할 수 있어요.</p>
          </fieldset>
          <label htmlFor={`${formId}-value`} className="mt-[18px] mb-1.5 block text-sm font-bold">측정 값<span className="sr-only"> ({name})</span></label>
          <div className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#d6d6d6] pr-1.5 pl-3 focus-within:outline-2 focus-within:outline-[#63c980]">
            <input id={`${formId}-value`} type="number" inputMode="decimal" enterKeyHint="done" step="any" value={input[selectedType]}
              placeholder={selectedType === 'height' ? '80.0' : '10.0'} onChange={(event) => setInput({ ...input, [selectedType]: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); changeValue(event.key === 'ArrowUp' ? 1 : -1) }
              }}
              aria-invalid={Boolean(errors[selectedType])} aria-describedby={`${formId}-precision${errors[selectedType] ? ` ${formId}-value-error` : ''}`}
              className="min-w-0 flex-1 appearance-none bg-transparent text-base font-medium outline-none placeholder:text-[#92979d] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            <span aria-hidden="true" className="text-sm text-[#92979d]">{unit}</span>
            <button type="button" onClick={() => changeValue(-1)} aria-label={`${name} 1 줄이기`} className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-lg hover:bg-[#f0f8f2]">−</button>
            <button type="button" onClick={() => changeValue(1)} aria-label={`${name} 1 늘리기`} className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-lg hover:bg-[#f0f8f2]">+</button>
          </div>
          <p id={`${formId}-precision`} className="mt-1.5 text-xs text-[#92979d]">소수점 첫째 자리까지 입력해주세요.</p>
          {errors[selectedType] && <p id={`${formId}-value-error`} role="alert" className="mt-1 text-xs text-red-700">{errors[selectedType]}</p>}
          <label htmlFor={`${formId}-memo`} className="mt-[18px] mb-1.5 block text-sm font-bold">메모</label>
          <textarea id={`${formId}-memo`} value={memo} rows={2} placeholder="메모를 입력하세요" onChange={(event) => setMemo(event.target.value)}
            className="block h-16 w-full resize-none rounded-2xl border border-[#d6d6d6] px-3 py-2 text-base outline-none placeholder:text-[#92979d] focus:outline-2 focus:outline-[#63c980]" />
          <button type="submit" className="mt-4 min-h-[46px] w-full cursor-pointer rounded-[17px] bg-[#121212] text-base font-medium text-white">추가</button>
        </form>
      </div>
      {showConfirm && <ConfirmDialog warnings={warnings} onCancel={() => setShowConfirm(false)} onConfirm={saveRecord} />}
    </main>
  )
}

function ConfirmDialog({ warnings, onCancel, onConfirm }: { warnings: string[]; onCancel: () => void; onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const opener = document.activeElement
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => { dialog?.close(); if (opener instanceof HTMLElement && opener.isConnected) opener.focus() }
  }, [])
  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onCancel() }}
      className="fixed inset-0 m-auto w-[calc(100%_-_40px)] max-w-[360px] rounded-2xl border-0 bg-white p-5 text-[#121212] shadow-xl backdrop:bg-black/35">
      <h2 id={titleId} className="text-lg font-bold">입력값 확인</h2>
      <p className="mt-3 text-sm leading-relaxed">입력한 값과 단위, 소수점을 다시 확인해주세요. 확인 후 그대로 추가할 수도 있어요.</p>
      <ul className="mt-3 space-y-2 text-sm text-[#8a541d]">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
      <p className="mt-3 text-xs text-[#92979d]">이 확인은 의학적 정상 여부를 판단하는 기능이 아니에요.</p>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onCancel} className="min-h-11 flex-1 cursor-pointer rounded-xl border border-[#d6d6d6] text-sm">다시 확인</button>
        <button type="button" onClick={onConfirm} className="min-h-11 flex-1 cursor-pointer rounded-xl bg-[#121212] px-2 text-sm text-white">그대로 추가</button>
      </div>
    </dialog>
  )
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function checkGrowthInput(input: GrowthInput): GrowthErrors {
  const errors: GrowthErrors = {}
  const date = new Date(`${input.date}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(date.getTime())
    || date.toISOString().slice(0, 10) !== input.date) {
    errors.date = '올바른 측정 날짜를 선택해주세요.'
  }
  for (const type of growthTypes) {
    if (!input[type].trim()) continue
    const value = Number(input[type])
    if (!Number.isFinite(value)) errors[type] = `${growthLabels[type].name}를 숫자로 입력해주세요.`
    else if (Number(value.toFixed(1)) !== value) errors[type] = '소수점 첫째 자리까지 입력해주세요.'
  }
  if (!input.height.trim() && !input.weight.trim()) {
    errors.height = '키 또는 몸무게 중 하나 이상 입력해주세요.'
    errors.weight = errors.height
  }
  return errors
}

function changeGrowthValue(value: string, change: number) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(change)
  return String(Number((number + change).toFixed(1)))
}

function getGrowthWarnings(input: GrowthInput) {
  const warnings: string[] = []
  for (const type of growthTypes) {
    if (input[type].trim() && Number(input[type]) <= 0) {
      warnings.push(`${growthLabels[type].name} ${input[type]}${growthLabels[type].unit} — 0 이하의 값을 입력했어요.`)
    }
  }
  return warnings
}
