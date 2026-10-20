import { useState } from 'react'
import Header from '../../global/navigation/header/Header'
import Modal from '../../shared/components/Modal'
import { aiReportBaby, aiReportComment, aiReportData, aiReportDate, aiReportNotifications } from './aiReportData'
import type { AiReportItem, AiReportType } from './aiReportData'

const cardColors = {
  sleep: 'border-[#a783ff] bg-[#f0edf8] text-[#a783ff]',
  feeding: 'border-[#4aa3ff] bg-[#e9f1f8] text-[#4aa3ff]',
  temperature: 'border-[#58cb7d] bg-[#eaf3ee] text-[#58cb7d]',
  crying: 'border-[#ffa58b] bg-[#faf2ee] text-[#ffa58b]',
}

export default function AiReportPage() {
  const [selectedType, setSelectedType] = useState<AiReportType | null>(null)
  const selectedReport = aiReportData.find((report) => report.type === selectedType)

  return (
    <main aria-label={`${aiReportBaby.name} ${aiReportDate} AI 육아 리포트`} className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-[#101010]">
      <Header baby={aiReportBaby} notifications={aiReportNotifications} />
      <div data-input-scroll-container className="min-h-0 flex-1 overflow-y-auto overscroll-none px-[30px] pb-8 max-[360px]:px-5">
        <h1 className="mt-10 text-center text-[22px] leading-[31px] font-medium tracking-[-0.5px] [@media(max-height:760px)]:mt-6">BABI의 육아 리포트</h1>
        <div className="mt-[38px] grid grid-cols-2 gap-x-[14px] gap-y-5 [@media(max-height:760px)]:mt-6">
          {aiReportData.map((report) => <AiReportCard key={report.type} report={report} onClick={() => setSelectedType(report.type)} />)}
        </div>
        <section aria-label="BABI의 한마디" className="mt-[49px] grid min-h-[145px] grid-cols-[minmax(0,1fr)_105px] items-center gap-1 rounded-[17px] border border-[#d6d6d6] bg-white px-5 py-4 max-[360px]:grid-cols-[minmax(0,1fr)_88px] max-[360px]:px-3 [@media(max-height:760px)]:mt-7">
          <div className="min-w-0">
            <h2 className="text-center text-base font-medium text-[#399fff]">BABI의 한마디</h2>
            <p className="relative mt-2 rounded-[32px] bg-[#f7f8f9] px-2 py-2 text-center text-xs leading-6 whitespace-pre-line wrap-anywhere after:absolute after:top-3 after:-right-1 after:size-4 after:rotate-45 after:bg-[#f7f8f9]">
              <span className="relative z-10">{aiReportComment}</span>
            </p>
          </div>
          <img src="/ai-report-mascot.svg" alt="BABI 코끼리 캐릭터" width="105" height="115" className="relative z-10 h-[115px] w-full object-contain" />
        </section>
      </div>
      {selectedReport && <AiReportDetailModal report={selectedReport} onClose={() => setSelectedType(null)} />}
    </main>
  )
}

function AiReportCard({ report, onClick }: { report: AiReportItem; onClick: () => void }) {
  let value = report.value
  if (report.type === 'feeding' || report.type === 'crying') value = `${report.records.length}회`

  return (
    <article aria-label={`${report.name} 요약`} className="min-w-0">
      <button type="button" aria-label={`${report.name} 상세 정보`} aria-haspopup="dialog" onClick={onClick}
        className={`flex h-full min-h-[148px] w-full cursor-pointer flex-col rounded-[17px] border px-[10px] pt-4 pb-[15px] text-left hover:brightness-[0.99] focus:outline-none focus-visible:brightness-95 [@media(max-height:760px)]:min-h-[132px] [@media(max-height:760px)]:py-3 ${cardColors[report.type]}`}>
        <AiReportIcon type={report.type} />
        <span className="mt-[7px] text-[13px] leading-[18px] font-medium text-[#8e979b]">{report.name}</span>
        <span className="mt-[7px] text-base leading-[22px] font-bold">{value}</span>
        <span className="mt-[7px] text-xs leading-[17px] text-[#90989d]">{report.description}</span>
      </button>
    </article>
  )
}

// 상세 모달과 최근 기록
const reportStyles = {
  sleep: { label: '총 수면 시간', background: 'bg-[#f2edff]', text: 'text-[#8060cc]', marker: 'border-[#b796e5] bg-[#f5f0fd] text-[#8060aa]' },
  feeding: { label: '총 수유량', background: 'bg-[#eaf5ff]', text: 'text-[#318ddc]', marker: 'border-[#7caaba] bg-[#eef8fb] text-[#38667a]' },
  temperature: { label: '평균 체온', background: 'bg-[#eaf7ef]', text: 'text-[#3e9e63]', marker: 'border-[#89b895] bg-[#eff8f1] text-[#467954]' },
  crying: { label: '총 울음 시간', background: 'bg-[#fff0e9]', text: 'text-[#ce7a53]', marker: 'border-[#e2b49e] bg-[#fff3ed] text-[#aa6749]' },
}

function AiReportDetailModal({ report, onClose }: { report: AiReportItem; onClose: () => void }) {
  const style = reportStyles[report.type]
  const recentRecords = report.records.slice(-3)

  return (
    <Modal title={`${report.name} 상세 정보`} subtitle={`${aiReportBaby.name} · ${aiReportDate.replaceAll('-', '. ')}`} onClose={onClose}
      icon={<span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${style.background} ${style.text}`}><AiReportIcon type={report.type} size={27} /></span>}>
      <section aria-label="핵심 수치" className={`rounded-[22px] p-4 ${style.background}`}>
        <dl className="grid grid-cols-[minmax(0,1fr)_84px] gap-3">
          <div>
            <dt className="text-xs text-[#607684]">{style.label}</dt>
            <dd className={`mt-1 text-[30px] leading-10 font-bold tracking-tight ${style.text}`}>{report.value}</dd>
          </div>
          <div className="border-l border-white/80 pl-4">
            <dt className="text-xs text-[#607684]">기록 횟수</dt>
            <dd className="mt-2 text-2xl font-bold text-[#334f60]">{report.records.length}회</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-5 text-[#607684]">{report.detail}</p>
      </section>
      <section aria-label="BABI 피드백" className="mt-4 rounded-[22px] border border-[#d7e8f6] bg-[#f4f9ff] p-4">
        <div className="flex items-center gap-2">
          <h3 className="shrink-0 text-sm font-bold text-[#277fbf]">BABI 피드백</h3>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] whitespace-nowrap text-[#657f8e]">하루 기록 요약</span>
          <img src="/ai-report-mascot.svg" alt="" width="32" height="38" className="ml-auto h-[38px] w-8 shrink-0 object-contain" />
        </div>
        <p className="mt-2 text-sm leading-[23px] whitespace-pre-line wrap-anywhere text-[#334e60]">{report.feedback}</p>
      </section>
      <section aria-label={`${report.name} 기록 타임라인`} className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-bold text-[#172027]">기록 타임라인</h3>
          <span className="rounded-full bg-[#edf2f5] px-2.5 py-1 text-[11px] font-medium text-[#536975]">최근 {recentRecords.length}회</span>
        </div>
        <p className="mt-3 mb-3 pl-[38px] text-[11px] font-medium text-[#64727a]">{aiReportDate.replaceAll('-', '. ')}</p>
        <div className="relative">
          {recentRecords.length > 1 && <span aria-hidden="true" className="pointer-events-none absolute top-[14px] bottom-[14px] left-[13px] w-0.5 bg-[#dbe2e6]" />}
          <ol className="space-y-3.5">
            {recentRecords.map((record, index) => (
              <li key={`${record.time}-${index}`} className="relative flex items-start gap-2.5">
                <span aria-hidden="true" className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border ${style.marker}`}><AiReportIcon type={report.type} size={18} /></span>
                <div className="min-w-0 flex-1 rounded-xl border border-[#9aa9b2] bg-white px-2.5 py-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                    <span className="text-[11px] leading-4 font-medium text-[#172027]">{report.name}</span>
                    <span className="text-[11px] leading-4 font-medium text-[#43545e]">{record.time}</span>
                  </div>
                  <p className="text-sm leading-5 font-semibold wrap-anywhere text-[#172027]">{record.value}</p>
                  {record.memo && <p className="mt-1 text-xs leading-5 whitespace-pre-line wrap-anywhere text-[#65727a]">{record.memo}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </Modal>
  )
}

// 카드와 모달에서 함께 쓰는 아이콘
function AiReportIcon({ type, size = 34 }: { type: AiReportType; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === 'sleep' && <path d="M18 3A15 15 0 1 0 33 19 12 12 0 0 1 18 3Z" />}
      {type === 'feeding' && <g transform="rotate(43 18 18)">
        <path d="M15 8V5a3 3 0 0 1 6 0v3M13 8h10v5H13zM13 13h10l2 3v14a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3V16z" /><path d="M11 21h5M11 27h5" />
      </g>}
      {type === 'temperature' && <>
        <path d="M13 7a5 5 0 0 1 10 0v12a10 10 0 1 1-10 0Z" /><path d="M18 10v13" /><circle cx="18" cy="27" r="5" fill="currentColor" fillOpacity=".12" />
      </>}
      {type === 'crying' && <><circle cx="18" cy="18" r="15" /><path d="M9 16v4M14 11v14M19 14v8M24 10v16M29 15v6" /></>}
    </svg>
  )
}
