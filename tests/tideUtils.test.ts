import assert from "node:assert/strict";
import { getMoonAgeForDate, inferTideNameFromMoonAge } from "../src/tideUtils.ts";

const cases = [
  { age: 0.797, expected: "大潮" }, // 旧暦1日
  { age: 2.797, expected: "中潮" }, // 旧暦3日
  { age: 6.797, expected: "小潮" }, // 旧暦7日
  { age: 9.797, expected: "長潮" }, // 旧暦10日
  { age: 10.797, expected: "若潮" }, // 旧暦11日
  { age: 13.553, expected: "大潮" }, // 旧暦14日
  { age: 16.553, expected: "大潮" }, // 旧暦17日（従来は中潮に誤分類）
  { age: 17.553, expected: "中潮" }, // 旧暦18日
  { age: 21.553, expected: "小潮" }, // 旧暦22日
  { age: 24.553, expected: "長潮" }, // 旧暦25日
  { age: 25.553, expected: "若潮" }, // 旧暦26日
  { age: 26.553, expected: "中潮" }, // 旧暦27日
  { age: 28.797, expected: "大潮" }, // 旧暦29日
  { age: 29.553, expected: "大潮" }, // 旧暦30日
];

for (const { age, expected } of cases) {
  assert.equal(inferTideNameFromMoonAge(age), expected, `月齢 ${age}`);
}

assert.equal(inferTideNameFromMoonAge(undefined), "—", "月齢欠損時は潮歴を推測しない");
assert.equal(
  getMoonAgeForDate([{ time: "2026-08-25T00:00:00+09:00", phase: 91 }], 2026, 8, 25),
  undefined,
  "満ち欠け率を月齢として使用しない"
);

console.log(`潮歴の境界 ${cases.length} 件を検証しました。`);
