import { useEffect, useMemo, useState } from "react";
import TideMonthlyA4 from "./TideMonthlyA4";
import {
  buildMonthlyDays,
  createFallbackAnnualData,
  getDaysInMonth,
  pad2,
} from "./tideUtils";
import type {
  MoonInfoRecord,
  SourceAnnualTideData,
  SourceRealtimeTideData,
} from "./types";

type LoadState = "loading" | "loaded" | "fallback";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function useQueryMonth() {
  const now = new Date();
  const params = new URLSearchParams(window.location.search);

  const yearParam = Number(params.get("year"));
  const monthParam = Number(params.get("month"));

  const year = Number.isInteger(yearParam) && yearParam >= 2000 ? yearParam : now.getFullYear();
  const month =
    Number.isInteger(monthParam) && monthParam >= 1 && monthParam <= 12
      ? monthParam
      : now.getMonth() + 1;

  return { year, month };
}

export default function App() {
  const initial = useQueryMonth();

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const [annualData, setAnnualData] = useState<SourceAnnualTideData | null>(null);
  const [realtimeData, setRealtimeData] = useState<SourceRealtimeTideData | null>(null);
  const [moonInfo, setMoonInfo] = useState<MoonInfoRecord[] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState("loading");

      const [annual, realtime, moon] = await Promise.all([
        fetchJson<SourceAnnualTideData>("./data/tidedata.json"),
        fetchJson<SourceRealtimeTideData>("./data/tide_data.json"),
        fetchJson<MoonInfoRecord[]>(`./data/mooninfo_${year}.json`),
      ]);

      if (cancelled) return;

      setAnnualData(annual);
      setRealtimeData(realtime);
      setMoonInfo(moon);

      if (annual || realtime) {
        setLoadState("loaded");
      } else {
        setAnnualData(createFallbackAnnualData(year, month));
        setLoadState("fallback");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const days = useMemo(
    () =>
      buildMonthlyDays({
        year,
        month,
        annualData,
        realtimeData,
        moonInfo,
      }),
    [year, month, annualData, realtimeData, moonInfo]
  );

  const sourceLabel =
    loadState === "loaded"
      ? "data/tidedata.json 参照"
      : loadState === "fallback"
        ? "サンプルデータ表示中"
        : "読み込み中";

  return (
    <>
      <div className="no-print mx-auto mt-4 flex w-[210mm] flex-wrap items-center justify-between gap-2 rounded border border-neutral-300 bg-white p-3 text-sm shadow-sm">
        <div className="font-bold">tide-PDF</div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1">
            年
            <input
              type="number"
              value={year}
              min={2000}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded border border-neutral-300 px-2 py-1 font-mono"
            />
          </label>

          <label className="flex items-center gap-1">
            月
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded border border-neutral-300 px-2 py-1"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((m) => (
                <option key={m} value={m}>
                  {pad2(m)}
                </option>
              ))}
            </select>
          </label>

          <span className="text-neutral-600">{getDaysInMonth(year, month)}日分</span>
          <span className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
            {sourceLabel}
          </span>
        </div>
      </div>

      <TideMonthlyA4
        year={year}
        month={month}
        location="湘南・茅ヶ崎周辺"
        datumNote="基準面：観測地点の潮位基準面／単位：cm"
        sourceLabel={sourceLabel}
        days={days}
      />
    </>
  );
}
