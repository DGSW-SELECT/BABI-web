import type {
  CreateGrowthRecordRequest,
  CreateGrowthRecordResponse,
  GrowthComparisonResponse,
  GrowthRecordsQuery,
  GrowthRecordsResponse,
} from './growthTypes'

type GrowthApiOptions = {
  baseUrl: string
  // 인증 방식을 임의로 정하지 않고 로그인 기능에서 받은 헤더를 사용합니다.
  getHeaders?: () => HeadersInit
  credentials?: RequestCredentials
  fetcher?: typeof fetch
}

export function createGrowthApi({
  baseUrl,
  getHeaders,
  credentials = 'same-origin',
  fetcher = fetch,
}: GrowthApiOptions) {
  const serverUrl = baseUrl.trim().replace(/\/+$/, '')

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(getHeaders?.())
    headers.set('Accept', 'application/json')
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetcher(`${serverUrl}${path}`, {
      ...options,
      headers,
      credentials,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
      if (response.status === 403) {
        throw new Error('이 아이의 성장 기록에 접근할 수 없습니다.')
      }
      throw new Error('성장 기록을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.')
    }

    return response.json() as Promise<T>
  }

  function getRecords(babyId: number, query: GrowthRecordsQuery = {}, signal?: AbortSignal) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value))
      }
    }
    const queryString = params.toString()
    const path = `/api/v1/babies/${babyId}/growth-records${queryString ? `?${queryString}` : ''}`

    return request<GrowthRecordsResponse>(path, { method: 'GET', signal })
  }

  function createRecord(babyId: number, record: CreateGrowthRecordRequest, signal?: AbortSignal) {
    return request<CreateGrowthRecordResponse>(`/api/v1/babies/${babyId}/growth-records`, {
      method: 'POST',
      body: JSON.stringify({
        measuredDate: record.measuredDate,
        heightCm: record.heightCm,
        weightKg: record.weightKg,
      }),
      signal,
    })
  }

  function getComparison(babyId: number, growthRecordId: number, signal?: AbortSignal) {
    const params = new URLSearchParams({ growthRecordId: String(growthRecordId) })
    return request<GrowthComparisonResponse>(
      `/api/v1/babies/${babyId}/growth-comparison?${params.toString()}`,
      { method: 'GET', signal },
    )
  }

  return { getRecords, createRecord, getComparison }
}
