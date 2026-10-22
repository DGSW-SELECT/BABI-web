import { useRef, useState, type CSSProperties } from "react";
import Footer from "../../global/navigation/Footer";
import { formatRecordDate, getRecordDateLabel, parseRecordDate } from "./record-date";
import "./care-record.css";

type Category = "수유" | "울음" | "수면" | "체온";
const asset = (name: string) => `/record-assets/${name}.svg`;
const categories: { name: Category; icon: string; color: string }[] = [
  { name: "수유", icon: "feed", color: "#5fa8e8" },
  { name: "울음", icon: "cry", color: "#ffb091" },
  { name: "수면", icon: "sleep", color: "#a88be8" },
  { name: "체온", icon: "temperature", color: "#72c58a" },
];
type CareRecord = {
  id: string;
  date: string;
  category: Category;
  title: string;
  value: string;
  time: string;
  note?: string;
  icon: string;
};
const initialRecords: CareRecord[] = [
  {
    id: "example-수유",
    date: "2026. 09. 01 (화)",
    category: "수유",
    title: "수유 (분유)",
    value: "120ml",
    time: "오후 1:30",
    note: "맛있게 잘먹음",
    icon: "feed",
  },
  {
    id: "example-수면",
    date: "2026. 09. 01 (화)",
    category: "수면",
    title: "수면 (낮잠)",
    value: "2시간 40분",
    time: "오후 3:12",
    icon: "sleep",
  },
  {
    id: "example-체온",
    date: "2026. 09. 01 (화)",
    category: "체온",
    title: "체온",
    value: "36.5도",
    time: "오후 5:19",
    note: "오늘 기록 3회",
    icon: "temperature",
  },
  {
    id: "example-울음",
    date: "2026. 08. 31 (월)",
    category: "울음",
    title: "울음",
    value: "3회",
    time: "오전 8:27",
    note: "16분 동안",
    icon: "cry",
  },
];
const fieldSettings = {
  수유: {
    label: "수유 종류",
    selection: "분유",
    valueLabel: "수유량",
    value: "120ml",
  },
  울음: {
    label: "울음 횟수",
    selection: "1번",
    valueLabel: "울음 시간",
    value: "16분",
  },
  수면: {
    label: "수면 종류",
    selection: "낮잠",
    valueLabel: "수면 시간",
    value: "오전 10:30",
  },
  체온: {
    label: "측정 횟수",
    selection: "1번",
    valueLabel: "체온",
    value: "36.5도",
  },
};

function RecordForm({ category, onSave }: { category: Category; onSave: (record: CareRecord) => void }) {
  const settings = fieldSettings[category];
  return (
    <form className="record-form" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const selection = String(data.get("selection") ?? "").trim();
      const value = String(data.get("value") ?? "").trim();
      const memo = String(data.get("memo") ?? "").trim();
      const date = parseRecordDate(String(data.get("date") ?? ""));
      if (!date) {
        const dateInput = event.currentTarget.elements.namedItem("date") as HTMLInputElement;
        dateInput.setCustomValidity("올바른 날짜를 입력해주세요. 예: 2026. 10. 21 또는 2026-10-21");
        dateInput.reportValidity();
        return;
      }
      onSave({
        id: crypto.randomUUID(),
        date: formatRecordDate(date),
        category,
        title: category === "수유" || category === "수면" ? `${category} (${selection})` : category,
        value: category === "울음" ? selection : value,
        time: new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date()),
        note: [category === "울음" ? `${value} 동안` : category === "체온" ? `측정 ${selection}` : "", memo].filter(Boolean).join(" · "),
        icon: categories.find((item) => item.name === category)!.icon,
      });
    }}>
      <label className="record-field">
        <span>{settings.label}</span>
        <input
          name="selection"
          required
          aria-label={settings.label}
          type="text"
          defaultValue={settings.selection}
        />
      </label>
      <label className="record-field">
        <span>날짜</span>
        <input
          name="date"
          required
          aria-label="날짜"
          type="text"
          defaultValue={formatRecordDate(new Date())}
          placeholder="YYYY. MM. DD"
          onInput={(event) => event.currentTarget.setCustomValidity("")}
        />
      </label>
      <label className="record-field">
        <span>{settings.valueLabel}</span>
        <input
          name="value"
          required
          aria-label={settings.valueLabel}
          type="text"
          defaultValue={settings.value}
        />
      </label>
      <label className="record-field record-memo">
        <span>
          메모 <span className="record-optional">(선택)</span>
        </span>
        <textarea name="memo" aria-label="메모 (선택)" placeholder="메모를 입력하세요" />
      </label>
      <button className="record-save" type="submit">
        기록저장
      </button>
    </form>
  );
}

