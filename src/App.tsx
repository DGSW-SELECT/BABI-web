import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "./shared/components/PageLayout";
import VoiceRecordView from "./domain/voice-record/VoiceRecordView";
import CryAnalysisView from "./domain/cry-analysis/CryAnalysisView";
import ActivityRecommendView from "./domain/activity-recommend/ActivityRecommendView";
import CareRecordView from "./domain/care-record/CareRecordView";
import "./shared/styles/babi.css";

// /voice-record, /cry-analysis, /activity-recommend 각각 독립된 View 페이지
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Navigate to="/voice-record" replace />} />
          <Route path="/voice-record" element={<VoiceRecordView />} />
          <Route path="/care-record" element={<CareRecordView />} />
          <Route path="/cry-analysis" element={<CryAnalysisView />} />
          <Route path="/activity-recommend" element={<ActivityRecommendView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
