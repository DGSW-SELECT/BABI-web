const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function parseRecordDate(value: string): Date | null {
  const match = value
    .trim()
    .match(
      /^(\d{4})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,2})\s*\.?\s*(?:\([일월화수목금토]\))?$/,
    );
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (
    year < 1000 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return date;
}

export function formatRecordDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}. ${month}. ${day} (${weekdays[date.getDay()]})`;
}

export function getRecordDateLabel(value: string, today = new Date()): string {
  const date = parseRecordDate(value);
  if (!date) return value;
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const monthDay = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  if (formatRecordDate(date) === formatRecordDate(today))
    return `오늘 ${monthDay}`;
  if (formatRecordDate(date) === formatRecordDate(yesterday))
    return `어제 ${monthDay}`;
  return `${date.getFullYear()}년 ${monthDay} (${weekdays[date.getDay()]})`;
}
