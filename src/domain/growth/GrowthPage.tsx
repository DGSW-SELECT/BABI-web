import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import GrowthTabs from './GrowthTabs'
import { growthLabels, growthTypes } from './growthData'
import type { GrowthRecord, GrowthType } from './growthData'

type GrowthPageProps = {
  records: GrowthRecord[]
}

export default function GrowthPage({ records }: GrowthPageProps) {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<GrowthType>('height')

  function openForm() {
    navigate('/growth/new')
  }

  return (
    <main className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f7f8f9] text-sm text-[#121212]">
      <header className="flex min-h-14 shrink-0 items-center justify-center">
        <h1 className="text-[22px] font-bold">캘린더</h1>
      </header>
      <div data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-none px-5 pt-3 pb-6 max-[360px]:px-3">
        <GrowthTabs />
        <section className="rounded-[17px] border border-[#63c980] bg-[#ecf5ef] px-5 pt-[18px] pb-5 max-[360px]:px-3" aria-label="한눈에 보기">
          <h2 className="mb-3 pl-[9px] text-base font-bold">한눈에 보기</h2>
          <div className="grid grid-cols-2 gap-5 max-[360px]:gap-3">
            {growthTypes.map((type) => {
              const { name, unit } = growthLabels[type]
              const summary = getGrowthSummary(records, type)
              return (
                <article key={type} className="rounded-[17px] border border-[#d6d6d6] bg-white px-[10px] py-[14px]">
                  <h3 className="text-xs">{name}</h3>
                  <p className="mt-[3px] text-base font-bold whitespace-nowrap">
                    {summary.value === undefined ? '—' : summary.value.toFixed(1)} <span className="text-sm">{unit}</span>
                  </p>
                  <p className="mt-[5px] text-[9px] whitespace-nowrap text-[#92979d]">{summary.change}</p>
                </article>
              )
            })}
          </div>
        </section>
        <section className="mt-[22px] rounded-[17px] border border-[#d6d6d6] bg-white px-[18px] pt-5 pb-[18px] max-[360px]:px-3" aria-label="성장 기록">
          <div className="mb-[10px] flex items-center justify-between gap-3 max-[360px]:gap-[6px]">
            <h2 className="text-base whitespace-nowrap">성장 기록</h2>
            <div className="flex gap-2 max-[360px]:gap-1" role="group" aria-label="성장 지표 선택">
              {growthTypes.map((type) => (
                <button key={type} type="button" aria-pressed={selectedType === type} onClick={() => setSelectedType(type)}
                  className={`cursor-pointer rounded-[11px] border px-[11px] py-1 text-xs whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#256b3c] ${selectedType === type ? 'border-[#63c980] bg-[#f0f8f2]' : 'border-[#d6d6d6] bg-white'}`}>
                  {growthLabels[type].name}
                </button>
              ))}
            </div>
          </div>
          <GrowthChart key={selectedType} records={records} selectedType={selectedType} />
          <p className="mt-[10px] text-right text-xs text-[#94999e]">최근 6개 측정 기록</p>
        </section>
        <button type="button" onClick={openForm}
          className="mt-[22px] min-h-[42px] w-full cursor-pointer rounded-2xl border border-[#63c980] bg-[#ecf5ef] font-semibold text-[#3ca75b] focus-visible:outline-2 focus-visible:outline-[#256b3c]">
          성장 기록 추가
        </button>
      </div>
    </main>
  )
}

