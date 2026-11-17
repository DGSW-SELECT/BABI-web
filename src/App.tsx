import { useEffect, useRef, useState } from "react";
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

import { SessionBoundary, RequireSession } from "./domain/auth/session";
import { useSession, getReturnPath } from "./domain/auth/useSession";
import InvitationPage from "./domain/family/InvitationPage";
import FamilyAccountManagement from "./domain/family/FamilyAccountManagement";
import AiReportHistoryPage from "./domain/ai-report/AiReportHistoryPage";
import { login } from "./global/api/auth";
import AuthView from "./domain/auth/AuthView";
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
import MyPage from "./domain/my-page/MyPage";
import { getBabyPhoto, saveBabyPhoto, mapMyPageData } from "./domain/my-page/myPageData";
import type { BabyProfileInput, MyPageData } from "./domain/my-page/myPageData";
import { getLoginEmail, rememberLogin } from "./domain/auth/authApi";
import { createBaby, getBabies, getBaby, getBabyMembers, updateBaby } from "./domain/family/familyApi";
import type { Baby, BabyInput } from "./domain/family/familyApi";
import { aiReportBaby, aiReportNotifications } from "./domain/ai-report/aiReportData";
import AiReportPage from "./domain/ai-report/AiReportPage";
import Header from "./global/navigation/header/Header";
import Footer from "./global/navigation/Footer";
import { useInputViewport } from "./shared/hooks/useInputViewport";
import "./App.css";
import "./shared/styles/babi.css";

const ENABLE_HEADER_PREVIEW = true;
const headerPreviewPaths = ["/care-record", "/family", "/schedule", "/growth", "/vaccination", "/ai-report/records"];

export default function App() {
  return <HashRouter><AppRoutes /></HashRouter>;
}

function AppRoutes() {
  const location = useLocation();
  const { userId } = useSession();
  const returnPath = location.state?.fromFamily === true ? "/family/manage" : getReturnPath(location.search);
  async function handleLogin(email: string, password: string) {
    const token = await login(email, password);
    rememberLogin(token, email);
  }
  // 이메일의 일반 URL과 기존 #/family?code=... 링크를 모두 받는다.
  const code = new URLSearchParams(location.search).get("code") ?? new URLSearchParams(window.location.search).get("code");
  if (code && !["/invite", "/login", "/signup"].includes(location.pathname)) return <Navigate to={`/invite?code=${encodeURIComponent(code)}`} replace />;
  return <Routes>
    <Route path="/" element={<Navigate to="/voice-record" replace />} />
    <Route path="/login" element={userId === null ? <AuthView key="login" onLogin={handleLogin} /> : <Navigate to={returnPath} replace />} />
    <Route path="/signup" element={userId === null ? <AuthView key="signup" onLogin={handleLogin} /> : <Navigate to={returnPath} replace />} />
    <Route path="/invite" element={<SessionBoundary><RequireSession><InvitationPage key={userId} /></RequireSession></SessionBoundary>} />
    <Route path="/*" element={<AppLayout key={userId} />} />
  </Routes>;
}

function AppLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { token, userId } = useSession();
  const [records, setRecords] = useState<GrowthRecord[]>(growthRecords);
  const [vaccinations, setVaccinations] =
    useState<VaccinationSchedule[]>(createVaccinationSchedules);
  const [schedules, setSchedules] = useState<Schedule[]>(createSchedules);
  const [selectedDate, setSelectedDate] = useState(getDateKey);
  const [showHandoff, setShowHandoff] = useState(false);
  const [handoffMemo, setHandoffMemo] = useState("");
  const [myPageData, setMyPageData] = useState<MyPageData | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<number | null>(() => { const id = Number(new URLSearchParams(search).get("babyId")); return Number.isSafeInteger(id) && id > 0 ? id : null; });
  const [myPageLoading, setMyPageLoading] = useState(true);
  const [myPageError, setMyPageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const email = getLoginEmail();
  const usesPersonalGroup = pathname !== "/family/manage" && pathname !== "/family/integration";

  useEffect(() => {
    if (userId === null || !usesPersonalGroup) return;
    let active = true;
    async function loadGroup() {
      if (userId === null) throw new Error("로그인 정보가 없어요. 다시 로그인해주세요.");
      const list = await getBabies();
      const selected = list.find((baby) => baby.babyId === selectedBabyId) ?? list[0];
      if (!selected) return { list, data: null };
      const [baby, members] = await Promise.all([getBaby(selected.babyId), getBabyMembers(selected.babyId)]);
      return { list, data: mapMyPageData({ ...baby, photoUrl: getBabyPhoto(userId, baby.babyId) }, members, userId, email) };
    }
    loadGroup().then(({ list, data }) => {
      if (!active) return;
      setBabies(list);
      setMyPageData(data);
      setMyPageError("");
    }).catch((error: unknown) => {
      if (!active) return;
      setBabies([]);
      setMyPageData(null);
      setMyPageError(error instanceof Error ? error.message : "아기와 멤버 정보를 불러오지 못했어요.");
    }).finally(() => { if (active) setMyPageLoading(false); });
    return () => { active = false; };
  }, [userId, email, selectedBabyId, reloadKey, usesPersonalGroup]);

  function reloadMyPage() {
    setMyPageLoading(true);
    setMyPageError("");
    setMyPageData(null);
    setReloadKey((key) => key + 1);
  }

  function selectBaby(babyId: number) {
    if (babyId === myPageData?.baby.babyId) return;
    setMyPageLoading(true);
    setMyPageError("");
    setMyPageData(null);
    setSelectedBabyId(babyId);
  }

  async function saveBaby(input: BabyProfileInput) {
    if (!myPageData || userId === null || myPageData.ownerId !== userId) throw new Error("관리자만 아기 정보를 수정할 수 있어요.");
    const { name, birthDate } = input;
    const saved = name === myPageData.baby.name && birthDate === myPageData.baby.birthDate
      ? myPageData.baby
      : await updateBaby(myPageData.baby.babyId, { name, birthDate });
    const photoUrl = input.photoUrl ?? myPageData.baby.photoUrl ?? "";
    const baby = { ...saved, photoUrl };
    setBabies((previous) => previous.map((item) => item.babyId === baby.babyId ? baby : item));
    setMyPageData((previous) => previous?.baby.babyId === baby.babyId ? { ...previous, baby: { ...previous.baby, ...baby } } : previous);
    saveBabyPhoto(userId, baby.babyId, photoUrl);
  }

  async function registerBaby(input: BabyInput) {
    if (userId === null) throw new Error("아기를 등록하려면 로그인해주세요.");
    const baby = await createBaby(input);
    setMyPageLoading(true);
    setSelectedBabyId(baby.babyId);
  }

  const showHeaderPreview = ENABLE_HEADER_PREVIEW && headerPreviewPaths.includes(pathname);
  const showHeader = pathname === "/voice-record" || pathname.startsWith("/ai-report") || showHeaderPreview;
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
      data-header-preview={showHeaderPreview || undefined}
      className="fixed right-0 left-0 mx-auto flex w-full max-w-[402px] flex-col overflow-hidden bg-[#f7f8f9] shadow-[0_0_24px_rgba(0,0,0,0.08)]"
      style={{ top: offsetTop, height: height || "100dvh" }}
    >
      <div data-app-header className={showHeader ? "shrink-0" : "hidden"}>
        <Header
          baby={userId === null ? aiReportBaby : myPageData?.baby ?? babies.find((baby) => baby.babyId === selectedBabyId) ?? { babyId: 0, name: myPageLoading ? "불러오는 중…" : "아기를 등록해주세요" }}
          babies={babies}
          onBabyChange={selectBaby}
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
          <Route path="/ai-report/records" element={<AiReportHistoryPage />} />
          <Route path="/family" element={<SessionBoundary><RequireSession><MyPage key={myPageData?.baby.babyId ?? "no-baby"} onGroupChanged={(left) => { if (left) setSelectedBabyId(null); reloadMyPage(); }} data={myPageData} userId={userId} email={email} loading={myPageLoading} error={myPageError} onRetry={reloadMyPage} onSaveBaby={saveBaby} onCreateBaby={registerBaby} /></RequireSession></SessionBoundary>} />
          <Route path="/family/integration" element={<Navigate to="/family/manage" replace />} />
          <Route path="/family/manage" element={<FamilyAccountManagement token={token} onBabyChange={selectBaby} selectedBabyId={selectedBabyId ?? myPageData?.baby.babyId} />} />
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
