export const BASE_URL = import.meta.env.VITE_API_URL ?? "";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** 공통 요청 함수. 응답 형식/에러/토큰 처리는 팀 global/api 규칙에 맞게 수정 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) throw new Error(`요청에 실패했어요. (${res.status})`);
  return (await res.json()) as T;
}
