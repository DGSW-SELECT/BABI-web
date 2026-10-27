import { request, USE_MOCK } from "../../global/api/client";
import { mockParseVoiceRecord, mockOk } from "../../global/api/mock";
import type { ParsedVoiceRecord } from "./types";

// TODO: 엔드포인트/필드는 "최종 API 명세서"에 맞게 수정

/** 음성 → 육아 기록 분류 (STT/분류는 백엔드) */
export function parseVoiceRecord(audio: Blob): Promise<ParsedVoiceRecord> {
  if (USE_MOCK) return mockParseVoiceRecord();
  const form = new FormData();
  form.append("audio", audio, "voice.webm");
  return request<ParsedVoiceRecord>("/api/voice-records/parse", { method: "POST", body: form });
}

/** 확인된 기록 저장 */
export function saveVoiceRecord(parsed: ParsedVoiceRecord): Promise<{ ok: boolean }> {
  if (USE_MOCK) return mockOk();
  return request<{ ok: boolean }>("/api/voice-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  });
}
