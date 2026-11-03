export type Schedule = {
  id: number
  title: string
  date: string
  time: string
  memo: string
}

export function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isValidScheduleDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && getDateKey(date) === value
}

export function createSchedules(): Schedule[] {
  return [{ id: 1, title: '소아과 정기검진', date: getDateKey(), time: '14:00', memo: '아기 수첩을 챙겨주세요.' }]
}

export function getMonthDays(month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  const count = Math.ceil((firstWeekday + lastDay) / 7) * 7
  return Array.from({ length: count }, (_, index) => new Date(year, monthIndex, index - firstWeekday + 1, 12))
}

export function formatScheduleDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`
}

export function formatScheduleTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return `${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${String(minutes).padStart(2, '0')}`
}
