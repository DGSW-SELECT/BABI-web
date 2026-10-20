import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ParsedVoiceRecord, VoiceItemType } from "../voice-record/types";
import feedingIcon from "../../shared/assets/care-record/feeding.png";
import sleepIcon from "../../shared/assets/care-record/sleep.png";
import temperatureIcon from "../../shared/assets/care-record/temperature.png";

type SavedVoiceRecord = ParsedVoiceRecord & { savedAt: string };
type Filter = "전체" | "수유" | "수면" | "체온" | "울음";
type TimelineKind = VoiceItemType | "cry";
type TimelineItem = {
  id: string;
  type: TimelineKind;
  label: string;
  savedAt: string;
  source: "voice" | "cry" | "manual";
  recordIndex: number;
  itemIndex?: number;
};
type SavedCryRecord = { label: string; savedAt: string };
type SavedManualRecord = { type: TimelineKind; label: string; savedAt: string };

const FILTERS: Filter[] = ["전체", "수유", "수면", "체온", "울음"];
const TYPE_LABEL: Record<TimelineKind, Exclude<Filter, "전체">> = {
  feeding: "수유",
  sleep: "수면",
  temperature: "체온",
  cry: "울음",
};
const TYPE_ICON_SRC: Partial<Record<TimelineKind, string>> = { feeding: feedingIcon, sleep: sleepIcon, temperature: temperatureIcon };

function CryIcon({ size = 22 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 10v4M10 8v8M14 7v10M17 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>;
}

function readRecords(): SavedVoiceRecord[] {
  try {
    return JSON.parse(localStorage.getItem("babi-voice-records") ?? "[]") as SavedVoiceRecord[];
  } catch {
    return [];
  }
}

function getItemValue(item: TimelineItem) {
  const normalized = item.label.replace(/[🍼😴🌡️🌡]/gu, "").trim();
  const category = normalized.match(/\(([^)]+)\)/)?.[1];
  if (item.type === "cry") {
    const detail = normalized.replace(/^울음(?:\s+\([^)]+\))?\s*/, "");
    return [category, detail].filter(Boolean).join(" · ") || "울음 기록";
  }
  if (item.type === "sleep") {
    const detail = normalized.replace(/^수면(?:\s+\([^)]+\))?\s*/, "");
    return !detail || detail === "시작" ? "수면 기록" : detail;
  }
  if (item.type === "feeding") return normalized.replace(/^수유(?:\s+\([^)]+\))?\s*/, "") || "수유 기록";
  return normalized.replace(/^체온(?:\s+\([^)]+\))?\s*/, "") || "체온 기록";
}

function getItemTitle(item: TimelineItem) {
  const category = item.label.match(/\(([^)]+)\)/)?.[1];
  if (category && (item.type === "feeding" || item.type === "sleep")) return `${TYPE_LABEL[item.type]} (${category})`;
  return TYPE_LABEL[item.type];
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

