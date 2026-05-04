export type TideKind = "high" | "low";

export type SourceTideEvent = {
  time: string;
  type: TideKind;
  height: number; // chiga-log: meters
};

export type SourceAnnualTideData = Record<string, SourceTideEvent[]>;

export type SourceRealtimeTideData = {
  data?: SourceTideEvent[];
  meta?: {
    datum?: string;
    station?: {
      name?: string;
    };
  };
};

export type MoonInfoRecord = {
  time?: string;
  phase?: number;
  age?: number;
  moon_age?: number;
  phase_name?: string;
  [key: string]: unknown;
};

export type TideEvent = {
  time: string;
  level: number; // centimeters
  rawTime: string;
};

export type TideName = "大潮" | "中潮" | "小潮" | "長潮" | "若潮" | "—";

export type MoonMark = "new" | "full" | undefined;

export type TideDay = {
  dateKey: string;
  day: number;
  weekday: string;
  tideName: TideName;
  low1?: TideEvent;
  low2?: TideEvent;
  high1?: TideEvent;
  high2?: TideEvent;
  allEvents: Array<TideEvent & { type: TideKind }>;
  moon?: MoonMark;
  note?: string;
};
