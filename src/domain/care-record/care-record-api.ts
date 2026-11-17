import type { CareRecord, CareRecordInput } from "./care-record-data";

export type CareRecordDraft = Omit<CareRecordInput, "id">;

export type CareRecordRequestContext = {
  babyId: number;
  accessToken: string;
  signal?: AbortSignal;
};

export type CareRecordApi = {
  list: (context: CareRecordRequestContext) => Promise<CareRecord[]>;
  create: (
    context: CareRecordRequestContext,
    draft: CareRecordDraft,
  ) => Promise<CareRecord>;
};

/**
 * 개별 육아 기록 API 명세가 확정되면 경로와 요청/응답 변환 함수를 채웁니다.
 * 현재 화면은 이 팩토리를 호출하지 않으며 메모리 저장소를 계속 사용합니다.
 */
export type CareRecordApiConfig = {
  baseUrl: string;
  paths: {
    list: (babyId: number) => string;
    create: (babyId: number) => string;
  };
  encodeCreate: (draft: CareRecordDraft) => unknown;
  decodeList: (response: unknown) => CareRecord[];
  decodeCreate: (response: unknown) => CareRecord;
};

export function createCareRecordApi(config: CareRecordApiConfig): CareRecordApi {
  async function request(
    path: string,
    context: CareRecordRequestContext,
    method: "GET" | "POST",
    body?: unknown,
  ): Promise<unknown> {
    if (!context.accessToken) {
      throw new Error("인증 토큰이 필요합니다.");
    }

    const response = await fetch(new URL(path, config.baseUrl), {
      method,
      headers: {
        Authorization: "Bearer " + context.accessToken,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: context.signal,
    });

    if (!response.ok) {
      throw new Error("육아 기록 요청에 실패했어요. (" + response.status + ")");
    }

    return (await response.json()) as unknown;
  }

  return {
    async list(context) {
      const response = await request(config.paths.list(context.babyId), context, "GET");
      return config.decodeList(response);
    },
    async create(context, draft) {
      const response = await request(
        config.paths.create(context.babyId),
        context,
        "POST",
        config.encodeCreate(draft),
      );
      return config.decodeCreate(response);
    },
  };
}
