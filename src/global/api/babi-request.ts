const base = (import.meta.env.VITE_FAMILY_API_URL || "/family-api").replace(/\/$/, "");

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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

