import Mascot from "../../shared/components/Mascot";
import MicIcon from "../../shared/components/MicIcon";
import { useState, useCallback } from "react";
import useRecorder from "../../shared/utils/useRecorder";
import Wave from "../../shared/components/Wave";
import { analyzeCry, saveCryRecord } from "./api";
import type { CryAnalysisResult } from "./types";

type Step = "idle" | "recording" | "analyzing" | "result";

/** AI 울음소리 분석 */
export default function CryAnalysisView() {
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<CryAnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleStop = useCallback(async (blob: Blob) => {
    setStep("analyzing");
    try {
      setResult(await analyzeCry(blob));
      setStep("result");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해주세요.");
      setStep("idle");
    }
  }, []);

  // 짧은 울음소리 분석이므로 5초 후 자동 종료
  const { start, error } = useRecorder({ onStop: handleStop, maxMs: 5000 });

  const onMic = async () => {
    if (step !== "idle") return;
    setSaved(false);
    setApiError(null);
    if (await start()) setStep("recording");
  };

  const onSave = async () => {
    if (!result) return;
    try {
      await saveCryRecord(result);
      const saved = JSON.parse(localStorage.getItem("babi-cry-records") ?? "[]") as Array<{ label: string; savedAt: string }>;
      localStorage.setItem("babi-cry-records", JSON.stringify([{ label: result.top.title, savedAt: new Date().toISOString() }, ...saved]));
      setSaved(true);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해주세요.");
    }
  };

  return (
    <section className="babi-screen babi-screen--wide babi-screen--cry">
      {step === "idle" && (
        <>
          <Mascot />
          <h2>아기가 울고 있나요?<br />소리를 들려주세요</h2>
          <p className="babi-hint">5초 정도 울음소리를 녹음하면 AI가 분석해요</p>
        </>
      )}

      {(step === "recording" || step === "analyzing") && (
        <>
          <Mascot />
          <h2>{step === "recording" ? "듣고 있어요…" : "분석하고 있어요…"}</h2>
          <Wave />
        </>
      )}

      {step === "result" && result && (
        <>
          <div className="babi-result">
          <div className="babi-col">
          <div className="babi-card babi-card--hero">
            <div style={{ fontSize: 44 }}>{result.top.emoji}</div>
            <h2 style={{ margin: "4px 0" }}>{result.top.title}</h2>
            <p className="babi-hint">{result.top.note}</p>
          </div>

          <div className="babi-card">
            <h3>울음 유형 분석</h3>
            {result.scores.map((s) => (
              <div className="babi-bar" key={s.label}>
                <span>{s.label}</span>
                <div><i style={{ width: `${s.value}%` }} /></div>
                <b>{s.value}%</b>
              </div>
            ))}
          </div>

          </div>
          <div className="babi-col">
          <div className="babi-card">
            <h3>이렇게 해보세요</h3>
            <ol className="babi-tips">
              {result.tips.map((t) => <li key={t}>{t}</li>)}
            </ol>
          </div>

          {apiError && <p className="babi-error" role="alert">{apiError}</p>}
          <p className="babi-warn">참고용 정보이며 의료 진단이 아니에요.</p>
          <button className="babi-btn babi-btn--dark" onClick={onSave} disabled={saved}>
            {saved ? "저장되었어요!" : "울음 기록 저장하기"}
          </button>
          <button className="babi-btn babi-btn--grey" onClick={() => setStep("idle")}>다시 녹음하기</button>
          </div>
          </div>
        </>
      )}

      {step !== "result" && (
        <>
          <div className="babi-spacer" />
          <button
            className={`babi-mic ${step === "recording" ? "is-rec" : ""}`}
            onClick={onMic}
            aria-label="울음소리 녹음"
          ><MicIcon /></button>
          <p className={`babi-hint ${apiError ? "babi-error" : ""}`}>
            {apiError || error || (step === "idle" ? "버튼을 눌러 울음소리를 녹음하세요" : "잠시만 기다려주세요")}
          </p>
        </>
      )}
    </section>
  );
}
