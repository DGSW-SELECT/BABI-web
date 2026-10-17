import CalendarGrowth from './domain/growth/CalendarGrowth'
import { growthMockComparison, growthMockRecords } from './domain/growth/growthMockData'

function App() {
  return (
    <div className="min-h-svh bg-[#f7f8f9]">
      {/* 서버 연결 전 미리보기입니다. 실제 응답은 item과 비교 응답을 각각 전달합니다. */}
      <CalendarGrowth records={growthMockRecords} comparison={growthMockComparison} />
    </div>
  )
}

export default App
