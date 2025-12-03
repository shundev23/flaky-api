# Flaky API 😈

意図的に「遅延」や「エラー」を発生させるAPIモックサーバー。
フロントエンド開発における「ローディング表示」や「エラーハンドリング」のテストに使用します。

## Features

- **Delay Simulator**: 指定したミリ秒数だけレスポンスを遅延させる。
- **Chaos Mode**: 指定した確率(%)で 500 Error を返す。

## Tech Stack

- **Backend**: Go (Echo)
- **Frontend**: React (Vite, TypeScript)
- **Infrastructure**: (Planned) Google Cloud Run

## How to Run

### Backend
```bash
cd backend
go run main.go
# Server starts at http://localhost:8080
cd frontend
npm install
npm run dev
# UI starts at http://localhost:5173
---
```

## 注意事項
これはデモ用のアプリであり、SLA（稼働保証）はありません