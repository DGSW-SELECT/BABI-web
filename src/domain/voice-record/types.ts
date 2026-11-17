export type VoiceItemType = "sleep" | "feeding" | "temperature" | "cry";

export interface ParsedVoiceItem {
  type: VoiceItemType;
  label: string;
}

export interface ParsedVoiceRecord {
  transcript: string;
  items: ParsedVoiceItem[];
}
