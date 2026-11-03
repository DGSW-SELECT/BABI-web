import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { getToday, isValidDate, vaccineOptions } from './vaccinationData'
import type { VaccinationSchedule } from './vaccinationData'

type VaccinationFormProps = {
  schedules: VaccinationSchedule[]
  schedule?: VaccinationSchedule
  onSave: (schedule: VaccinationSchedule) => void
  onClose: () => void
}

export default function VaccinationForm({ schedules, schedule, onSave, onClose }: VaccinationFormProps) {
  const formId = useId()
  const [vaccineId, setVaccineId] = useState(schedule ? String(schedule.vaccineId) : '')
  const [doseNumber, setDoseNumber] = useState(schedule ? String(schedule.doseNumber) : '')
  const [scheduledDate, setScheduledDate] = useState(schedule?.scheduledDate || getToday())
  const [completedDate, setCompletedDate] = useState(schedule?.completedDate || getToday())
  const [institution, setInstitution] = useState(schedule?.institution || '')
  const [memo, setMemo] = useState(schedule?.memo || '')
  const [errors, setErrors] = useState<{ vaccine?: string; dose?: string; date?: string; completedDate?: string }>({})
  const vaccine = vaccineOptions.find((item) => item.vaccineId === Number(vaccineId))

  function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors: typeof errors = {}
    if (!vaccine) newErrors.vaccine = '접종할 백신을 선택해주세요.'
    if (!doseNumber || !vaccine?.doses.includes(Number(doseNumber))) newErrors.dose = '접종 차수를 선택해주세요.'
    if (!isValidDate(scheduledDate)) newErrors.date = '올바른 접종 예정일을 선택해주세요.'
    if (schedule?.completed && (!isValidDate(completedDate) || completedDate > getToday())) {
      newErrors.completedDate = '접종 완료일은 오늘 또는 이전 날짜로 선택해주세요.'
    }
    if (schedules.some((item) => item.vaccinationScheduleId !== schedule?.vaccinationScheduleId
      && item.vaccineId === Number(vaccineId) && item.doseNumber === Number(doseNumber))) {
      newErrors.dose = '이미 등록된 백신과 차수예요. 기존 일정을 확인해주세요.'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0 || !vaccine) return
    onSave({
      vaccinationScheduleId: schedule?.vaccinationScheduleId ?? Math.max(0, ...schedules.map((item) => item.vaccinationScheduleId)) + 1,
      babyId: schedule?.babyId ?? 1,
      vaccineId: vaccine.vaccineId, vaccineName: vaccine.vaccineName, doseNumber: Number(doseNumber),
      recommendedStartMonth: schedule && schedule.vaccineId === vaccine.vaccineId ? schedule.recommendedStartMonth : null,
      recommendedEndMonth: schedule && schedule.vaccineId === vaccine.vaccineId ? schedule.recommendedEndMonth : null,
      scheduledDate, completedDate: schedule?.completed ? completedDate : schedule?.completedDate ?? null,
      completed: schedule?.completed ?? false,
      institution: institution.trim(), memo: memo.trim(),
    })
  }

  const fieldClass = 'min-h-12 w-full min-w-0 rounded-2xl border border-[#d6d6d6] bg-white px-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-[#aa83ff]'

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-sm text-[#121212]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <header className="relative z-10 flex min-h-14 shrink-0 items-center justify-center bg-[#f7f8f9] px-5">
        <button type="button" onClick={onClose} aria-label="예방접종 일정으로 돌아가기"
          className="absolute left-2.5 flex size-11 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-[#aa83ff]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m4 4 16 16M20 4 4 20" /></svg>
        </button>
        <h1 className="text-[22px] font-bold">{schedule ? '접종 일정 수정' : '기록 추가'}</h1>
      </header>
      <div data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-none px-5 pt-3 pb-5 max-[360px]:px-3" style={{ scrollPaddingBlock: 24 }}>
        <form onSubmit={saveSchedule} noValidate className="space-y-4 rounded-[17px] border border-[#d6d6d6] bg-white px-5 py-5" aria-label="예방접종 일정 입력">
          <div>
            <label htmlFor={`${formId}-vaccine`} className="mb-2 block text-sm font-bold">접종 백신</label>
            <div className="relative">
              <select id={`${formId}-vaccine`} value={vaccineId} required aria-invalid={Boolean(errors.vaccine)}
                aria-describedby={errors.vaccine ? `${formId}-vaccine-error` : undefined}
                onChange={(event) => { setVaccineId(event.target.value); setDoseNumber(''); setErrors({}) }}
                className={`${fieldClass} block cursor-pointer appearance-none pr-10 ${vaccineId ? '' : 'text-[#92979d]'}`}>
                <option value="" disabled>백신을 선택해주세요</option>
                {vaccineOptions.map((item) => <option key={item.vaccineId} value={item.vaccineId}>{item.vaccineName}</option>)}
              </select>
              <SelectArrow />
            </div>
            {errors.vaccine && <p id={`${formId}-vaccine-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.vaccine}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-dose`} className="mb-2 block text-sm font-bold">접종 차수</label>
            <div className="relative">
              <select id={`${formId}-dose`} value={doseNumber} required disabled={!vaccine} aria-invalid={Boolean(errors.dose)}
                aria-describedby={errors.dose ? `${formId}-dose-error` : undefined}
                onChange={(event) => { setDoseNumber(event.target.value); setErrors({}) }}
                className={`${fieldClass} block cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-[#fafafa] ${doseNumber ? '' : 'text-[#92979d]'}`}>
                <option value="" disabled>차수를 선택해주세요</option>
                {vaccine?.doses.map((dose) => <option key={dose} value={dose}>{dose}차</option>)}
              </select>
              <SelectArrow />
            </div>
            {errors.dose && <p id={`${formId}-dose-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.dose}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-date`} className="mb-2 block text-sm font-bold">접종 예정일</label>
            <input id={`${formId}-date`} type="date" value={scheduledDate} required
              onInput={(event) => { setScheduledDate(event.currentTarget.value); setErrors({ ...errors, date: undefined }) }}
              aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? `${formId}-date-error` : undefined}
              className={`${fieldClass} cursor-pointer`} />
            {errors.date && <p id={`${formId}-date-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.date}</p>}
          </div>
          {schedule?.completed && <div>
            <label htmlFor={`${formId}-completed-date`} className="mb-2 block text-sm font-bold">접종 완료일</label>
            <input id={`${formId}-completed-date`} type="date" value={completedDate} required max={getToday()}
              onInput={(event) => { setCompletedDate(event.currentTarget.value); setErrors({ ...errors, completedDate: undefined }) }}
              aria-invalid={Boolean(errors.completedDate)} aria-describedby={errors.completedDate ? `${formId}-completed-date-error` : undefined}
              className={`${fieldClass} cursor-pointer`} />
            {errors.completedDate && <p id={`${formId}-completed-date-error`} role="alert" className="mt-1 text-xs text-red-700">{errors.completedDate}</p>}
          </div>}
          <div>
            <label htmlFor={`${formId}-institution`} className="mb-2 block text-sm font-bold">접종 기관 <span className="text-[#92979d]">(선택)</span></label>
            <input id={`${formId}-institution`} value={institution} maxLength={255}
              onChange={(event) => setInstitution(event.target.value)} placeholder="병원이나 보건소 이름을 입력해주세요"
              className={`${fieldClass} placeholder:text-[#92979d]`} />
          </div>
          <div>
            <label htmlFor={`${formId}-memo`} className="mb-2 block text-sm font-bold">메모 <span className="text-[#92979d]">(선택)</span></label>
            <textarea id={`${formId}-memo`} value={memo} rows={1} maxLength={255} onChange={(event) => setMemo(event.target.value)}
              placeholder="메모를 입력하세요" className={`${fieldClass} resize-none py-3 placeholder:text-[#92979d]`} />
          </div>
          <button type="submit" className="min-h-[50px] w-full cursor-pointer rounded-2xl bg-[#121212] text-base font-medium text-white hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa83ff]">{schedule ? '수정 저장' : '추가'}</button>
        </form>
      </div>
    </main>
  )
}

function SelectArrow() {
  return (
    <svg className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#92979d]"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
