import type {
  MoonInfoRecord,
  SourceAnnualTideData,
  SourceRealtimeTideData,
  SourceTideEvent,
  TideDay,
  TideEvent,
  TideKind,
  TideName,
} from "./types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseLocalDate(value: string): Date {
  return new Date(value);
}

export function formatHHMM(value: string): string {
  const date = parseLocalDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function metersToCentimeters(heightMeters: number): number {
  return Math.round(heightMeters * 100);
}

export function normalizeEvent(event: SourceTideEvent): TideEvent & { type: TideKind } {
  return {
    type: event.type,
    time: formatHHMM(event.time),
    level: metersToCentimeters(event.height),
    rawTime: event.time,
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function inferTideNameByDayIndex(day: number): TideName {
  // 月齢データがない場合の表示崩れ防止用フォールバック。
  // 実運用では tidedata.json 側に潮回りを持たせるか、mooninfo_YYYY.json から補正する。
  const cycle: TideName[] = [
    "大潮",
    "大潮",
    "中潮",
    "中潮",
    "中潮",
    "小潮",
    "小潮",
    "長潮",
    "若潮",
    "中潮",
    "中潮",
    "中潮",
    "大潮",
    "大潮",
    "大潮",
  ];
  return cycle[(day - 1) % cycle.length];
}

export function inferTideNameFromMoonAge(age: number | undefined, fallbackDay: number): TideName {
  if (age == null || Number.isNaN(age)) return inferTideNameByDayIndex(fallbackDay);

  const normalized = ((age % 29.53) + 29.53) % 29.53;

  if (normalized <= 1.5 || normalized >= 28.0) return "大潮";
  if (normalized <= 6.5) return "中潮";
  if (normalized <= 9.5) return "小潮";
  if (normalized <= 10.5) return "長潮";
  if (normalized <= 11.5) return "若潮";
  if (normalized <= 13.5) return "中潮";
  if (normalized <= 16.5) return "大潮";
  if (normalized <= 21.5) return "中潮";
  if (normalized <= 24.5) return "小潮";
  if (normalized <= 25.5) return "長潮";
  if (normalized <= 26.5) return "若潮";
  return "中潮";
}

export function moonMarkFromAge(age: number | undefined): "new" | "full" | undefined {
  if (age == null || Number.isNaN(age)) return undefined;
  const normalized = ((age % 29.53) + 29.53) % 29.53;
  if (normalized <= 0.7 || normalized >= 28.83) return "new";
  if (Math.abs(normalized - 14.765) <= 0.9) return "full";
  return undefined;
}

export function getMoonAgeForDate(
  moonInfo: MoonInfoRecord[] | null,
  year: number,
  month: number,
  day: number
): number | undefined {
  if (!moonInfo || !Array.isArray(moonInfo)) return undefined;

  const key = toDateKey(year, month, day);
  const record = moonInfo.find((item) => {
    const time = String(item.time ?? "");
    return time.startsWith(key);
  });

  if (!record) return undefined;

  const candidates = [
    record.age,
    record.moon_age,
    typeof record.phase === "number" ? record.phase : undefined,
  ];

  return candidates.find((v): v is number => typeof v === "number" && !Number.isNaN(v));
}

export function getEventsForDate(
  annualData: SourceAnnualTideData | null,
  realtimeData: SourceRealtimeTideData | null,
  year: number,
  month: number,
  day: number
): SourceTideEvent[] {
  const dateKey = toDateKey(year, month, day);

  if (annualData && Array.isArray(annualData[dateKey])) {
    return annualData[dateKey];
  }

  if (realtimeData?.data && Array.isArray(realtimeData.data)) {
    return realtimeData.data.filter((event) => {
      const date = parseLocalDate(event.time);
      return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      );
    });
  }

  return [];
}

export function buildMonthlyDays({
  year,
  month,
  annualData,
  realtimeData,
  moonInfo,
}: {
  year: number;
  month: number;
  annualData: SourceAnnualTideData | null;
  realtimeData: SourceRealtimeTideData | null;
  moonInfo: MoonInfoRecord[] | null;
}): TideDay[] {
  const daysInMonth = getDaysInMonth(year, month);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month - 1, day);
    const dateKey = toDateKey(year, month, day);

    const rawEvents = getEventsForDate(annualData, realtimeData, year, month, day)
      .slice()
      .sort((a, b) => parseLocalDate(a.time).getTime() - parseLocalDate(b.time).getTime());

    const allEvents = rawEvents.map(normalizeEvent);
    const lows = allEvents.filter((event) => event.type === "low");
    const highs = allEvents.filter((event) => event.type === "high");
    const moonAge = getMoonAgeForDate(moonInfo, year, month, day);

    return {
      dateKey,
      day,
      weekday: WEEKDAYS[date.getDay()],
      tideName: inferTideNameFromMoonAge(moonAge, day),
      low1: lows[0],
      low2: lows[1],
      high1: highs[0],
      high2: highs[1],
      allEvents,
      moon: moonMarkFromAge(moonAge),
      note: "",
    };
  });
}

export function createFallbackAnnualData(year: number, month: number): SourceAnnualTideData {
  const days = getDaysInMonth(year, month);
  const data: SourceAnnualTideData = {};

  for (let day = 1; day <= days; day += 1) {
    const key = toDateKey(year, month, day);
    const offset = day % 6;
    data[key] = [
      {
        time: `${key}T${pad2((4 + offset) % 24)}:12:00+09:00`,
        type: "high",
        height: 1.28 + (day % 8) * 0.02,
      },
      {
        time: `${key}T${pad2((10 + offset) % 24)}:34:00+09:00`,
        type: "low",
        height: 0.46 + (day % 7) * 0.03,
      },
      {
        time: `${key}T${pad2((16 + offset) % 24)}:05:00+09:00`,
        type: "high",
        height: 1.34 + (day % 9) * 0.02,
      },
      {
        time: `${key}T${pad2((22 + offset) % 24)}:40:00+09:00`,
        type: "low",
        height: 0.08 + (day % 8) * 0.02,
      },
    ];
  }

  return data;
}
