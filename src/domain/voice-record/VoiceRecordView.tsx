import Mascot from "../../shared/components/Mascot";
import MicIcon from "../../shared/components/MicIcon";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import useRecorder from "../../shared/utils/useRecorder";
import { parseVoiceRecord, saveVoiceRecord } from "./api";
import type { ParsedVoiceRecord } from "./types";

type Step = "idle" | "recording" | "analyzing" | "confirm" | "done";

interface Props {
  onGoRecords?: () => void;
}

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
      setApiError(
        e instanceof Error
          ? e.message
          : "문제가 생겼어요. 다시 시도해주세요."
      );
      setStep("idle");
    }
  }, []);

  const { start, stop, error } = useRecorder({
    onStop: handleStop,
    onError: () => setStep("idle"),
    maxMs: 30000,
  });

  const onMic = async () => {
    setApiError(null);

    if (step === "recording") return stop();
    if (await start()) setStep("recording");
  };

  const onSave = async () => {
    if (!parsed) return;

    try {
      await saveVoiceRecord(parsed);
      setStep("done");
    } catch (e) {
      setApiError(
        e instanceof Error
          ? e.message
          : "문제가 생겼어요. 다시 시도해주세요."
      );
    }
  };

  const showMic = step === "idle" || step === "recording";

  if (!showMic) {
    return (
      <main className="babi-voice-shell flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8f9] text-[#101010]">
        <section
          aria-label="음성 육아 기록"
          aria-busy={step === "analyzing"}
          className={`babi-screen babi-screen--voice babi-screen--voice-${step}`}
        >
          {step === "analyzing" && (
            <div className="flex w-full flex-col items-center gap-10 pt-[60px]">
              <img
                src="/ai-report-mascot.svg"
                alt="BABI 코끼리 캐릭터"
                className="h-auto w-[180px] shrink-0"
              />

              <h2 className="babi-voice-title">
                <span>기록을 정리하고 있어요...</span>
              </h2>
            </div>
          )}

          {step === "confirm" && parsed && (
            <>
              <div className="babi-voice-confirm-content">
                <div className="babi-note">
                  <svg className="babi-note__clip" width="28" height="80" viewBox="0 0 32 80" fill="none" stroke="#285b9a" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M26 30V12a10 10 0 0 0-20 0v50a8 8 0 0 0 16 0V25a5 5 0 0 0-10 0v31" />
                  </svg>
                  <p className="babi-note__text">“{parsed.transcript}”</p>
                  <Mascot size={56} className="babi-note__mascot" />
                </div>
                <h2>이 내용이 맞나요?</h2>
              </div>
              <div className="babi-voice-actions">
                {apiError && <p className="babi-error" role="alert">{apiError}</p>}
                <button type="button" className="babi-btn babi-btn--dark" onClick={onSave}>저장하기</button>
                <button type="button" className="babi-btn babi-btn--grey" onClick={() => setStep("idle")}>다시 녹음하기</button>
              </div>
            </>
          )}

          {step === "done" && (
            <>
              <div className="babi-voice-result-content">
                <div className="babi-voice-result-mascot"><Mascot /></div>
                <h2>기록이 정상적으로<br />저장되었어요!</h2>
              </div>
              <div className="babi-voice-actions">
                <button type="button" className="babi-btn babi-btn--dark" onClick={() => onGoRecords ? onGoRecords() : navigate("/care-record")}>기록 확인하러가기</button>
                <button type="button" className="babi-btn babi-btn--grey" onClick={() => setStep("idle")}>이전 페이지로가기</button>
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <section
      aria-label="음성 육아 기록"
      aria-busy={false}
      className={`babi-screen babi-screen--voice babi-screen--voice-home babi-screen--voice-${step}`}
    >
      <div className="babi-voice-mascot">
        <Mascot />
      </div>

      {step === "idle" && (
        <h2 className="babi-voice-title">
          <span>반가워요!</span>
          <span>어떤 일이 있나요?</span>
        </h2>
      )}

      {step === "recording" && (
        <p className="babi-voice-caption">
          “방금 막 잠들었어...”
        </p>
      )}

      {showMic && (
        <div className="babi-voice-controls">
          <button
            type="button"
            className={`babi-voice-mic ${
              step === "recording" ? "is-recording" : ""
            }`}
            onClick={onMic}
            aria-label={
              step === "recording" ? "녹음 종료" : "음성 녹음"
            }
            aria-pressed={step === "recording"}
            aria-describedby="voice-record-hint"
          >
            <MicIcon />
          </button>

          <p
            id="voice-record-hint"
            className={`babi-voice-hint ${
              apiError || error
                ? "babi-voice-hint--error"
                : ""
            }`}
            role={apiError || error ? "alert" : "status"}
          >
            {apiError ||
              error ||
              (step === "recording"
                ? "듣는 중입니다…"
                : "버튼을 눌러 음성 기록을 시작하세요")}
          </p>
        </div>
      )}
    </section>
  );
}
