export interface CryScore {
  label: string;
  value: number; // 0~100
}

export interface CryAnalysisResult {
  top: { type: string; emoji: string; title: string; note: string };
  scores: CryScore[];
  tips: string[];
}
