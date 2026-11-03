import { useRef, useState } from "react";
import {
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import AiReportPage from "./domain/ai-report/AiReportPage";
import GrowthPage from "./domain/growth/GrowthPage";
import CareRecordPage from "./domain/care-record/CareRecordPage";
import VoiceRecordView from "./domain/voice-record/VoiceRecordView";
import ActivityRecommendView from "./domain/activity-recommend/ActivityRecommendView";
import CryAnalysisView from "./domain/cry-analysis/CryAnalysisView";
import GrowthForm from "./domain/growth/GrowthForm";
import { growthRecords } from "./domain/growth/growthData";
import type { GrowthRecord } from "./domain/growth/growthData";
import VaccinationPage from "./domain/vaccination/VaccinationPage";
import VaccinationForm from "./domain/vaccination/VaccinationForm";
import { createVaccinationSchedules } from "./domain/vaccination/vaccinationData";
import type { VaccinationSchedule } from "./domain/vaccination/vaccinationData";
import SchedulePage from "./domain/schedule/SchedulePage";
import ScheduleForm from "./domain/schedule/ScheduleForm";
import { createSchedules, getDateKey } from "./domain/schedule/scheduleData";
import type { Schedule } from "./domain/schedule/scheduleData";
import HandoffDialog from "./domain/handoff/HandoffDialog";
import { aiReportBaby, aiReportNotifications } from "./domain/ai-report/aiReportData";
import Header from "./global/navigation/header/Header";
import Footer from "./global/navigation/Footer";
import { useInputViewport } from "./shared/hooks/useInputViewport";
import "./App.css";
import "./shared/styles/babi.css";

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
  const { pathname } = useLocation();
  const [records, setRecords] = useState<GrowthRecord[]>(growthRecords);
  const [vaccinations, setVaccinations] =
    useState<VaccinationSchedule[]>(createVaccinationSchedules);
  const [schedules, setSchedules] = useState<Schedule[]>(createSchedules);
  const [selectedDate, setSelectedDate] = useState(getDateKey);
  const [showHandoff, setShowHandoff] = useState(false);
  const [handoffMemo, setHandoffMemo] = useState("");
  const showHeader = pathname === "/voice-record" || pathname === "/ai-report";
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

  function updateGrowthRecord(record: GrowthRecord) {
    setRecords((previous) =>
      previous.map((item) => item.id === record.id ? record : item),
    );
    closeGrowthForm();
  }

  function closeVaccinationForm() {
    finishEditing();
    navigate("/vaccination", { replace: true });
  }

  function addVaccination(schedule: VaccinationSchedule) {
    setVaccinations((previous) => [...previous, schedule]);
    closeVaccinationForm();
  }

  function updateVaccination(schedule: VaccinationSchedule) {
    setVaccinations((previous) =>
      previous.map((item) =>
        item.vaccinationScheduleId === schedule.vaccinationScheduleId
          ? schedule
          : item,
      ),
    );
    closeVaccinationForm();
  }

  function changeVaccinationStatus(id: number, completedDate: string | null) {
    setVaccinations((previous) =>
      previous.map((item) =>
        item.vaccinationScheduleId === id
          ? { ...item, completedDate, completed: completedDate !== null }
          : item,
      ),
    );
  }

  function closeScheduleForm() {
    finishEditing();
    navigate("/schedule", { replace: true });
  }

  function addSchedule(schedule: Schedule) {
    setSchedules((previous) => [...previous, schedule]);
    setSelectedDate(schedule.date);
    closeScheduleForm();
  }

  function deleteSchedule(id: number) {
    setSchedules((previous) => previous.filter((item) => item.id !== id));
  }

  function closeHandoff() {
    finishEditing();
    setShowHandoff(false);
  }

  function saveHandoff(memo: string) {
    setHandoffMemo(memo);
    closeHandoff();
  }

  return (
    <div
      ref={containerRef}
      className="fixed right-0 left-0 mx-auto flex w-full max-w-[402px] flex-col overflow-hidden bg-[#f7f8f9] shadow-[0_0_24px_rgba(0,0,0,0.08)]"
      style={{ top: offsetTop, height: height || "100dvh" }}
    >
      <div className={showHeader ? "shrink-0" : "hidden"}>
        <Header
          baby={aiReportBaby}
          notifications={aiReportNotifications}
          onHandoff={() => setShowHandoff(true)}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/voice-record" replace />} />
          <Route path="/voice-record" element={<VoiceRecordView />} />
          <Route path="/activity-recommend" element={<ActivityRecommendView />} />
          <Route path="/cry-analysis" element={<CryAnalysisView />} />
          <Route path="/ai-report" element={<AiReportPage />} />
          <Route
            path="/care-record"
            element={<CareRecordPage onFinishEditing={finishEditing} />}
          />
          <Route
            path="/schedule"
            element={
              <SchedulePage
                schedules={schedules}
                records={records}
                vaccinations={vaccinations}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onDelete={deleteSchedule}
              />
            }
          />
          <Route
            path="/schedule/new"
            element={
              <ScheduleForm
                date={selectedDate}
                onSave={addSchedule}
                onClose={closeScheduleForm}
              />
            }
          />
          <Route path="/growth" element={<GrowthPage records={records} />} />
          <Route
            path="/growth/new"
            element={
              <GrowthForm
                onSave={addGrowthRecord}
                onClose={closeGrowthForm}
              />
            }
          />
          <Route
            path="/growth/:recordId/edit"
            element={
              <GrowthEditPage
                records={records}
                onSave={updateGrowthRecord}
                onClose={closeGrowthForm}
              />
            }
          />
          <Route
            path="/vaccination"
            element={
              <VaccinationPage
                schedules={vaccinations}
                onChangeStatus={changeVaccinationStatus}
              />
            }
          />
          <Route
            path="/vaccination/new"
            element={
              <VaccinationForm
                schedules={vaccinations}
                onSave={addVaccination}
                onClose={closeVaccinationForm}
              />
            }
          />
          <Route
            path="/vaccination/:scheduleId/edit"
            element={
              <VaccinationEditPage
                schedules={vaccinations}
                onSave={updateVaccination}
                onClose={closeVaccinationForm}
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
      {showHandoff && (
        <HandoffDialog
          memo={handoffMemo}
          onSave={saveHandoff}
          onClose={closeHandoff}
          height={height}
          offsetTop={offsetTop}
        />
      )}
    </div>
  );
}

function GrowthEditPage({
  records,
  onSave,
  onClose,
}: {
  records: GrowthRecord[];
  onSave: (record: GrowthRecord) => void;
  onClose: () => void;
}) {
  const { recordId } = useParams();
  const record = records.find((item) => String(item.id) === recordId);
  if (!record) return <Navigate to="/growth" replace />;
  return (
    <GrowthForm
      key={record.id}
      record={record}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function VaccinationEditPage({
  schedules,
  onSave,
  onClose,
}: {
  schedules: VaccinationSchedule[];
  onSave: (schedule: VaccinationSchedule) => void;
  onClose: () => void;
}) {
  const { scheduleId } = useParams();
  const schedule = schedules.find(
    (item) => String(item.vaccinationScheduleId) === scheduleId,
  );
  if (!schedule) return <Navigate to="/vaccination" replace />;
  return (
    <VaccinationForm
      key={schedule.vaccinationScheduleId}
      schedule={schedule}
      schedules={schedules}
      onSave={onSave}
      onClose={onClose}
    />
  );
}
