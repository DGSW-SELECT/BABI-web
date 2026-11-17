import { request } from "./babi-request";

export type SignupResult = { userId: number; email: string; nickname: string };
export type EmailVerificationResult = {
  email: string;
  verified: boolean;
  expiresIn: number;
  verificationToken: string;
};

export async function login(email: string, password: string) {
  const data = await request<{ accessToken: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!data?.accessToken) throw new Error("로그인 토큰을 받지 못했어요.");
  return data.accessToken;
}

export function sendSignupVerification(email: string) {
  return request<void>("/auth/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export function verifySignupEmail(email: string, code: string) {
  return request<EmailVerificationResult>("/auth/email/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
}

export function signup(input: {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  verificationToken: string;
}) {
  return request<SignupResult>("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
