# 😈 Flaky API

**"Don't rely on happy paths."**

Flaky APIは、フロントエンド開発者のために**「遅延」**と**「エラー」**をオンデマンドで提供するモックサーバーです。
あなたのアプリケーションが、最悪のネットワーク環境でも美しく動作することを証明するためのテストツールです。

## 🎯 Target & Motivation

ローカル開発環境は往々にして高速すぎます。
「ローディング中のスピナー」や「500エラー時のトースト通知」をテストしたい時、わざわざ Chrome DevTools の Network Throttling を設定したり、バックエンドのコードを書き換えるのは面倒ではありませんか？

Flaky APIを使えば、**URLパラメータを指定するだけ**で、意図的に品質の悪いAPIレスポンスを生成できます。

- **Loading UI Test**: 任意のミリ秒数だけレスポンスを遅延させます。
- **Error Handling Test**: 指定した確率で、指定したステータスコードのエラーを返します。
- **Shareable**: 設定を含むURLをチームメンバーに共有するだけで、誰でも同じ「劣悪な環境」を再現できます。

## 🚀 Live Demo

- **Dashboard (Generator UI):** [あなたのFirebase Hosting URLをここに貼る]
- **API Endpoint:** `[あなたのCloud Run URLをここに貼る]/flaky`

## 🛠 Features

### 1. Delay Simulation (遅延)
指定したミリ秒 (`delay`) だけサーバー側で待機してからレスポンスを返します。
ローディングアニメーションやスケルトンスクリーンの挙動確認に最適です。

### 2. Chaos Mode (カオスモード)
指定した確率 (`fail_rate`) でエラーを返します。
リトライ処理や、予期せぬエラー時のUI確認に使用します。

### 3. Custom Status Code (ステータスコード指定)
エラー時に返却するHTTPステータスコード (`error_code`) を指定できます。
`401 Unauthorized`, `404 Not Found`, `503 Service Unavailable` などの分岐テストが可能です。

## 📖 Usage

### API Request Example

```bash
# 2秒遅延し、50%の確率で 503 Service Unavailable を返すリクエスト
GET /flaky?delay=2000&fail_rate=50&error_code=503
```

## Dashboard
Web上のダッシュボード（Reactアプリ）から、GUIで設定値を調整し、テスト用URLを発行・コピーできます。

### 💻 Tech Stack
- Backend: Go (Echo)
- Frontend: React (TypeScript, Vite)
- Infrastructure: Google Cloud Run, Firebase Hosting
- CI/CD: GitHub Actions, Google Cloud Build

### 🏗 Local Development

#### Prerequisites
- Go 1.23+
- Node.js 20+

#### Backend (Go)
```bash
cd backend
go run main.go
# Server starts at http://localhost:8080
```

#### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# UI starts at http://localhost:5173
```
### ⚠️ Disclaimer
本サービスは個人開発によるデモアプリです。 予告なくサービスを停止する場合や、SLA（稼働保証）がない点をご了承ください。