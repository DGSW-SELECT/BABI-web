// FR-007: 화면용 예시 데이터. 권장 월령과 백신 목록은 실제 연동 시 서버에서 받아야 한다.
export type VaccinationSchedule = {
  vaccinationScheduleId: number
  babyId: number
  vaccineId: number
  vaccineName: string
  doseNumber: number
  recommendedStartMonth: number | null
  recommendedEndMonth: number | null
  scheduledDate: string
  completedDate: string | null
  completed: boolean
  institution: string
  memo: string
}

// 선택 목록 API가 아직 없어 디자인의 백신 세 종류로 화면을 검증한다.
export const vaccineOptions = [
  { vaccineId: 1, vaccineName: 'B형 간염 (HepB)', doses: [1, 2, 3] },
  { vaccineId: 2, vaccineName: '결핵 (BCG)', doses: [1] },
  { vaccineId: 3, vaccineName: 'A형 간염', doses: [1, 2] },
]

export function getToday() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function formatVaccinationDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return `${value.replaceAll('-', '. ')} (${['일', '월', '화', '수', '목', '금', '토'][date.getUTCDay()]})`
}

export function getDayLabel(scheduledDate: string, today: string) {
  const days = Math.round((Date.parse(`${scheduledDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000)
  if (days === 0) return 'D-Day'
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
}

export function getRecommendedPeriod(schedule: VaccinationSchedule) {
  const { recommendedStartMonth: start, recommendedEndMonth: end } = schedule
  if (start === null || end === null) return '권장 시기 확인 필요'
  if (start === end) return `생후 ${start}개월`
  return `생후 ${start}~${end}개월`
}

export function getVaccinationTitle(schedule: VaccinationSchedule) {
  return schedule.doseNumber === 1 ? schedule.vaccineName : `${schedule.vaccineName} ${schedule.doseNumber}차`
}

export function createVaccinationSchedules(): VaccinationSchedule[] {
  const today = getToday()
  function daysFromToday(days: number) {
    const date = new Date(`${today}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + days)
    return date.toISOString().slice(0, 10)
  }
  const common = { babyId: 1, institution: '', memo: '' }
  return [
    { ...common, vaccinationScheduleId: 1, vaccineId: 1, vaccineName: 'B형 간염 (HepB)', doseNumber: 1,
      recommendedStartMonth: 1, recommendedEndMonth: 3,
      scheduledDate: daysFromToday(-90), completedDate: daysFromToday(-90), completed: true },
    { ...common, vaccinationScheduleId: 2, vaccineId: 2, vaccineName: '결핵 (BCG)', doseNumber: 1,
      recommendedStartMonth: null, recommendedEndMonth: null,
      scheduledDate: daysFromToday(-90), completedDate: daysFromToday(-90), completed: true },
    { ...common, vaccinationScheduleId: 3, vaccineId: 3, vaccineName: 'A형 간염', doseNumber: 2,
      recommendedStartMonth: null, recommendedEndMonth: null,
      scheduledDate: daysFromToday(15), completedDate: null, completed: false },
  ]
}
