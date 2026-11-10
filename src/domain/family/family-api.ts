const base = (import.meta.env.VITE_FAMILY_API_URL || "/family-api").replace(/\/$/, "");

export type Baby = { babyId: number; name: string; birthDate?: string };
export type Member = { userId: number; nickname: string; role: string };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(base + path, init);
  const body = await response.json().catch(() => null) as {
    success: boolean;
    message?: string;
    data: T;
  } | null;
  if (!response.ok || !body?.success) {
    throw new Error(body?.message || "요청에 실패했어요. (" + response.status + ")");
  }
  return body.data;
}

function auth(token: string) {
  return { Authorization: "Bearer " + token };
}

export async function login(email: string, password: string) {
  const data = await request<{ accessToken: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!data?.accessToken) throw new Error("로그인 토큰을 받지 못했어요.");
  return data.accessToken;
}

export function listBabies(token: string, signal: AbortSignal) {
  return request<Baby[]>("/babies", { headers: auth(token), signal });
}

export function createBaby(token: string, name: string, birthDate: string) {
  return request<Baby>("/babies", {
    method: "POST",
    headers: { ...auth(token), "Content-Type": "application/json" },
    body: JSON.stringify({ name, birthDate }),
  });
}

export function listMembers(token: string, babyId: number, signal: AbortSignal) {
  return request<Member[]>("/babies/" + babyId + "/members", {
    headers: auth(token),
    signal,
  });
}

export function inviteMember(token: string, babyId: number, email: string) {
  return request<unknown>("/babies/" + babyId + "/invitations", {
    method: "POST",
    headers: { ...auth(token), "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

type Invitation = Baby & { expiresAt: string };

export function checkInvitation(token: string, code: string) {
  return submitInvitationCode("/babies/invitations/check", token, code);
}

export function acceptInvitation(token: string, code: string) {
  return submitInvitationCode("/babies/invitations/accept", token, code);
}

function submitInvitationCode(path: string, token: string, code: string) {
  return request<Invitation>(path, {
    method: "POST",
    headers: { ...auth(token), "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
}

export function getInvitationCode(token: string, babyId: number) {
  return request<{ code: string }>("/babies/" + babyId + "/invitation-code", {
    headers: auth(token),
    cache: "no-store",
  });
}

export function reissueInvitationCode(token: string, babyId: number) {
  return request<{ code: string }>("/babies/" + babyId + "/invitation-code/reissue", {
    method: "POST",
    headers: auth(token),
  });
}
