import type { HeaderNotification } from '../../global/navigation/header/Header'

export type AiReportType = 'sleep' | 'feeding' | 'temperature' | 'crying'
export type AiReportRecord = { time: string; value: string; memo?: string }
export type AiReportItem = {
  type: AiReportType
  name: string
  value: string
  description: string
  detail: string
  feedback: string
  records: AiReportRecord[]
}

const today = new Date()
export const aiReportDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
export const aiReportBaby = { babyId: 1, name: '지민이' }
export const aiReportComment = '오늘은 수면시간이 평소보다\n조금 길어요!'

export const aiReportData: AiReportItem[] = [
  {
    type: 'sleep', name: '수면', value: '10시간', description: '최장 1시간 30분', detail: '가장 긴 수면 1시간 30분',
    feedback: '8번의 수면 기록을 모으면 총 10시간이에요. 가장 길게 기록한 수면은 1시간 30분이에요.',
    records: [
      { time: '00:00–01:30', value: '1시간 30분' },
      { time: '02:00–03:30', value: '1시간 30분' },
      { time: '04:00–05:30', value: '1시간 30분' },
      { time: '07:00–08:15', value: '1시간 15분' },
      { time: '10:00–11:15', value: '1시간 15분' },
      { time: '13:00–14:00', value: '1시간' },
      { time: '16:00–17:00', value: '1시간' },
      { time: '20:00–21:00', value: '1시간' },
    ],
  },
  {
    type: 'feeding', name: '수유', value: '620ml', description: '총 620ml', detail: '하루 동안 기록한 수유량이에요.',
    feedback: '수유가 5번, 총 620ml 기록되어 있어요. 각 기록의 시간과 양을 함께 확인할 수 있어요.',
    records: [
      { time: '06:30', value: '120ml' },
      { time: '09:30', value: '120ml' },
      { time: '12:30', value: '140ml' },
      { time: '15:30', value: '120ml' },
      { time: '18:30', value: '120ml' },
    ],
  },
  {
    type: 'temperature', name: '체온', value: '36.5도', description: '오늘 기록 3회', detail: '입력한 측정값을 모은 평균이에요.',
    feedback: '체온이 3번 기록되어 있고 표시 평균은 36.5도예요. 입력 기록을 보여주는 참고 정보이며 건강 상태를 판정하는 내용은 아니에요.',
    records: [
      { time: '08:00', value: '36.4도' },
      { time: '13:00', value: '36.5도' },
      { time: '18:00', value: '36.6도' },
    ],
  },
  {
    type: 'crying', name: '울음', value: '16분', description: '총 16분', detail: '기록된 울음 시간을 더했어요.',
    feedback: '울음이 3번, 총 16분 기록되어 있어요. 기록만으로 울음의 원인을 단정하지 않아요.',
    records: [
      { time: '09:10', value: '5분' },
      { time: '14:05', value: '7분' },
      { time: '19:20', value: '4분' },
    ],
  },
]

export const aiReportNotifications: HeaderNotification[] = [
  { id: 'report-ready', title: '오늘의 육아 리포트가 준비됐어요', timeLabel: '오늘 21:10', isRead: false,
    body: '지민이의 수면·수유·체온·울음 기록을 한곳에 모았어요.\n카드를 누르면 기록한 시간과 수치를 자세히 확인할 수 있어요. 여러 보호자가 함께 남긴 기록도 차례대로 살펴보세요.\n기록을 수정한 경우에는 최신 내용을 다시 확인해주세요. 가족이 남긴 메모와 기록을 함께 살펴볼 수 있어요.' },
  { id: 'family-record', title: '함께 남긴 기록이 추가됐어요', timeLabel: '오늘 18:35', isRead: false,
    body: '가족이 새로운 육아 기록을 남겼어요. 공동 기록 화면에서 누가, 언제, 어떤 내용을 기록했는지 확인해보세요.' },
  { id: 'growth-record', title: '성장 기록을 확인해보세요', timeLabel: '오늘 16:00', isRead: false,
    body: '추가한 성장 기록은 캘린더의 성장 기록 화면에서 확인할 수 있어요. 그래프 점을 누르면 기록별 메모도 볼 수 있어요.' },
  { id: 'calendar-update', title: '캘린더에 일정이 등록됐어요', timeLabel: '어제 17:20', isRead: true,
    body: '등록한 일정의 날짜와 메모를 확인해보세요. 실제 일정 알림은 서버와 연결된 뒤 수신할 수 있어요.' },
  { id: 'welcome', title: 'BABI와 함께 기록을 시작해요', timeLabel: '어제 09:00', isRead: true,
    body: '하루의 기록을 차곡차곡 남기고 가족과 함께 확인해보세요. 기록을 모아 한눈에 살펴볼 수 있도록 도와드릴게요.' },
]
