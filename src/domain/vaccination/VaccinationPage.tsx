import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import CalendarTabs from '../../global/navigation/CalendarTabs'
import Modal from '../../shared/components/Modal'
import { formatVaccinationDate, getDayLabel, getRecommendedPeriod, getToday, getVaccinationTitle, isValidDate } from './vaccinationData'
import type { VaccinationSchedule } from './vaccinationData'

type VaccinationPageProps = {
  schedules: VaccinationSchedule[]
  onChangeStatus: (id: number, completedDate: string | null) => void
}

export default function VaccinationPage({ schedules, onChangeStatus }: VaccinationPageProps) {
  const navigate = useNavigate()
  const [today, setToday] = useState(getToday)
  useEffect(() => {
    function updateToday() { setToday(getToday()) }
    const timer = window.setInterval(updateToday, 60000)
    window.addEventListener('focus', updateToday)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', updateToday) }
  }, [])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selectedSchedule = schedules.find((item) => item.vaccinationScheduleId === selectedId)
  const completed = schedules.filter((item) => item.completed)
    .sort((first, second) => (second.completedDate ?? '').localeCompare(first.completedDate ?? ''))
  const pending = schedules.filter((item) => !item.completed)
    .sort((first, second) => first.scheduledDate.localeCompare(second.scheduledDate))
  const nextSchedule = pending.find((item) => item.scheduledDate >= today)

  return (
    <main className="calendar-tab-page flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-sm text-[#121212]">
      <div className="page-title-header" aria-hidden="true" />
      <div data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-none px-5 pt-3 pb-6 max-[360px]:px-3">
        <CalendarTabs />
        <section aria-label="다음 접종 예정" className="min-h-[166px] rounded-[17px] border border-[#aa83ff] bg-[#f0edf8] px-[30px] py-[18px] max-[360px]:px-5">
          <h2 className="text-sm font-bold">다음 접종 예정</h2>
          {nextSchedule ? <>
            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="text-[22px] leading-7 font-bold">{getVaccinationTitle(nextSchedule)}</h3>
              <span className="shrink-0 text-2xl font-medium text-[#aa83ff]">{getDayLabel(nextSchedule.scheduledDate, today)}</span>
            </div>
            <p className="mt-1 text-sm font-medium">{getRecommendedPeriod(nextSchedule)}</p>
            <p className="mt-2 text-base text-[#92979d]">{formatVaccinationDate(nextSchedule.scheduledDate)} 예정</p>
          </> : <div className="mt-5">
            <p className="text-lg font-bold">다음 접종 예정이 없어요</p>
            <p className="mt-2 text-sm leading-6 text-[#92979d]">{pending.length ? '예정일이 지난 접종 일정을 확인해주세요.' : '새로운 예방접종 일정을 추가해주세요.'}</p>
          </div>}
        </section>
        <section aria-label="접종 완료" className="mt-4">
          <h2 className="mb-2.5 text-sm font-bold">접종 완료</h2>
          {completed.length ? <div className="space-y-2.5">{completed.map((item) => <VaccinationCard key={item.vaccinationScheduleId} schedule={item} today={today} onClick={() => setSelectedId(item.vaccinationScheduleId)} />)}</div>
            : <p className="rounded-2xl border border-[#d6d6d6] bg-white p-5 text-sm text-[#92979d]">아직 완료한 접종이 없어요.</p>}
        </section>
        <section aria-label="접종 예정" className="mt-4">
          <h2 className="mb-2.5 text-sm font-bold">접종 예정</h2>
          {pending.length ? <div className="space-y-2.5">{pending.map((item) => <VaccinationCard key={item.vaccinationScheduleId} schedule={item} today={today} onClick={() => setSelectedId(item.vaccinationScheduleId)} />)}</div>
            : <p className="rounded-2xl border border-[#d6d6d6] bg-white p-5 text-sm text-[#92979d]">등록된 접종 예정이 없어요.</p>}
        </section>
        <button type="button" onClick={() => navigate('/vaccination/new')}
          className="mt-5 min-h-[42px] w-full cursor-pointer rounded-2xl border border-[#aa83ff] bg-[#f0edf8] text-sm font-semibold text-[#aa83ff] hover:bg-[#e9e1fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7952bf]">예방 접종 추가</button>
      </div>
      {selectedSchedule && <VaccinationDetail key={selectedSchedule.vaccinationScheduleId} schedule={selectedSchedule} onClose={() => setSelectedId(null)}
        onEdit={() => navigate(`/vaccination/${selectedSchedule.vaccinationScheduleId}/edit`)}
        onChangeStatus={(date) => { onChangeStatus(selectedSchedule.vaccinationScheduleId, date); setSelectedId(null) }} />}
    </main>
  )
}

