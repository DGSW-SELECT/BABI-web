import { request, USE_MOCK } from "../../global/api/client";
import { mockRecommendations } from "../../global/api/mock";
import type { Recommendation } from "./types";

export function fetchRecommendations(page = 0): Promise<Recommendation> {
  if (USE_MOCK) return mockRecommendations(page);
  return request<Recommendation>(`/api/activities/recommendations?page=${page}`);
}
