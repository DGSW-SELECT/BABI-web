import { useLocation, useNavigate } from 'react-router'

type CalendarTab = 'schedule' | 'growth' | 'vaccination'

const calendarTabs: { key: CalendarTab; label: string; colorClassName: string; selectedClassName: string }[] = [
  { key: 'schedule', label: '일정', colorClassName: 'text-[#4d9fff]', selectedClassName: 'border-[#4d9fff] bg-[#eef6ff]' },
  { key: 'growth', label: '성장 기록', colorClassName: 'text-[#63c980]', selectedClassName: 'border-[#63c980] bg-[#f0f8f2]' },
  { key: 'vaccination', label: '예방 접종', colorClassName: 'text-[#aa83ff]', selectedClassName: 'border-[#aa83ff] bg-[#f7f3fc]' },
]

export function CalendarTabIcon({ tab }: { tab: CalendarTab }) {
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

export default function CalendarTabs() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const selectedTab = pathname.startsWith('/vaccination') ? 'vaccination' : pathname.startsWith('/growth') ? 'growth' : 'schedule'

  return (
    <nav className="mb-4 grid grid-cols-3 rounded-[17px] border border-[#d6d6d6] bg-white" aria-label="캘린더 메뉴">
      {calendarTabs.map((tab) => (
        <button key={tab.key} type="button" onClick={() => navigate(`/${tab.key}`)}
          className={`flex min-h-12 items-center justify-center gap-[7px] rounded-2xl border px-[2px] py-2 text-base leading-normal font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#256b3c] max-[360px]:gap-1 max-[360px]:text-sm ${tab.colorClassName} ${
            tab.key === selectedTab ? tab.selectedClassName : 'border-transparent bg-transparent'
          }`}
          aria-current={tab.key === selectedTab ? 'page' : undefined}
          aria-label={tab.key === 'schedule' ? '일정 (준비 중)' : undefined}
          disabled={tab.key === 'schedule'}>
          <CalendarTabIcon tab={tab.key} />
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
