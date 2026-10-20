type CalendarTab = 'schedule' | 'growth' | 'vaccination'

const calendarTabs: { key: CalendarTab; label: string; colorClassName: string }[] = [
  { key: 'schedule', label: '일정', colorClassName: 'text-[#4d9fff]' },
  { key: 'growth', label: '성장 기록', colorClassName: 'text-[#63c980]' },
  { key: 'vaccination', label: '예방 접종', colorClassName: 'text-[#aa83ff]' },
]

function CalendarTabIcon({ tab }: { tab: CalendarTab }) {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {tab === 'schedule' && <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 2v6M17 2v6M3 11h18" />
      </>}
      {tab === 'growth' && <path d="M4 20V14h3v6M11 20V9h3v11M18 20V3h3v17" />}
      {tab === 'vaccination' && <path d="m5 19 3-3m-5 5 2-2m2-6 6-6 5 5-6 6-5-5Zm6-9 7 7m-2-9 4 4m-4-2-3 3m5-1-3 3m-9 2 3 3" />}
    </svg>
  )
}

export default function GrowthTabs() {
  return (
    <nav className="mb-4 grid grid-cols-3 rounded-[17px] border border-[#d6d6d6] bg-white" aria-label="캘린더 메뉴">
      {calendarTabs.map((tab) => (
        <button key={tab.key} type="button"
          className={`flex min-h-12 items-center justify-center gap-[7px] rounded-2xl border px-[2px] py-2 text-base leading-normal font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#256b3c] max-[360px]:gap-1 max-[360px]:text-sm ${tab.colorClassName} ${
            tab.key === 'growth' ? 'border-[#63c980] bg-[#f0f8f2]' : 'border-transparent bg-transparent'
          }`}
          aria-current={tab.key === 'growth' ? 'page' : undefined}
          disabled={tab.key !== 'growth'}>
          <CalendarTabIcon tab={tab.key} />
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
