import { useId, useState } from 'react'
import { growthMetrics } from './growthMockData'
import type { GrowthComparisonResponse, GrowthMetric, GrowthRecord } from './growthTypes'

type CalendarTab = 'schedule' | 'growth' | 'vaccination'

type CalendarGrowthProps = {
  records: GrowthRecord[]
  comparison?: GrowthComparisonResponse | null
  onAddRecord?: () => void
  onTabChange?: (tab: CalendarTab) => void
}

const metricKeys: GrowthMetric[] = ['heightCm', 'weightKg']
const calendarTabs: { key: CalendarTab; label: string; colorClassName: string }[] = [
  { key: 'schedule', label: '일정', colorClassName: 'text-[#4d9fff]' },
  { key: 'growth', label: '성장 기록', colorClassName: 'text-[#63c980]' },
  { key: 'vaccination', label: '예방 접종', colorClassName: 'text-[#aa83ff]' },
]

const buttonFocusStyles =
  'cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#256b3c]'

function CalendarTabIcon({ tab }: { tab: CalendarTab }) {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {tab === 'schedule' && <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 2v6M17 2v6M3 11h18" />
      </>}
      {tab === 'growth' && <>
        <path d="M4 20V14h3v6M11 20V9h3v11M18 20V3h3v17" />
      </>}
      {tab === 'vaccination' && <>
        <path d="m5 19 3-3m-5 5 2-2m2-6 6-6 5 5-6 6-5-5Zm6-9 7 7m-2-9 4 4m-4-2-3 3m5-1-3 3m-9 2 3 3" />
      </>}
    </svg>
  )
}

