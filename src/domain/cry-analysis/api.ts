import { request, USE_MOCK } from "../../global/api/client";
import { mockAnalyzeCry, mockOk } from "../../global/api/mock";
import type { CryAnalysisResult } from "./types";

type Prediction = { label: string; score: number };
type PredictResponse = { top_prediction: Prediction; predictions: Prediction[] };

const labels: Record<string, { title: string; emoji: string }> = {
  hungry: { title: "배고픔", emoji: "🍼" },
  discomfort: { title: "불편함", emoji: "💭" },
  tired: { title: "졸림", emoji: "😴" },
  belly_pain: { title: "배 불편함", emoji: "💭" },
  burping: { title: "트림", emoji: "🫧" },
};

/** 울음소리 분석 (AI 분석은 백엔드) */
export async function analyzeCry(audio: Blob): Promise<CryAnalysisResult> {
  if (USE_MOCK) return mockAnalyzeCry();
  const form = new FormData();
  const extension = audio.type.includes("mp4") ? "m4a" : audio.type.includes("ogg") ? "ogg" : "webm";
  form.append("file", audio, `cry.${extension}`);
  const response = await fetch("https://ai-babi.prot.kr/api/predict", { method: "POST", body: form });
  if (!response.ok) {
    if (response.status === 429) throw new Error("요청이 너무 많아요. 잠시 후 다시 시도해주세요.");
    if (response.status === 503) throw new Error("분석 요청이 많아요. 잠시 후 다시 시도해주세요.");
    if (response.status === 413) throw new Error("녹음 파일이 너무 커요. 다시 녹음해주세요.");
    throw new Error(`분석에 실패했어요. 다시 시도해주세요. (${response.status})`);
  }
  const data: PredictResponse = await response.json();
  if (!data.top_prediction || !Array.isArray(data.predictions) ||
      !data.predictions.every((item) => typeof item.label === "string" && Number.isFinite(item.score)) ||
      typeof data.top_prediction.label !== "string" || !Number.isFinite(data.top_prediction.score)) {
    throw new Error("분석 결과를 읽을 수 없어요. 다시 시도해주세요.");
  }
  const top = data.top_prediction;
  const category = labels[top.label] ?? { title: top.label, emoji: "💭" };
  return {
    top: { type: top.label, ...category, note: "울음소리에서 추정한 결과예요." },
    scores: data.predictions.map(({ label, score }) => ({ label: labels[label]?.title ?? label, value: Math.round(Math.max(0, Math.min(1, score)) * 100) })),
    tips: ["아기의 상태를 살펴봐 주세요.", "걱정되는 증상이 있으면 의료 전문가에게 상담해 주세요."],
  };
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