function VaccinationCard({ schedule, today, onClick }: { schedule: VaccinationSchedule; today: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${getVaccinationTitle(schedule)} ${schedule.completed ? '완료' : '예정'} 상세`}
      className="flex min-h-[83px] w-full cursor-pointer items-center justify-between gap-3 rounded-[17px] border border-[#d6d6d6] bg-white px-5 py-3 text-left hover:bg-[#fcfaff] focus-visible:outline-2 focus-visible:outline-[#aa83ff]">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{getVaccinationTitle(schedule)}</span>
        <span className="mt-0.5 block text-xs text-[#92979d]">{getRecommendedPeriod(schedule)}</span>
        <span className="mt-1 block text-xs text-[#92979d]">{formatVaccinationDate(schedule.completedDate ?? schedule.scheduledDate)}</span>
      </span>
      <span className={`shrink-0 text-base font-medium ${schedule.completed ? 'text-[#63c980]' : 'text-[#aa83ff]'}`}>
        {schedule.completed ? '완료' : getDayLabel(schedule.scheduledDate, today)}
      </span>
    </button>
  )
}

function VaccinationDetail({ schedule, onClose, onEdit, onChangeStatus }: { schedule: VaccinationSchedule; onClose: () => void; onEdit: () => void; onChangeStatus: (date: string | null) => void }) {
  const [completedDate, setCompletedDate] = useState(getToday)
  const [error, setError] = useState('')

  function completeVaccination() {
    if (!isValidDate(completedDate) || completedDate > getToday()) {
      setError('오늘 또는 이전 날짜로 실제 접종일을 선택해주세요.')
      return
    }
    onChangeStatus(completedDate)
  }

  return (
    <Modal title="예방접종 상세" subtitle={getVaccinationTitle(schedule)} onClose={onClose}>
      <dl className="space-y-3 rounded-2xl bg-[#f7f3fc] p-4 text-sm">
        <div><dt className="text-xs text-[#7c7589]">접종 예정일</dt><dd className="mt-1 font-medium">{formatVaccinationDate(schedule.scheduledDate)}</dd></div>
        {schedule.completedDate && <div><dt className="text-xs text-[#7c7589]">접종 완료일</dt><dd className="mt-1 font-medium">{formatVaccinationDate(schedule.completedDate)}</dd></div>}
        <div><dt className="text-xs text-[#7c7589]">접종 기관</dt><dd className="mt-1 wrap-anywhere">{schedule.institution || '미입력'}</dd></div>
        <div><dt className="text-xs text-[#7c7589]">메모</dt><dd className="mt-1 whitespace-pre-wrap wrap-anywhere">{schedule.memo || '메모 없음'}</dd></div>
      </dl>
      <button type="button" onClick={onEdit}
        className="mt-4 min-h-11 w-full cursor-pointer rounded-xl bg-[#121212] text-sm font-medium text-white hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa83ff]">수정하기</button>
      {schedule.completed ? <button type="button" onClick={() => onChangeStatus(null)}
        className="mt-4 min-h-11 w-full cursor-pointer rounded-xl border border-[#aa83ff] text-sm font-semibold text-[#7952bf]">접종 예정으로 되돌리기</button>
        : <div className="mt-4">
          <label htmlFor="vaccination-completed-date" className="mb-2 block text-sm font-semibold">실제 접종일</label>
          <input id="vaccination-completed-date" type="date" value={completedDate} max={getToday()}
            onInput={(event) => { setCompletedDate(event.currentTarget.value); setError('') }} aria-invalid={Boolean(error)}
            aria-describedby={error ? 'vaccination-completed-error' : undefined}
            className="min-h-11 w-full min-w-0 cursor-pointer rounded-xl border border-[#d6d6d6] bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-[#aa83ff]" />
          {error && <p id="vaccination-completed-error" role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
          <button type="button" onClick={completeVaccination} className="mt-4 min-h-11 w-full cursor-pointer rounded-xl bg-[#aa83ff] text-sm font-semibold text-white hover:bg-[#966ce9]">접종 완료로 변경</button>
        </div>}
    </Modal>
  )
}