function GrowthSummary({
  records,
  comparison,
}: {
  records: GrowthRecord[]
  comparison?: GrowthComparisonResponse | null
}) {
  const latestRecord = records.at(-1)
  // 다른 기록의 비교 결과가 최신 카드에 표시되지 않도록 ID를 확인합니다.
  const recordChange = latestRecord && comparison?.current.growthRecordId === latestRecord.growthRecordId
    ? comparison.change
    : null

  return (
    <section
      className="rounded-[17px] border border-[#63c980] bg-[#ecf5ef] px-5 pt-[18px] pb-5 max-[360px]:px-3"
      aria-labelledby="growth-summary-title"
    >
      <h2 id="growth-summary-title" className="mb-3 pl-[9px] text-base leading-[1.18] font-bold">
        한눈에 보기
      </h2>
      <div className="grid grid-cols-2 gap-5 max-[360px]:gap-3">
        {metricKeys.map((metric) => {
          const { label, unit } = growthMetrics[metric]
          const change = recordChange?.[metric]

          return (
            <article className="rounded-[17px] border border-[#d6d6d6] bg-white px-[10px] py-[14px]" key={metric}>
              <h3 className="text-xs leading-normal font-normal">{label}</h3>
              <p className="mt-[3px] text-base leading-normal font-bold whitespace-nowrap">
                {latestRecord ? latestRecord[metric].toFixed(1) : '—'} <span className="text-sm">{unit}</span>
              </p>
              <p className="mt-[5px] text-[9px] text-[#92979d] whitespace-nowrap">
                {change === undefined || !recordChange
                  ? (comparison?.previous === null ? '이전 기록 없음' : '비교 데이터 없음')
                  : `${change >= 0 ? '+' : ''}${change.toFixed(1)}${unit} (${recordChange.days}일)`}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function GrowthChart({ records, metric }: { records: GrowthRecord[]; metric: GrowthMetric }) {
  const chartTitleId = useId()
  const { label, unit, tickStep } = growthMetrics[metric]

  if (records.length === 0) {
    return <p className="py-[70px] text-center text-[#94999e]">아직 성장 기록이 없어요.</p>
  }

  const values = records.map((record) => record[metric])
  const minimum = Math.max(0, (Math.floor(Math.min(...values) / tickStep) - 1) * tickStep)
  const maximum = (Math.ceil(Math.max(...values) / tickStep) + 1) * tickStep
  const ticks = Array.from(
    { length: Math.round((maximum - minimum) / tickStep) + 1 },
    (_, index) => minimum + index * tickStep,
  )
  const getX = (index: number) => 32 + (index / Math.max(records.length - 1, 1)) * 276
  const getY = (value: number) => 190 - ((value - minimum) / (maximum - minimum)) * 164
  const points = values.map((value, index) => `${getX(index)},${getY(value)}`).join(' ')
  const showDay = new Set(records.map((record) => record.measuredDate.slice(0, 7))).size < records.length
  const showYear = new Set(records.map((record) => record.measuredDate.slice(0, 4))).size > 1

  function getDateLabel(measuredDate: string) {
    const month = Number(measuredDate.slice(5, 7))
    if (showDay) {
      return `${month}/${Number(measuredDate.slice(8, 10))}`
    }
    return showYear ? `${measuredDate.slice(2, 4)}.${month}` : `${month}월`
  }

  return (
    <svg className="block h-auto w-full" viewBox="0 0 320 220" role="img" aria-labelledby={chartTitleId}>
      <title id={chartTitleId}>{label} 변화 그래프, 단위 {unit}</title>
      <text x="8" y="12" className="fill-[#121212] font-sans text-[9px]">({unit})</text>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1="32" x2="308" y1={getY(tick)} y2={getY(tick)} className="stroke-[#eeeeef] stroke-1" />
          <text x="23" y={getY(tick) + 4} textAnchor="end" className="fill-[#121212] font-sans text-[11px]">
            {tick}
          </text>
        </g>
      ))}
      {records.map((record, index) => (
        <g key={record.growthRecordId}>
          <line x1={getX(index)} x2={getX(index)} y1="26" y2="190" className="stroke-[#eeeeef] stroke-1" />
          <text x={getX(index)} y="208" textAnchor="middle" className="fill-[#121212] font-sans text-[11px]">
            {getDateLabel(record.measuredDate)}
          </text>
        </g>
      ))}
      <polyline points={points} fill="none" stroke="#63c980" strokeWidth="1.5" />
      {records.map((record, index) => (
        <circle key={record.growthRecordId} cx={getX(index)} cy={getY(record[metric])} r="3" fill="#63c980">
          <title>{record.measuredDate}: {record[metric].toFixed(1)} {unit}</title>
        </circle>
      ))}
    </svg>
  )
}

export default function CalendarGrowth({
  records,
  comparison,
  onAddRecord,
  onTabChange,
}: CalendarGrowthProps) {
  const [selectedMetric, setSelectedMetric] = useState<GrowthMetric>('heightCm')
  const sortedRecords = [...records].sort((first, second) =>
    first.measuredDate.localeCompare(second.measuredDate) || first.growthRecordId - second.growthRecordId,
  )

  return (
    <main className="mx-auto min-h-svh w-full max-w-[402px] bg-[#f7f8f9] px-5 pt-7 pb-8 font-sans text-sm leading-normal tracking-normal text-[#121212] antialiased scheme-light max-[360px]:px-3">
      <header className="pb-[26px] text-center">
        <h1 className="text-[22px] leading-[1.4] font-bold">캘린더</h1>
      </header>

      {/* 공통 캘린더 화면과 연결할 때 onTabChange를 전달합니다. */}
      <nav className="mb-4 grid grid-cols-3 rounded-[17px] border border-[#d6d6d6] bg-white" aria-label="캘린더 메뉴">
        {calendarTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`flex min-h-12 items-center justify-center gap-[7px] rounded-2xl border px-[2px] py-2 text-base leading-normal font-semibold whitespace-nowrap max-[360px]:gap-1 max-[360px]:text-sm ${buttonFocusStyles} ${tab.colorClassName} ${
              tab.key === 'growth'
                ? 'border-[#63c980] bg-[#f0f8f2]'
                : 'border-transparent bg-transparent'
            }`}
            aria-current={tab.key === 'growth' ? 'page' : undefined}
            disabled={tab.key !== 'growth' && !onTabChange}
            onClick={() => onTabChange?.(tab.key)}
          >
            <CalendarTabIcon tab={tab.key} />
            {tab.label}
          </button>
        ))}
      </nav>

      <GrowthSummary records={sortedRecords} comparison={comparison} />

      <section
        className="mt-[22px] rounded-[17px] border border-[#d6d6d6] bg-white px-[18px] pt-5 pb-[18px] max-[360px]:px-3"
        aria-labelledby="growth-history-title"
      >
        <div className="mb-[10px] flex items-center justify-between gap-3 max-[360px]:gap-[6px]">
          <h2 id="growth-history-title" className="text-base leading-[1.18] font-normal whitespace-nowrap">
            성장 기록
          </h2>
          <div className="flex gap-2 max-[360px]:gap-1" role="group" aria-label="성장 지표 선택">
            {metricKeys.map((metric) => (
              <button
                key={metric}
                type="button"
                aria-pressed={selectedMetric === metric}
                onClick={() => setSelectedMetric(metric)}
                className={`rounded-[11px] border px-[11px] py-1 text-xs leading-normal text-[#121212] whitespace-nowrap max-[360px]:px-2 ${buttonFocusStyles} ${
                  selectedMetric === metric
                    ? 'border-[#63c980] bg-[#f0f8f2]'
                    : 'border-[#d6d6d6] bg-white'
                }`}
              >
                {growthMetrics[metric].label}
              </button>
            ))}
          </div>
        </div>
        <GrowthChart records={sortedRecords.slice(-6)} metric={selectedMetric} />
        <p className="mt-[10px] text-right text-xs leading-normal text-[#94999e]">최근 6개 측정 기록</p>
      </section>

      {/* 등록 폼이 준비되면 onAddRecord를 전달해 버튼을 연결합니다. */}
      <button
        className={`mt-[22px] min-h-[42px] w-full rounded-2xl border border-[#63c980] bg-[#ecf5ef] font-semibold text-[#3ca75b] disabled:opacity-65 ${buttonFocusStyles}`}
        type="button"
        onClick={onAddRecord}
        disabled={!onAddRecord}
      >
        성장 기록 추가
      </button>
    </main>
  )
}
