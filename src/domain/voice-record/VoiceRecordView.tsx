import Mascot from "../../shared/components/Mascot";
import MicIcon from "../../shared/components/MicIcon";
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import useRecorder from "../../shared/utils/useRecorder";
import { parseVoiceRecord, saveVoiceRecord } from "./api";
import type { ParsedVoiceRecord } from "./types";

type Step = "idle" | "recording" | "analyzing" | "confirm" | "done";

interface Props {
  onGoRecords?: () => void;
}

/** 음성 기반 육아 자동 기록 */
export default function VoiceRecordView({ onGoRecords }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("idle");
  const [parsed, setParsed] = useState<ParsedVoiceRecord | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleStop = useCallback(async (blob: Blob) => {
    setStep("analyzing");
    try {
      setParsed(await parseVoiceRecord(blob));
      setStep("confirm");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해주세요.");
      setStep("idle");
    }
  }, []);

  const { start, stop, error } = useRecorder({ onStop: handleStop, maxMs: 30000 });

  const onMic = async () => {
    setApiError(null);
    if (step === "recording") return stop();
    if (await start()) setStep("recording");
  };

  const onSave = async () => {
    if (!parsed) return;
    try {
      await saveVoiceRecord(parsed);
      const savedRecords = JSON.parse(localStorage.getItem("babi-voice-records") ?? "[]") as Array<ParsedVoiceRecord & { savedAt: string }>;
      localStorage.setItem("babi-voice-records", JSON.stringify([{ ...parsed, savedAt: new Date().toISOString() }, ...savedRecords]));
      setStep("done");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해주세요.");
    }
  };

  const showMic = step === "idle" || step === "recording";

  return (
    <section className={`babi-screen babi-screen--voice ${step === "idle" ? "babi-screen--voice-idle" : ""} ${step === "recording" ? "babi-screen--recording" : ""} ${step === "confirm" ? "babi-screen--voice-confirm" : ""}`}>
      {(step === "idle" || step === "done" || step === "analyzing") && (
        <Mascot />
      )}

      {step === "recording" && (
        <div className="babi-recording-mascot"><Mascot /></div>
      )}

      {step === "idle" && <h2>반가워요!<br />어떤 일이 있나요?</h2>}

      {step === "recording" && (
        <p className="babi-live-caption">“방금 막 잠들었어...”</p>
      )}

      {step === "analyzing" && <h2>기록을 정리하고 있어요…</h2>}

      {step === "confirm" && parsed && (
        <>
          <div className="babi-note">
            <b>“{parsed.transcript}”</b>
            <Mascot size={48} className="babi-note__mascot" />
          </div>
          <h2>이 내용이 맞나요?</h2>
          {apiError && <p className="babi-error" role="alert">{apiError}</p>}
          <div className="babi-spacer" />
          <button className="babi-btn babi-btn--dark" onClick={onSave}>저장하기</button>
          <button className="babi-btn babi-btn--grey" onClick={() => setStep("idle")}>다시 녹음하기</button>
        </>
      )}

      {step === "done" && (
        <>
          <h2>기록이 정상적으로<br />저장되었어요!</h2>
          <div className="babi-feature-links">
            <Link className="babi-feature-link" to="/activity-recommend">
              오늘의 추천 활동 보기 <span aria-hidden="true">›</span>
            </Link>
            <Link className="babi-feature-link" to="/cry-analysis">
              아기 울음 분석하기 <span aria-hidden="true">›</span>
            </Link>
          </div>
          <div className="babi-spacer" />
          <button className="babi-btn babi-btn--dark" onClick={() => onGoRecords ? onGoRecords() : navigate("/care-record")}>기록 확인하러가기</button>
          <button className="babi-btn babi-btn--grey" onClick={() => setStep("idle")}>이전 페이지로가기</button>
        </>
      )}

      {showMic && (
        <>
          <div className="babi-spacer" />
          <button
            className={`babi-mic ${step === "recording" ? "is-rec" : ""}`}
            onClick={onMic}
            aria-label="음성 녹음"
          ><MicIcon /></button>
          <p className={`babi-hint ${apiError ? "babi-error" : ""}`}>
            {apiError || error || (step === "recording" ? "듣는 중입니다… (누르면 종료)" : "버튼을 눌러 음성 기록을 시작하세요")}
          </p>
        </>
      )}
    </section>
  );
}
