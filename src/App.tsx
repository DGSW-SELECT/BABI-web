import { useRef, useState } from "react";
import {
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router";
import AiReportPage from "./domain/ai-report/AiReportPage";
import GrowthPage from "./domain/growth/GrowthPage";
import CareRecordPage from "./domain/care-record/CareRecordPage";
import GrowthForm from "./domain/growth/GrowthForm";
import { growthRecords } from "./domain/growth/growthData";
import type { GrowthRecord } from "./domain/growth/growthData";
import Footer from "./global/navigation/Footer";
import { useInputViewport } from "./shared/hooks/useInputViewport";
import "./App.css";

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

function AppLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [records, setRecords] = useState<GrowthRecord[]>(growthRecords);
  const { height, offsetTop, isEditing, finishEditing } =
    useInputViewport(containerRef);

  function closeGrowthForm() {
    finishEditing();
    navigate("/growth", { replace: true });
  }

  function addGrowthRecord(record: GrowthRecord) {
    setRecords((oldRecords) => [...oldRecords, record]);
    closeGrowthForm();
  }

  return (
    <div
      ref={containerRef}
      className="fixed right-0 left-0 mx-auto flex w-full max-w-[402px] flex-col overflow-hidden bg-[#f7f8f9] shadow-[0_0_24px_rgba(0,0,0,0.08)]"
      style={{ top: offsetTop, height: height || "100dvh" }}
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/ai-report" replace />} />
          <Route path="/ai-report" element={<AiReportPage />} />
          <Route
            path="/care-record"
            element={<CareRecordPage onFinishEditing={finishEditing} />}
          />
          <Route path="/growth" element={<GrowthPage records={records} />} />
          <Route
            path="/growth/new"
            element={
              <GrowthForm
                onSave={addGrowthRecord}
                onClose={closeGrowthForm}
                isEditing={isEditing}
                onFinishEditing={finishEditing}
              />
            }
          />
          <Route
            path="*"
            element={
              <main className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center text-[#43545e]">
                <h1 className="text-lg font-bold">페이지를 찾을 수 없어요</h1>
                <Link
                  to="/ai-report"
                  className="rounded-xl bg-white px-4 py-3 text-sm text-[#399fff]"
                >
                  AI 육아 리포트로 이동
                </Link>
              </main>
            }
          />
        </Routes>
      </div>
      {!isEditing && (
        <div className="relative h-[87px] shrink-0">
          <Footer />
        </div>
      )}
    </div>
  );
}
