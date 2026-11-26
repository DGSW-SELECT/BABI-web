import { request } from "../../global/api/sessionClient";
import type { CareRecord, Category } from "./care-record-data";
import { formatRecordDate } from "./record-date";

const types = { 수유: "FEEDING", 수면: "SLEEP", 체온: "TEMPERATURE", 울음: "CRY" } as const;
const display = {
  FEEDING: ["수유", "feed"],
  SLEEP: ["수면", "sleep"],
  TEMPERATURE: ["체온", "temperature"],
  CRY: ["울음", "cry"],
  DIAPER: ["기저귀", "diaper"],
} as const;

type ServerRecord = {
  recordId: number;
  babyId: number;
  authorMemberId: number;
  authorNickname?: string;
  recordType: keyof typeof display;
  occurredAt: string;
  amountMl?: number;
  temperatureCelsius?: number;
  note?: string;
};

export function recordDateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export async function listCareRecords(babyId: number, date: string, signal: AbortSignal) {
  const records: CareRecord[] = [];
  const path = `/api/v1/babies/${babyId}/records`;
  for (let page = 0; ; page += 1) {
    const result = await request<{ records: ServerRecord[]; hasNext: boolean }>(
      `${path}?${new URLSearchParams({ date, page: String(page) })}`, { signal },
    );
    for (const item of result.records) {
      const style = display[item.recordType];
      if (!style || item.recordType === "DIAPER") continue;
      const [category, icon] = style;
      const date = new Date(item.occurredAt);
      records.push({
        id: String(item.recordId), babyId: item.babyId,
        authorId: String(item.authorMemberId), authorName: item.authorNickname,
        createdAt: item.occurredAt, date: formatRecordDate(date),
        category: category as Category, title: category, icon,
        time: date.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" }),
        value: item.amountMl != null ? `${item.amountMl}mL` : item.temperatureCelsius != null ? `${item.temperatureCelsius}°C` : "",
        note: item.note,
      });
    }
    if (!result.hasNext) return records;
  }
}

export async function createCareRecord(
  babyId: number, category: Category, date: Date, selection: string, value: string, memo: string,
) {
  const now = new Date();
  const occurredAt = `${recordDateKey(date)}T${now.toTimeString().slice(0, 8)}`;
  const body: Record<string, string | number> = { recordType: types[category], occurredAt };
  if (category === "수유") {
    const amount = value.match(/^(\d+)\s*(?:ml)?$/i);
    if (!amount || Number(amount[1]) <= 0) throw new Error("수유량을 mL 단위로 입력해주세요.");
    body.amountMl = Number(amount[1]);
    body.feedingType = ({ 분유: "FORMULA", 모유: "BREAST_MILK", 이유식: "BABY_FOOD" } as Record<string, string>)[selection] ?? "OTHER";
  }
  if (category === "체온") {
    const match = value.match(/^(\d+(?:\.\d+)?)\s*(?:도|°C)?$/i);
    const temperature = Number(match?.[1]);
    if (!match || temperature < 30 || temperature > 45) throw new Error("체온은 30~45°C 사이로 입력해주세요.");
    body.temperatureCelsius = temperature;
  }
  // 양식의 자유 입력 항목은 구조화된 필드에 대응하지 않는 경우에도 보존한다.
  body.note = [selection, category === "울음" || category === "수면" ? value : "", memo].filter(Boolean).join(" · ");
  await request<ServerRecord>(`/api/v1/babies/${babyId}/records`, {
    method: "POST", body: JSON.stringify(body), retryAuth: false,
  });
}
