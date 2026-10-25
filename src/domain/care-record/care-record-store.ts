import { useSyncExternalStore } from "react";
import { demoBaby, demoCaregivers, initialRecords } from "./care-record-data";
import type { CareRecord } from "./care-record-data";
import { parseRecordDate } from "./record-date";

let records: CareRecord[] = initialRecords;
const listeners = new Set<() => void>();

function isCareRecord(value: unknown): value is CareRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<CareRecord>;
  const icons = { 수유: "feed", 울음: "cry", 수면: "sleep", 체온: "temperature" };
  return typeof record.id === "string" && record.id.length > 0
    && record.babyId === demoBaby.babyId
    && demoCaregivers.some((member) => member.id === record.authorId)
    && typeof record.date === "string" && parseRecordDate(record.date) !== null
    && typeof record.createdAt === "string" && Number.isFinite(Date.parse(record.createdAt))
    && typeof record.category === "string" && Object.hasOwn(icons, record.category)
    && record.icon === icons[record.category]
    && typeof record.title === "string" && typeof record.value === "string"
    && typeof record.time === "string" && (record.note === undefined || typeof record.note === "string");
}

function getSnapshot(): CareRecord[] {
  return records;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => { listeners.delete(onChange); };
}

export function useSharedCareRecords() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initialRecords);
}

export function saveSharedCareRecord(record: CareRecord) {
  if (!isCareRecord(record)) throw new Error("기록 정보를 확인해주세요.");
  // Keep demo records only for this page session, until the browser reloads.
  records = [...records, record];
  listeners.forEach((onChange) => onChange());
}
