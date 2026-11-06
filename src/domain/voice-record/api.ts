import { request } from "../../global/api/client";
import { mockParseVoiceRecord } from "../../global/api/mock";
import { demoBaby, demoCaregivers } from "../care-record/care-record-data";
import { saveSharedCareRecords } from "../care-record/care-record-store";
import { formatRecordDate } from "../care-record/record-date";
import type { ParsedVoiceRecord } from "./types";

// 백엔드 연결 전에는 브라우저 로컬 데모를 사용합니다. 백엔드 연결 후 VITE_USE_MOCK=false로 전환하세요.
const USE_LOCAL_VOICE_DEMO = import.meta.env.VITE_USE_MOCK !== "false";

const itemSettings = {
  sleep: { category: "수면", icon: "sleep", prefix: "수면" },
  feeding: { category: "수유", icon: "feed", prefix: "수유" },
  temperature: { category: "체온", icon: "temperature", prefix: "체온" },
  cry: { category: "울음", icon: "cry", prefix: "울음" },
} as const;

function valueForItem(type: keyof typeof itemSettings, label: string) {
  const clean = label.replace(/^[^가-힣A-Za-z0-9]+/, "").trim();
  if (type === "feeding") return clean.match(/[\d.]+\s*ml/i)?.[0] ?? (clean.replace(/^수유\s*/, "") || "기록됨");
  if (type === "temperature") return clean.match(/[\d.]+\s*(?:도|°)/)?.[0] ?? (clean.replace(/^체온\s*/, "") || "기록됨");
  if (type === "cry") return clean.match(/[\d.]+\s*(?:회|분)/)?.[0] ?? (clean.replace(/^울음\s*/, "") || "기록됨");
  return clean.replace(/^수면\s*/, "") || "수면 기록";
}

function persistDemoRecord(parsed: ParsedVoiceRecord) {
  const now = new Date();
  const createdAt = now.toISOString();
  const time = new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);
    const records = parsed.items.map((item) => {
    const settings = itemSettings[item.type];
    const raw = valueForItem(item.type, item.label);
    const value = item.type === "temperature" ? raw.replace("°", "도") : raw;
    const milk = parsed.transcript.includes("모유") ? "모유" : "분유";
    const title = item.type === "feeding" ? `수유 (${milk})` : settings.category;
    return {
      id: globalThis.crypto?.randomUUID?.() ?? `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      babyId: demoBaby.babyId,
      authorId: demoCaregivers[0].id,
      createdAt,
      date: formatRecordDate(now),
      category: settings.category,
      title,
      value,
      time,
      note: "",
      icon: settings.icon,
    };
  });

  if (records.length) saveSharedCareRecords(records);
  try {
    const raw = window.localStorage.getItem("babi-voice-records");
    const saved: unknown = raw ? JSON.parse(raw) : [];
    const previous = Array.isArray(saved) ? saved : [];
    window.localStorage.setItem(
      "babi-voice-records",
      JSON.stringify([{ ...parsed, savedAt: createdAt }, ...previous]),
    );
  } catch {
    // The care-record store above is the primary local persistence path.
  }
}

/** 음성 → 육아 기록 분류 (STT/분류는 백엔드) */
export function parseVoiceRecord(audio: Blob): Promise<ParsedVoiceRecord> {
  if (USE_LOCAL_VOICE_DEMO) return mockParseVoiceRecord();
  const form = new FormData();
  form.append("audio", audio, "voice.webm");
  return request<ParsedVoiceRecord>("/api/voice-records/parse", { method: "POST", body: form });
}

/** 확인된 기록 저장 */
export async function saveVoiceRecord(parsed: ParsedVoiceRecord): Promise<{ ok: boolean }> {
  if (USE_LOCAL_VOICE_DEMO) {
    persistDemoRecord(parsed);
    return { ok: true };
  }
  return request<{ ok: boolean }>("/api/voice-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  });
}
