import { aiReportData } from '../ai-report/aiReportData'

export type HandoffMessage = { sender: 'babi' | 'me'; texts: string[] }

// 서버 연결 전 화면용 예시. 기존 리포트와 같은 기록을 사용한다.
const recordOrder = ['crying', 'sleep', 'temperature', 'feeding']
export const handoffRecords = [...aiReportData]
  .sort((first, second) => recordOrder.indexOf(first.type) - recordOrder.indexOf(second.type))
  .map((report) => ({
    type: report.type,
    name: report.name,
    value: report.type === 'feeding' || report.type === 'crying' ? `${report.records.length}회` : report.value,
    description: report.description,
    detail: report.detail,
  }))

const feeding = aiReportData.find((report) => report.type === 'feeding')
const sleep = aiReportData.find((report) => report.type === 'sleep')
const temperature = aiReportData.find((report) => report.type === 'temperature')
const lastFeeding = feeding?.records.at(-1)

export const handoffBriefing = [
  lastFeeding ? `마지막 수유는 ${lastFeeding.time}, ${lastFeeding.value}예요. 오늘 수유는 ${feeding?.records.length}회, ${feeding?.description}예요.` : '아직 수유 기록이 없어요.',
  sleep ? `오늘 수면은 ${sleep.value} 기록됐어요. ${sleep.description}이에요.` : '아직 수면 기록이 없어요.',
  temperature ? `체온은 ${temperature.value}, ${temperature.description}예요. 남겨진 메모도 함께 확인해주세요.` : '아직 체온 기록이 없어요.',
]

export const handoffCheckMessages: HandoffMessage[] = [
  { sender: 'babi', texts: ['오늘 돌봄 내용을 정리해서 다음 보호자에게 남겨드릴까요?'] },
  { sender: 'me', texts: ['다음 보호자에게 꼭 알려줘야 할 내용만 정리해줘'] },
  { sender: 'babi', texts: ['좋아요. 오늘 있었던 특이사항이나 다음에 해야 할 일을 알려주세요.', '아래 기록을 확인하고, 추가로 전달할 내용을 메모해주세요.'] },
]