function GrowthChart({ records, selectedType }: { records: GrowthRecord[]; selectedType: GrowthType }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(true)
  const { name, unit, step } = growthLabels[selectedType]
  const chartRecords = getChartRecords(records, selectedType)

  useEffect(() => {
    function closeTooltip(event: PointerEvent) {
      if (event.target instanceof Node && !chartRef.current?.contains(event.target)) setShowTooltip(false)
    }
    document.addEventListener('pointerdown', closeTooltip)
    return () => document.removeEventListener('pointerdown', closeTooltip)
  }, [])

  if (chartRecords.length === 0) return <p className="py-[70px] text-center text-[#94999e]">아직 성장 기록이 없어요.</p>

  const monthAxis = getMonthAxis(chartRecords.map((record) => record.date))
  const valueAxis = getValueAxis(chartRecords.map((record) => record.value), step)

  function getMonthLabel(month: number) {
    const label = `${month % 12 + 1}월`
    if (!monthAxis.showYear) return label
    return `${String(Math.floor(month / 12)).slice(-2)}.${month % 12 + 1}`
  }

  return (
    <div ref={chartRef} aria-label={`${name} 성장 기록 그래프`} role="group"
      className="[&_.recharts-line-dot]:cursor-pointer [&_g]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-[#63c980]"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setShowTooltip(false)
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') setShowTooltip(true)
      }}>
      <p className="pl-2 text-[9px]">({unit})</p>
      <div className="aspect-[320/210] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={chartRecords} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} onClick={() => setShowTooltip(true)} accessibilityLayer>
            <CartesianGrid stroke="#eeeeef" />
            <XAxis dataKey="month" type="number" domain={[monthAxis.min, monthAxis.max]} ticks={monthAxis.ticks}
              tickFormatter={getMonthLabel} tick={{ fontSize: 11, fill: '#121212' }} axisLine={false} tickLine={false} interval={0} height={26} />
            <YAxis domain={[valueAxis.min, valueAxis.max]} ticks={valueAxis.ticks} width={32}
              tick={{ fontSize: 11, fill: '#121212' }} axisLine={false} tickLine={false} />
            <Line dataKey="value" type="linear" stroke="#63c980" strokeWidth={1.5} dot={{ r: 3, fill: '#63c980', strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
            <Tooltip trigger="click" active={showTooltip ? undefined : false} cursor={false} isAnimationActive={false}
              wrapperStyle={{ pointerEvents: 'auto', zIndex: 20 }}
              content={({ active, payload }) => active && payload?.length ? (
                <GrowthTooltip record={payload[0].payload} onClose={() => setShowTooltip(false)} />
              ) : null} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function GrowthTooltip({ record, onClose }: { record: GrowthRecord; onClose: () => void }) {
  return (
    <div role="dialog" aria-label={`${record.date} 성장 기록`} className="w-[220px] max-w-[calc(100vw_-_80px)] rounded-2xl border border-[#badfc5] bg-white p-3 text-xs text-[#121212] shadow-[0_5px_20px_rgba(24,74,40,0.16)]">
      <div className="mb-2 flex items-center justify-between gap-1">
        <h3 className="font-bold">{record.date.replaceAll('-', '. ')} 기록</h3>
        <button type="button" aria-label="기록 상세 닫기" onClick={(event) => { event.stopPropagation(); onClose() }}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full text-lg text-[#69766d] hover:bg-[#eff8f1]">×</button>
      </div>
      <dl className="grid grid-cols-2 gap-2 rounded-lg bg-[#f0f8f2] p-2">
        <div><dt className="text-[11px] text-[#64756a]">키</dt><dd className="mt-0.5 font-semibold">{formatGrowthValue(record.height, 'cm')}</dd></div>
        <div><dt className="text-[11px] text-[#64756a]">몸무게</dt><dd className="mt-0.5 font-semibold">{formatGrowthValue(record.weight, 'kg')}</dd></div>
      </dl>
      <p className="mt-2 font-semibold">메모</p>
      <p className="mt-1 max-h-20 overflow-y-auto overscroll-contain whitespace-pre-wrap wrap-anywhere text-[#657169]">{record.memo?.trim() || '메모 없음'}</p>
    </div>
  )
}

function sortGrowthRecords(records: GrowthRecord[]) {
  return [...records].sort((first, second) => first.date.localeCompare(second.date) || first.id - second.id)
}

function getGrowthSummary(records: GrowthRecord[], type: GrowthType) {
  const sorted = sortGrowthRecords(records)
  const current = sorted.at(-1)
  const previous = sorted.at(-2)
  const latest = sorted.findLast((record) => typeof record[type] === 'number')
  const value = latest?.[type]
  let change = sorted.length === 1 ? '이전 기록 없음' : '비교 데이터 없음'
  if (current && latest?.id === current.id && value !== undefined && previous?.[type] !== undefined) {
    const difference = Number((value - previous[type]).toFixed(2))
    const days = (Date.parse(current.date) - Date.parse(previous.date)) / 86400000
    change = `${difference >= 0 ? '+' : ''}${difference.toFixed(1)}${growthLabels[type].unit} (${days}일)`
  }
  return { value, change }
}

function getMonthPosition(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return year * 12 + month - 1 + (day - 1) / days
}

function getMonthAxis(dates: string[]) {
  if (dates.length === 0) return { min: 0, max: 1, ticks: [], showYear: false }
  const positions = dates.map(getMonthPosition)
  const min = Math.floor(Math.min(...positions))
  const months = Math.max(1, Math.ceil(Math.max(...positions)) - min)
  const step = [1, 2, 3, 6, 12, 24, 60, 120].find((size) => months / size <= 6) ?? Math.ceil(months / 720) * 120
  const max = min + Math.ceil(months / step) * step
  const ticks: number[] = []
  for (let month = min; month <= max; month += step) ticks.push(month)
  return { min, max, ticks, showYear: Math.floor(min / 12) !== Math.floor(max / 12) }
}

function getValueAxis(values: number[], baseStep: number) {
  if (values.length === 0) return { min: 0, max: baseStep, ticks: [0, baseStep], step: baseStep }
  const smallest = Math.min(...values)
  const largest = Math.max(...values)
  const step = Math.max(baseStep, Math.ceil((largest - smallest) / 5 / baseStep) * baseStep)
  let min = Math.floor(smallest / step) * step
  let max = Math.ceil(largest / step) * step
  while (Math.round((max - min) / step) < 3) {
    if (smallest < 0 || min > 0) min -= step
    if (Math.round((max - min) / step) < 3) max += step
  }
  const ticks: number[] = []
  for (let value = min; value <= max; value += step) ticks.push(Number(value.toPrecision(12)))
  return { min, max, ticks, step }
}

function getChartRecords(records: GrowthRecord[], type: GrowthType) {
  return sortGrowthRecords(records)
    .filter((record) => typeof record[type] === 'number' && Number.isFinite(record[type]))
    .slice(-6)
    .map((record) => ({ ...record, month: getMonthPosition(record.date), value: Number(record[type]) }))
}

function formatGrowthValue(value: number | undefined, unit: string) {
  if (value === undefined || !Number.isFinite(value)) return '미입력'
  return `${value.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ${unit}`
}
