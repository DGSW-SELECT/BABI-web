export type Category = "수유" | "울음" | "수면" | "체온";
export type CareRecord = {
  id: string;
  babyId: number;
  authorId: string;
  createdAt: string;
  date: string;
  category: Category;
  title: string;
  value: string;
  time: string;
  note?: string;
  icon: string;
};
export const initialRecords: CareRecord[] = [
  {
    id: "example-수유",
    babyId: 1,
    authorId: "mother",
    createdAt: "2026-09-01T13:30:00+09:00",
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
    babyId: 1,
    authorId: "grandmother",
    createdAt: "2026-09-01T15:12:00+09:00",
    date: "2026. 09. 01 (화)",
    category: "수면",
    title: "수면 (낮잠)",
    value: "2시간 40분",
    time: "오후 3:12",
    icon: "sleep",
  },
  {
    id: "example-체온",
    babyId: 1,
    authorId: "father",
    createdAt: "2026-09-01T17:19:00+09:00",
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
    babyId: 1,
    authorId: "sitter",
    createdAt: "2026-08-31T08:27:00+09:00",
    date: "2026. 08. 31 (월)",
    category: "울음",
    title: "울음",
    value: "3회",
    time: "오전 8:27",
    note: "16분 동안",
    icon: "cry",
  },
];

export type CareRecordInput = Omit<CareRecord, "babyId" | "authorId" | "createdAt">;

export const demoBaby = { babyId: 1, name: "지민이" };
export const demoCaregivers = [
  { id: "mother", name: "엄마", role: "부모" },
  { id: "father", name: "아빠", role: "부모" },
  { id: "grandmother", name: "할머니", role: "조부모" },
  { id: "sitter", name: "베이비시터", role: "돌봄 보호자" },
];
