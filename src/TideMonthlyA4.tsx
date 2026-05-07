import { Info, MapPin, Printer } from "lucide-react";
import type { TideDay, TideEvent } from "./types";

type TideMonthlyA4Props = {
  year: number;
  month: number;
  location: string;
  datumNote: string;
  sourceLabel: string;
  days: TideDay[];
};

function formatEvent(event?: TideEvent) {
  if (!event) return "—";
  return `${event.time} (${event.level})`;
}

function TideWave({ day }: { day: TideDay }) {
  const events = day.allEvents.length
    ? day.allEvents
    : [day.low1, day.high1, day.low2, day.high2].filter(Boolean);

  const values = events
    .map((event) => event?.level)
    .filter((v): v is number => typeof v === "number");

  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 160;
  const range = Math.max(max - min, 1);

  const points = events.map((event, index) => {
    const denominator = Math.max(events.length - 1, 1);
    const x = 4 + (index / denominator) * 52;
    const y =
      event && typeof event.level === "number"
        ? 26 - ((event.level - min) / range) * 20
        : 16;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox="0 0 60 30"
      className="h-[6.5mm] w-full"
      aria-label={`${day.day}日の潮位変化`}
      role="img"
    >
      <line x1="0" y1="26" x2="60" y2="26" stroke="#d4d4d4" strokeWidth="0.6" />
      <line x1="0" y1="16" x2="60" y2="16" stroke="#e5e5e5" strokeWidth="0.5" />
      <line x1="0" y1="6" x2="60" y2="6" stroke="#e5e5e5" strokeWidth="0.5" />

      {points.length >= 2 && (
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#111"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {points.map((point, index) => {
        const [x, y] = point.split(",").map(Number);
        return <circle key={index} cx={x} cy={y} r="1.35" fill="#111" />;
      })}
    </svg>
  );
}

export default function TideMonthlyA4({
  year,
  month,
  location,
  datumNote,
  sourceLabel,
  days,
}: TideMonthlyA4Props) {
  return (
    <main className="min-h-screen bg-neutral-200 p-4 print:bg-white print:p-0">
      <section
        className="
          print-page mx-auto box-border bg-white text-black shadow-xl
          print:mx-0 print:shadow-none
          w-[210mm] min-h-[297mm]
          pl-[22mm] pr-[12mm] pt-[12mm] pb-[12mm]
          font-sans
        "
      >
        <div className="no-print mb-3 flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-600">
            ブラウザの印刷設定で「用紙: A4」「倍率: 100%」「余白: なし」を推奨
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded border border-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            <Printer size={16} />
            印刷 / PDF保存
          </button>
        </div>

        <header className="mb-[2.5mm] border-b border-black pb-[2mm]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[20pt] font-bold leading-none tracking-tight">
                {year}年 {String(month).padStart(2, "0")}月 潮汐表
              </h1>
              <div className="mt-[2mm] flex flex-wrap items-center gap-x-[3mm] gap-y-[0.8mm] text-[8pt]">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  観測地点：{location}
                </span>
                <span>{datumNote}</span>
              </div>
            </div>

            <div className="text-right text-[6.8pt] leading-snug text-neutral-700">
              A4縦・モノクロ印刷用
              <br />
              左25mm綴じ代対応
              <br />
              {sourceLabel}
            </div>
          </div>
        </header>

        <table className="w-full table-fixed border-collapse text-[7.7pt] leading-tight">
          <colgroup>
            <col className="w-[6mm]" />
            <col className="w-[6mm]" />
            <col className="w-[10mm]" />
            <col className="w-[20mm]" />
            <col className="w-[20mm]" />
            <col className="w-[20mm]" />
            <col className="w-[20mm]" />
            <col className="w-[30mm]" />
            <col className="w-auto" />
          </colgroup>

          <thead>
            <tr className="border-y border-black bg-neutral-100">
              <th className="border-r border-neutral-400 py-[1.35mm] text-center font-bold">日</th>
              <th className="border-r border-neutral-400 py-[1.35mm] text-center font-bold">曜</th>
              <th className="border-r border-neutral-400 py-[1.35mm] text-center font-bold">潮</th>
              <th className="border-r border-neutral-400 bg-neutral-200 py-[1.35mm] text-center font-bold">干潮 1</th>
              <th className="border-r border-neutral-400 bg-neutral-200 py-[1.35mm] text-center font-bold">干潮 2</th>
              <th className="border-r border-neutral-400 py-[1.35mm] text-center font-bold">満潮 1</th>
              <th className="border-r border-neutral-400 py-[1.35mm] text-center font-bold">満潮 2</th>
              <th className="border-r border-neutral-400 py-[1.35mm] text-center font-bold">潮位変化</th>
              <th className="py-[1.35mm] text-center font-bold">備考</th>
            </tr>
          </thead>

          <tbody>
            {days.map((d) => {
              const isSunday = d.weekday === "日";

              return (
                <tr
                  key={d.dateKey}
                  className={`h-[6.9mm] border-b border-neutral-400 ${
                    isSunday ? "bg-neutral-100" : d.day % 2 === 0 ? "bg-neutral-50" : "bg-white"
                  }`}
                >
                  <td className="border-r border-neutral-300 text-center font-mono font-bold">
                    {d.day}
                  </td>

                  <td className="border-r border-neutral-300 text-center font-bold">
                    {d.weekday}
                  </td>

                  <td className="border-r border-neutral-300 text-center">
                    <span className="inline-flex items-center gap-[1mm]">
                      {d.moon === "new" && <span className="font-bold">●</span>}
                      {d.moon === "full" && <span className="font-bold">○</span>}
                      {d.tideName}
                    </span>
                  </td>

                  <td className="border-r border-neutral-300 px-[0.6mm] text-center font-mono">
                    {formatEvent(d.low1)}
                  </td>

                  <td className="border-r border-neutral-300 px-[0.6mm] text-center font-mono">
                    {formatEvent(d.low2)}
                  </td>

                  <td className="border-r border-neutral-300 px-[0.6mm] text-center font-mono">
                    {formatEvent(d.high1)}
                  </td>

                  <td className="border-r border-neutral-300 px-[0.6mm] text-center font-mono">
                    {formatEvent(d.high2)}
                  </td>

                  <td className="border-r border-neutral-300 px-[1mm]">
                    <TideWave day={d} />
                  </td>

                  <td className="px-[1.4mm] text-neutral-500">{d.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <footer className="mt-[2.5mm] border-t border-black pt-[2mm] text-[6.8pt] leading-relaxed">
          <div className="grid grid-cols-[1fr_1.45fr] gap-[5mm]">
            <div>
              <div className="mb-[1mm] flex items-center gap-1 font-bold">
                <Info size={12} />
                凡例
              </div>
              <p>
                ● 新月　○ 満月　／　潮位の数値は cm 表記。
                干潮・満潮欄は「時刻（潮位）」の形式で記載。
              </p>
            </div>

            <div>
              <p>
                ※実際の潮汐データは、海上保安庁・気象庁等の公的データを確認してください。
                本表は印刷・記録用のレイアウトであり、安全判断には最新の公式情報を使用してください。
              </p>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