export default function CareRecordPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [records, setRecords] = useState<CareRecord[]>(initialRecords);
  const [filter, setFilter] = useState<Category | "전체">("전체");
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState<Category>("수유");
  const visibleRecords = records.filter(
    (record) => filter === "전체" || record.category === filter,
  );
  const recordDates = Array.from(new Set(visibleRecords.map((record) => record.date)))
    .sort((a, b) => (parseRecordDate(b)?.getTime() ?? 0) - (parseRecordDate(a)?.getTime() ?? 0));

  return (
    <div className="record-app relative mx-auto w-full max-w-[402px] bg-[#f8f9fa] shadow-[0_0_24px_rgba(0,0,0,0.08)]">
      <main className={adding ? "record-main record-add" : "record-main"}>
        <header className="record-header">
          {adding && (
            <button
              className="record-close"
              type="button"
              aria-label="기록 추가 닫기"
              onClick={() => setAdding(false)}
            >
              <img src={asset("close")} alt="" />
            </button>
          )}
          <h1>{adding ? "기록 추가" : "기록관리"}</h1>
        </header>
        {adding ? (
          <>
            <div
              className="record-category-tabs"
              role="tablist"
              aria-label="추가할 기록 종류"
            >
              {categories.map((item) => (
                <button
                  key={item.name}
                  id={`record-tab-${item.icon}`}
                  type="button"
                  role="tab"
                  aria-selected={category === item.name}
                  aria-controls="record-form-panel"
                  tabIndex={category === item.name ? 0 : -1}
                  style={{ "--category-color": item.color } as CSSProperties}
                  className={category === item.name ? "selected" : ""}
                  onClick={() => setCategory(item.name)}
                  onKeyDown={(event) => {
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    )
                      return;
                    event.preventDefault();
                    const index = categories.findIndex(
                      (item) => item.name === category,
                    );
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? 3
                          : (index + (event.key === "ArrowRight" ? 1 : 3)) % 4;
                    setCategory(categories[next].name);
                    document
                      .getElementById(`record-tab-${categories[next].icon}`)
                      ?.focus();
                  }}
                >
                  <img src={asset(item.icon)} alt="" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            <div
              id="record-form-panel"
              className="record-form-scroll"
              role="tabpanel"
              aria-labelledby={`record-tab-${categories.find((item) => item.name === category)?.icon}`}
            >
              {categories.map((item) => (
                <div key={item.name} hidden={category !== item.name}>
                  <RecordForm category={item.name} onSave={(record) => {
                    setRecords((previous) => [record, ...previous]);
                    setFilter("전체");
                    setAdding(false);
                  }} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <nav className="record-filters" aria-label="기록 필터">
              {(["전체", "수유", "수면", "체온", "울음"] as const).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={filter === item}
                    className={filter === item ? "selected" : ""}
                    onClick={() => {
                      setFilter(item);
                      scrollRef.current?.scrollTo({ top: 0 });
                    }}
                  >
                    {item}
                  </button>
                ),
              )}
            </nav>
            <div className="record-list-scroll" ref={scrollRef} role="region" aria-label="기록 목록" tabIndex={0}>
              <div className="record-timeline">
                {recordDates.map((date) => {
                  const group = visibleRecords.filter(
                    (record) => record.date === date,
                  );
                  return (
                    group.length > 0 && (
                      <section
                        className="record-day"
                        key={date}
                        aria-label={`${date} 기록`}
                      >
                        <h2>{getRecordDateLabel(date)}</h2>
                        <ul>
                          {group.map((record) => (
                            <li className="record-entry" key={record.id}>
                              <div
                                className={`record-marker record-marker-${record.icon}`}
                              >
                                {record.icon !== "sleep" && (
                                  <img
                                    className="record-marker-circle"
                                    src={asset(`${record.icon}-circle`)}
                                    alt=""
                                  />
                                )}
                                <img
                                  className="record-marker-icon"
                                  src={asset(`timeline-${record.icon}`)}
                                  alt=""
                                />
                              </div>
                              <article
                                className={`record-card record-card-${record.icon}`}
                                aria-label={record.title}
                              >
                                <div className="record-card-heading">
                                  <h3>{record.title}</h3>
                                  <span>{record.time}</span>
                                </div>
                                <p>{record.value}</p>
                                {record.note && (
                                  <p className="record-card-note">
                                    {record.note}
                                  </p>
                                )}
                              </article>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )
                  );
                })}
              </div>
            </div>
            <button
              className="record-add-button"
              type="button"
              aria-label="기록 추가"
              onClick={() => {
                setCategory(filter === "전체" ? "수유" : filter);
                setAdding(true);
              }}
            >
              <img src={asset("plus")} alt="" />
            </button>
          </>
        )}
      </main>
      <Footer initialTab="기록" />
    </div>
  );
}
