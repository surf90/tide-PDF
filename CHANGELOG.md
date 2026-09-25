# Changelog

このプロジェクトの主な変更を記録します。形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/)、
バージョンは [Semantic Versioning](https://semver.org/lang/ja/) に従います。
過去の履歴は、この CHANGELOG を作成した時点で Git の履歴からまとめ直したものです（依存パッケージの更新は省略）。

## [Unreleased]

### Fixed

- 潮汐データを読み込めないとき、架空のサンプル値で表を埋めていた問題。失敗時・該当月のデータがないときは表を空欄にし、画面に警告を出す

### Added

- デプロイ前に `npm test` を実行
- 型定義（`@types/react`・`@types/react-dom`・`vite/client`）と `npm run typecheck` を追加し、デプロイ前に型チェック
- README にデータの扱い・テスト手順・関連を追記

## [0.1.0] - 2026-05-04

- 初回公開：1 か月分の潮汐を A4 縦・モノクロ印刷用に整形
