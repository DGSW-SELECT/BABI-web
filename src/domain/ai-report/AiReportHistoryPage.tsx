import { useState } from 'react'
import { Link } from 'react-router'
import AiReportPage from './AiReportPage'
import { aiReportHistory } from './aiReportData'

export default function AiReportHistoryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = aiReportHistory.find((report) => report.id === selectedId)
  const backClass = 'absolute left-0 flex size-11 items-center justify-center rounded-xl text-[#121212] hover:bg-[#edf2f6] focus-visible:outline-2 focus-visible:outline-[#7895bb]'
  const arrow = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>

  if (selected) return <AiReportPage key={selected.id} items={selected.items} date={selected.endedAt.slice(0, 10)} comment={selected.comment}
    period={`${selected.caregiverName} · ${formatTime(selected.startedAt)} ~ ${formatTime(selected.endedAt)}`} onBack={() => setSelectedId(null)} />

  return <main className="flex h-full min-h-0 flex-col bg-[#f7f8f9] text-[#121212]">
    <header className="page-title-header shrink-0 px-5">
      <div className="relative flex min-h-11 items-center justify-center">
        <Link to="/ai-report" aria-label="AI 육아 리포트로 돌아가기" className={backClass}>{arrow}</Link>
        <h1 className="page-title">지난 리포트</h1>
      </div>
    </header>
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-8">
      {aiReportHistory.map((report) => <button key={report.id} type="button" aria-label={`${report.caregiverName}의 돌봄 리포트 보기`} onClick={() => setSelectedId(report.id)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-[17px] border border-[#d6d6d6] bg-white p-5 text-left transition-colors hover:bg-[#f0f6fc] focus-visible:outline-2 focus-visible:outline-[#7895bb]">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{report.caregiverName}의 돌봄 리포트</h2>
          <p className="mt-2 text-xs leading-6 text-[#78848f]"><time dateTime={report.startedAt}>{formatTime(report.startedAt)}</time><br />~ <time dateTime={report.endedAt}>{formatTime(report.endedAt)}</time></p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#43545e]">{report.summary}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0 text-[#7895bb]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
      </button>)}
    </div>
  </main>
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
}
