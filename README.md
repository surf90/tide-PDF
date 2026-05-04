# tide-PDF

`chiga-log` の潮汐データ運用を参考に、1か月分の潮汐情報を **A4縦・モノクロ印刷用** に整形して表示するReactアプリです。

ブラウザの印刷機能から、紙への印刷またはPDF保存ができます。

## 目的

- 潮汐情報を1か月単位で紙にまとめる
- A4一枚で見やすく、バインダー保管しやすい表にする
- 海辺での記録・確認用に、備考欄へ手書きメモできる余白を残す
- `chiga-log` と同じように、静的JSONを読み込んでGitHub Pagesで配信できるようにする

## 特徴

- A4縦 `210mm × 297mm`
- 左25mmの綴じ代
- 上下20mm、右15mmの余白
- 白黒印刷向けデザイン
- 日付、曜日、潮回り、干潮、満潮、潮位変化、備考欄を一覧表示
- SVGによる簡易潮位変化グラフ
- `@media print` による印刷最適化
- `lucide-react` の `Printer`, `MapPin`, `Info` を使用
- `data/tidedata.json` と `data/tide_data.json` の読み込みに対応

## 参照するデータ形式

### 年間潮汐データ: `public/data/tidedata.json`

`chiga-log` の `data/tidedata.json` と同じ、日付キーごとの配列を想定しています。

```json
{
  "2026-05-01": [
    {
      "time": "2026-05-01T04:50:00+09:00",
      "type": "high",
      "height": 1.37
    },
    {
      "time": "2026-05-01T10:12:00+09:00",
      "type": "low",
      "height": 0.62
    }
  ]
}
```

`height` はメートルで保持し、画面ではcmに変換して表示します。

### 直近潮汐データ: `public/data/tide_data.json`

Stormglass等のAPI由来データを想定した形式です。

```json
{
  "data": [
    {
      "time": "2026-05-04T09:53:00+00:00",
      "type": "high",
      "height": 0.36
    }
  ],
  "meta": {
    "datum": "MSL"
  }
}
```

年間データ `tidedata.json` が存在する場合は、そちらを優先します。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで表示されたURLを開いてください。

## 印刷・PDF保存

1. 画面上部の「印刷 / PDF保存」をクリック
2. 用紙サイズを `A4` に設定
3. 倍率を `100%` に設定
4. 余白は `なし` を推奨
5. 送信先をプリンタまたはPDF保存に設定

## GitHub Pagesで公開

このリポジトリには `.github/workflows/deploy.yml` を入れています。

GitHub側で Pages の Source を `GitHub Actions` にすると、`main` ブランチへのpush時に自動公開できます。

`vite.config.ts` の `base` は以下の想定です。

```ts
base: process.env.NODE_ENV === "production" ? "/tide-PDF/" : "/"
```

リポジトリ名を変える場合は、この値も変更してください。

## 注意

本ツールは印刷用レイアウトを生成するためのものです。  
実際の海上活動・入水判断・安全判断には、必ず海上保安庁、気象庁、自治体、現地ライフセーバー等の最新情報を確認してください。

潮汐データは、海上保安庁・気象庁等の公的データを使用・確認することを推奨します。

## License

MIT
