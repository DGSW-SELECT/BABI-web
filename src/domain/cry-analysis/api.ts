import { request, USE_MOCK } from "../../global/api/client";
import { mockAnalyzeCry, mockOk } from "../../global/api/mock";
import type { CryAnalysisResult } from "./types";

// TODO: 엔드포인트/필드는 "최종 API 명세서"에 맞게 수정

/** 울음소리 분석 (AI 분석은 백엔드) */
export function analyzeCry(audio: Blob): Promise<CryAnalysisResult> {
  if (USE_MOCK) return mockAnalyzeCry();
  const form = new FormData();
  form.append("audio", audio, "cry.webm");
  return request<CryAnalysisResult>("/api/cry-analysis", { method: "POST", body: form });
}

/** 분석 결과를 기록으로 저장 */
export function saveCryRecord(result: CryAnalysisResult): Promise<{ ok: boolean }> {
  if (USE_MOCK) return mockOk();
  return request<{ ok: boolean }>("/api/cry-analysis/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });
}