/** 저장한 기록을 날짜별 타임라인으로 확인 */
export default function CareRecordView() {
  const [filter, setFilter] = useState<Filter>("전체");
  const [refresh, setRefresh] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<TimelineKind>("feeding");
  const [newCategory, setNewCategory] = useState("분유");
  const [newValue, setNewValue] = useState("");
  const [newMemo, setNewMemo] = useState("");
  const [newDate, setNewDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const records = useMemo(readRecords, [refresh]);
  const cryRecords = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("babi-cry-records") ?? "[]") as SavedCryRecord[]; }
    catch { return []; }
  }, [refresh]);
  const manualRecords = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("babi-manual-records") ?? "[]") as SavedManualRecord[]; }
    catch { return []; }
  }, [refresh]);
  const items: TimelineItem[] = useMemo(() => [...records.flatMap((record, recordIndex) =>
    record.items.map((item, itemIndex) => ({
      id: `${record.savedAt}-${recordIndex}-${itemIndex}`,
      type: item.type,
      label: item.label,
      savedAt: record.savedAt,
      source: "voice" as const,
      recordIndex,
      itemIndex,
    }))),
    ...cryRecords.map((record, index) => ({ id: `cry-${record.savedAt}-${index}`, type: "cry" as const, label: record.label, savedAt: record.savedAt, source: "cry" as const, recordIndex: index })),
    ...manualRecords.map((record, index) => ({ id: `manual-${record.savedAt}-${index}`, ...record, source: "manual" as const, recordIndex: index })),
  ].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()), [records, cryRecords, manualRecords]);
  const visibleItems = items.filter((item) => filter === "전체" || TYPE_LABEL[item.type] === filter);
  const grouped = visibleItems.reduce<Array<{ date: string; items: TimelineItem[] }>>((groups, item) => {
    const date = dateLabel(item.savedAt);
    const current = groups[groups.length - 1];
    if (current?.date === date) current.items.push(item);
    else groups.push({ date, items: [item] });
    return groups;
  }, []);

  const addRecord = () => {
    if (!newValue.trim()) return;
    const normalizedValue = newValue.trim();
    const detail = newMemo.trim() ? `${normalizedValue} · ${newMemo.trim()}` : normalizedValue;
    const prefix = `${TYPE_LABEL[newType]} (${newCategory}) `;
    const saved: SavedManualRecord[] = manualRecords;
    const now = new Date();
    const savedAt = new Date(`${newDate}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`).toISOString();
    const allManual = [...saved, { type: newType, label: `${prefix}${detail}`, savedAt }];
    localStorage.setItem("babi-manual-records", JSON.stringify(allManual));
    setRefresh((value) => value + 1);
    setNewCategory(newType === "sleep" ? "낮잠" : newType === "temperature" ? "1번" : "분유");
    setNewValue("");
    setNewMemo("");
    setIsAdding(false);
  };

  const deleteRecord = (item: TimelineItem) => {
    if (!window.confirm("이 기록을 삭제할까요?")) return;

    if (item.source === "voice" && item.itemIndex !== undefined) {
      const saved = readRecords();
      const record = saved[item.recordIndex];
      if (record) {
        const remainingItems = record.items.filter((_, index) => index !== item.itemIndex);
        if (remainingItems.length) saved[item.recordIndex] = { ...record, items: remainingItems };
        else saved.splice(item.recordIndex, 1);
        localStorage.setItem("babi-voice-records", JSON.stringify(saved));
      }
    } else if (item.source === "cry") {
      const saved = JSON.parse(localStorage.getItem("babi-cry-records") ?? "[]") as SavedCryRecord[];
      saved.splice(item.recordIndex, 1);
      localStorage.setItem("babi-cry-records", JSON.stringify(saved));
    } else {
      const saved = JSON.parse(localStorage.getItem("babi-manual-records") ?? "[]") as SavedManualRecord[];
      saved.splice(item.recordIndex, 1);
      localStorage.setItem("babi-manual-records", JSON.stringify(saved));
    }

    setRefresh((value) => value + 1);
  };

  return (
    <section className="babi-screen babi-screen--records">
      <h1 className="babi-record-title">기록관리</h1>
      <div className="babi-record-filters" role="tablist" aria-label="기록 종류">
        {FILTERS.map((item) => (
          <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>

      {grouped.length ? (
        <div className="babi-record-timeline">
          {grouped.map((group) => (
            <section className="babi-record-day" key={group.date}>
              <h2>{group.date}</h2>
              <div className="babi-record-day__items">
                {group.items.map((item) => (
                  <article className={`babi-timeline-item babi-timeline-item--${item.type}`} key={item.id}>
                    <div className="babi-timeline-item__icon" aria-hidden="true">
                      {TYPE_ICON_SRC[item.type] ? <img src={TYPE_ICON_SRC[item.type]} alt="" /> : <CryIcon />}
                    </div>
                    <div className="babi-timeline-item__card">
                      <strong>{getItemTitle(item)}</strong>
                      <time dateTime={item.savedAt}>{timeLabel(item.savedAt)}</time>
                      <p>{getItemValue(item)}</p>
                      <button className="babi-timeline-item__delete" type="button" onClick={() => deleteRecord(item)} aria-label={`${getItemTitle(item)} 기록 삭제`}>삭제</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="babi-record-empty">
          <p>{filter === "전체" ? "아직 저장된 기록이 없어요." : `${filter} 기록이 없어요.`}</p>
          <Link to="/voice-record">음성으로 기록하기 <span aria-hidden="true">›</span></Link>
        </div>
      )}

      <button className="babi-record-add" aria-label="기록 추가" onClick={() => setIsAdding(true)}>+</button>

      {isAdding && (
        <div className="babi-record-modal-backdrop" onClick={() => setIsAdding(false)}>
          <form className="babi-record-modal" onSubmit={(event) => { event.preventDefault(); addRecord(); }} onClick={(event) => event.stopPropagation()}>
            <div className="babi-record-modal__status"><span>9:41</span><span>▮▮  ◉  ▰</span></div>
            <div className="babi-record-modal__heading">
              <button type="button" aria-label="닫기" onClick={() => setIsAdding(false)}>×</button>
              <h2>기록 추가</h2>
              <span />
            </div>
            <div className="babi-record-modal__types">
              {(["feeding", "cry", "sleep", "temperature"] as const).map((type) => (
                <button type="button" key={type} className={newType === type ? `is-active is-${type}` : `is-${type}`} onClick={() => {
                  setNewType(type);
                  setNewCategory(type === "feeding" ? "분유" : type === "sleep" ? "낮잠" : "1번");
                  setNewValue("");
                }}>
                  {TYPE_ICON_SRC[type] ? <img src={TYPE_ICON_SRC[type]} alt="" /> : <CryIcon />}{TYPE_LABEL[type]}
                </button>
              ))}
            </div>
            <div className="babi-record-form-card">
              <label>{newType === "feeding" ? "수유 종류" : newType === "cry" ? "울음 횟수" : newType === "sleep" ? "수면 종류" : "측정 횟수"}
                <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
                  {(newType === "feeding" ? ["분유", "모유"] : newType === "cry" ? ["1번", "2번", "3번", "4번 이상"] : newType === "sleep" ? ["낮잠", "밤잠"] : ["1번", "2번", "3번", "4번 이상"]).map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>날짜<input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} /></label>
              <label>{newType === "feeding" ? "수유량" : newType === "cry" ? "울음 시간" : newType === "sleep" ? "수면 시간" : "체온"}<input required value={newValue} onChange={(event) => setNewValue(event.target.value)} placeholder={newType === "feeding" ? "120ml" : newType === "sleep" ? "예: 오전 10:30 · 2시간" : newType === "temperature" ? "36.5도" : "예: 16분"} /></label>
              <label>메모 <span>(선택)</span><textarea value={newMemo} onChange={(event) => setNewMemo(event.target.value)} placeholder="메모를 입력하세요" /></label>
              <button className="babi-btn babi-btn--dark" type="submit">기록저장</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
