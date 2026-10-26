export type VoiceItemType = "sleep" | "feeding" | "temperature";

export interface ParsedVoiceItem {
  type: VoiceItemType;
  label: string;
}

export interface ParsedVoiceRecord {
  transcript: string;
  items: ParsedVoiceItem[];
}
