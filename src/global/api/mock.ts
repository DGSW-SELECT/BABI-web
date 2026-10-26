// 백엔드 없이 화면만 확인하기 위한 가짜 데이터입니다. 연동 후 삭제하세요.
import type { ParsedVoiceRecord } from "../../domain/voice-record/types";
import type { CryAnalysisResult } from "../../domain/cry-analysis/types";
import type { Recommendation } from "../../domain/activity-recommend/types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockParseVoiceRecord(): Promise<ParsedVoiceRecord> {
  await wait(1200);
  return {
    transcript: "방금 막 잠들었어. 분유는 120ml 먹었고 체온은 36.8도야.",
    items: [
      { type: "sleep", label: "😴 수면 시작" },
      { type: "feeding", label: "🍼 수유 120ml" },
      { type: "temperature", label: "🌡 체온 36.8°" },
    ],
  };
}

export async function mockOk(): Promise<{ ok: boolean }> {
  await wait(400);
  return { ok: true };
}

export async function mockAnalyzeCry(): Promise<CryAnalysisResult> {
  await wait(1500);
  return {
    top: { type: "hungry", emoji: "🍼", title: "배고픈 울음일 가능성이 높아요", note: "마지막 수유 후 3시간 20분 지났어요" },
    scores: [
      { label: "배고픔", value: 62 },
      { label: "졸림", value: 21 },
      { label: "불편함", value: 11 },
      { label: "통증", value: 6 },
    ],
    tips: [
      "수유 시간을 확인하고 먼저 먹여보세요",
      "먹은 뒤에도 울면 기저귀를 확인하세요",
      "30분 넘게 울거나 열이 있으면 병원에 문의하세요",
    ],
  };
}

const POOL = [
  { id: 1, icon: "🧸", title: "까꿍 놀이", desc: "10분 · 대상 영속성 발달" },
  { id: 2, icon: "🤸", title: "터미타임 놀이", desc: "15분 · 목·등 근력 발달" },
  { id: 3, icon: "🎵", title: "노래 들려주기", desc: "10분 · 언어 자극" },
  { id: 4, icon: "🫧", title: "비눗방울 보기", desc: "10분 · 시각 추적" },
  { id: 5, icon: "📖", title: "헝겊책 읽기", desc: "10분 · 촉각·언어" },
  { id: 6, icon: "🥁", title: "소리 나는 장난감", desc: "10분 · 청각 자극" },
];

export async function mockRecommendations(page: number): Promise<Recommendation> {
  await wait(500);
  const start = (page * 3) % POOL.length;
  return {
    ageLabel: "생후 7개월",
    condition: { feeding: "5회", sleep: "11h", temp: "36.7°", cry: "2회" },
    comment: "잘 먹고 푹 잤어요. 컨디션이 좋아서 몸을 움직이는 놀이가 잘 맞아요!",
    activities: POOL.slice(start, start + 3),
  };
}
