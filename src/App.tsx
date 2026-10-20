import { HashRouter, Link, Navigate, Route, Routes } from 'react-router'
import AiReportPage from './domain/ai-report/AiReportPage'
import Footer from './global/navigation/Footer'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  )
}

export function AppLayout() {
  return (
    <div className="fixed inset-y-0 right-0 left-0 mx-auto flex w-full max-w-[402px] flex-col overflow-hidden bg-[#f7f8f9] shadow-[0_0_24px_rgba(0,0,0,0.08)]">
      <div className="min-h-0 flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/ai-report" replace />} />
          <Route path="/ai-report" element={<AiReportPage />} />
          {/* 여기 각자 구현한 페이지 라우팅 하기!!!!! */}
          <Route path="*" element={
            <main className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center text-[#43545e]">
              <h1 className="text-lg font-bold">페이지를 찾을 수 없어요</h1>
              <Link to="/ai-report" className="rounded-xl bg-white px-4 py-3 text-sm text-[#399fff]">
                AI 육아 리포트로 이동
              </Link>
            </main>
          } />
        </Routes>
      </div>
      <div className="relative h-[87px] shrink-0">
        <Footer />
      </div>
    </div>
  )
}
