import { useState } from 'react'
import { useNavigate } from 'react-router'
import CalendarTabs, { CalendarTabIcon } from '../../global/navigation/CalendarTabs'
import Modal from '../../shared/components/Modal'
import type { GrowthRecord } from '../growth/growthData'
import { getDayLabel, getVaccinationTitle } from '../vaccination/vaccinationData'
import type { VaccinationSchedule } from '../vaccination/vaccinationData'
import { formatScheduleDate, formatScheduleTime, getDateKey, getMonthDays } from './scheduleData'
import type { Schedule } from './scheduleData'

type SchedulePageProps = {
  schedules: Schedule[]
  records: GrowthRecord[]
  vaccinations: VaccinationSchedule[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onDelete: (id: number) => void
}

export default function SchedulePage({ schedules, records, vaccinations, selectedDate, onSelectDate, onDelete }: SchedulePageProps) {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => new Date(`${selectedDate.slice(0, 7)}-01T12:00:00`))
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const today = getDateKey()
  const days = getMonthDays(month)
  const daySchedules = schedules.filter((item) => item.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
  const dayRecords = records.filter((item) => item.date === selectedDate)
  const dayVaccinations = vaccinations.filter((item) => (item.completedDate || item.scheduledDate) === selectedDate)
  const hasItems = daySchedules.length + dayRecords.length + dayVaccinations.length > 0

  function selectDate(date: Date) {
    onSelectDate(getDateKey(date))
    if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12))
    }
  }

  function selectToday() {
    const currentDate = getDateKey()
    onSelectDate(currentDate)
    setMonth(new Date(`${currentDate.slice(0, 7)}-01T12:00:00`))
  }

  function moveMonth(direction: number) {
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + direction, 1, 12)
    setMonth(nextMonth)
    onSelectDate(getDateKey(nextMonth))
  }

  function closeScheduleDetail() {
    setSelectedSchedule(null)
    setShowDeleteConfirm(false)
  }

  function deleteSelectedSchedule() {
    if (!selectedSchedule) return
    onDelete(selectedSchedule.id)
    closeScheduleDetail()
  }

  return (
    <main aria-label="일정 캘린더" className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-sm text-[#121212]">
      <div className="page-title-header" aria-hidden="true" />
      <div data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-none px-5 pt-3 pb-6 max-[360px]:px-3">
        <CalendarTabs />
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={selectToday}
            className="min-h-8 cursor-pointer rounded-lg border border-[#d6d6d6] bg-white px-3 text-xs font-medium text-[#515151] hover:bg-[#eef6ff] focus-visible:outline-2 focus-visible:outline-[#4d9fff]">오늘로 가기</button>
        </div>
        <section aria-label="월별 달력" className="rounded-[17px] border border-[#d6d6d6] bg-white px-3 pt-3 pb-2">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl hover:bg-[#f7f8f9] focus-visible:outline-2 focus-visible:outline-[#4d9fff]">
              <MonthArrow />
            </button>
            <h1 aria-live="polite" className="text-lg font-semibold">{month.getFullYear()}년 {month.getMonth() + 1}월</h1>
            <button type="button" aria-label="다음 달" onClick={() => moveMonth(1)}
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl hover:bg-[#f7f8f9] focus-visible:outline-2 focus-visible:outline-[#4d9fff]">
              <MonthArrow next />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-[#92979d]" aria-hidden="true">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => <span key={day} className={`py-2 ${index === 0 ? 'text-[#ff7575]' : index === 6 ? 'text-[#4d9fff]' : ''}`}>{day}</span>)}
          </div>
          <div className="grid grid-cols-7" aria-label="날짜 선택">
            {days.map((date) => {
              const key = getDateKey(date)
              const inMonth = date.getMonth() === month.getMonth()
              const hasSchedule = schedules.some((item) => item.date === key)
              const hasGrowth = records.some((item) => item.date === key)
              const hasVaccination = vaccinations.some((item) => (item.completedDate || item.scheduledDate) === key)
              const marks = [hasSchedule && '일정', hasGrowth && '성장 기록', hasVaccination && '예방 접종'].filter(Boolean).join(', ')
              return (
                <button key={key} type="button" aria-label={`${key}${key === today ? ' 오늘' : ''}${marks ? ` · ${marks}` : ''}`}
                  aria-pressed={selectedDate === key} aria-current={key === today ? 'date' : undefined} onClick={() => selectDate(date)}
                  className={`flex min-h-10 cursor-pointer flex-col items-center justify-center rounded-xl text-xs focus-visible:outline-2 focus-visible:outline-[#4d9fff] ${!inMonth ? 'text-[#c9cdd1]' : date.getDay() === 0 ? 'text-[#ff6262]' : date.getDay() === 6 ? 'text-[#399fff]' : 'text-[#121212]'}`}>
                  <span className={`flex size-6 items-center justify-center rounded-full ${selectedDate === key ? 'bg-[#dceaff] font-semibold text-[#315e9a]' : key === today ? 'font-semibold underline decoration-[#4d9fff] underline-offset-4' : ''}`}>{date.getDate()}</span>
                  <span aria-hidden="true" className="mt-0.5 flex h-1.5 gap-0.5">
                    {hasSchedule && <span className="size-1 rounded-full bg-[#4d9fff]" />}
                    {hasGrowth && <span className="size-1 rounded-full bg-[#63c980]" />}
                    {hasVaccination && <span className="size-1 rounded-full bg-[#aa83ff]" />}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
        <section aria-label="선택한 날짜 기록" className="mt-3">
          <h2 className="mb-2 text-base font-bold">{formatScheduleDate(selectedDate)}</h2>
          <div className="space-y-2.5">
            {daySchedules.map((item) => <DayCard key={`schedule-${item.id}`} type="schedule" title="일정" description={item.title} value={formatScheduleTime(item.time)} onClick={() => setSelectedSchedule(item)} />)}
            {dayRecords.map((item) => <DayCard key={`growth-${item.id}`} type="growth" title="성장 기록"
              description={[item.height !== undefined && `키 ${item.height}cm`, item.weight !== undefined && `몸무게 ${item.weight}kg`].filter(Boolean).join(' · ')}
              value="기록 보기" onClick={() => navigate('/growth')} />)}
            {dayVaccinations.map((item) => <DayCard key={`vaccination-${item.vaccinationScheduleId}`} type="vaccination" title={item.completed ? '예방접종 완료' : '예방접종 예정'}
              description={getVaccinationTitle(item)} value={item.completed ? '완료' : getDayLabel(item.scheduledDate, today)} onClick={() => navigate('/vaccination')} />)}
            {!hasItems && <p className="rounded-[17px] border border-[#d6d6d6] bg-white px-5 py-6 text-center text-sm text-[#92979d]">이 날짜에 등록된 일정이 없어요.</p>}
          </div>
        </section>
        <button type="button" onClick={() => navigate('/schedule/new')} className="mt-4 min-h-[42px] w-full cursor-pointer rounded-2xl border border-[#4d9fff] bg-[#eef6ff] text-sm font-semibold text-[#399fff] hover:bg-[#e4f0ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9fff]">일정 추가</button>
      </div>
      {selectedSchedule && <Modal title={showDeleteConfirm ? '일정 삭제' : selectedSchedule.title} onClose={closeScheduleDetail}>
        {showDeleteConfirm ? <>
          <p className="text-sm leading-6 wrap-anywhere">‘{selectedSchedule.title}’ 일정을 삭제할까요?</p>
          <p className="mt-2 text-xs leading-5 text-[#92979d]">선택한 일정만 삭제되며, 다른 기록은 유지돼요.</p>
          <div className="mt-5 flex gap-3">
            <button type="button" autoFocus onClick={() => setShowDeleteConfirm(false)}
              className="min-h-11 flex-1 cursor-pointer rounded-xl border border-[#d6d6d6] text-sm focus-visible:outline-2 focus-visible:outline-[#4d9fff]">취소</button>
            <button type="button" onClick={deleteSelectedSchedule}
              className="min-h-11 flex-1 cursor-pointer rounded-xl bg-[#c94444] text-sm font-medium text-white hover:bg-[#b73838] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c94444]">삭제</button>
          </div>
        </> : <>
          <dl className="space-y-4 text-sm">
            <div><dt className="text-xs text-[#92979d]">날짜</dt><dd className="mt-1">{selectedSchedule.date.replaceAll('-', '. ')} · {formatScheduleDate(selectedSchedule.date)}</dd></div>
            <div><dt className="text-xs text-[#92979d]">시간</dt><dd className="mt-1">{formatScheduleTime(selectedSchedule.time)}</dd></div>
            <div><dt className="text-xs text-[#92979d]">메모</dt><dd className="mt-1 whitespace-pre-wrap wrap-anywhere">{selectedSchedule.memo || '메모 없음'}</dd></div>
          </dl>
          <button type="button" onClick={() => setShowDeleteConfirm(true)}
            className="mt-5 min-h-11 w-full cursor-pointer rounded-xl border border-[#e5baba] text-sm font-medium text-[#b73838] hover:bg-[#fff6f6] focus-visible:outline-2 focus-visible:outline-[#c94444]">일정 삭제</button>
        </>}
      </Modal>}
    </main>
  )
}

function MonthArrow({ next = false }: { next?: boolean }) {
  return <svg className={next ? 'rotate-180' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
}

function DayCard({ type, title, description, value, onClick }: { type: 'schedule' | 'growth' | 'vaccination'; title: string; description: string; value: string; onClick: () => void }) {
  const color = { schedule: 'text-[#4d9fff]', growth: 'text-[#63c980]', vaccination: 'text-[#aa83ff]' }[type]
  return (
    <button type="button" onClick={onClick} className="flex min-h-[70px] w-full cursor-pointer items-center gap-4 rounded-[17px] border border-[#d6d6d6] bg-white px-3 py-3 text-left hover:bg-[#fcfdff] focus-visible:outline-2 focus-visible:outline-[#4d9fff]">
      <span className={`shrink-0 ${color}`}><CalendarTabIcon tab={type} /></span>
      <span className="min-w-0 flex-1"><span className={`block text-base font-medium ${color}`}>{title}</span><span className="mt-1 block text-xs leading-4 break-words text-[#92979d]">{description}</span></span>
      <span className="shrink-0 text-xs text-[#92979d]">{value}</span>
    </button>
  )
}
