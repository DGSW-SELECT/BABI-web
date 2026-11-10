import { request } from "./babi-request";

export async function login(email: string, password: string) {
  const data = await request<{ accessToken: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!data?.accessToken) throw new Error("로그인 토큰을 받지 못했어요.");
  return data.accessToken;
}
