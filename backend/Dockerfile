# backend/Dockerfile

# 1. ビルド用ステージ（Goのコンパイラが入った環境）
FROM golang:1.23-alpine as builder

WORKDIR /app

# 依存関係のファイルを先にコピー（キャッシュを効かせるため）
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピーしてビルド
COPY . .
RUN go build -o main .

# 2. 実行用ステージ（軽量なLinux環境）
FROM alpine:latest

WORKDIR /app
# ビルドしたバイナリだけを持ってくる
COPY --from=builder /app/main .

EXPOSE 8080

# 起動コマンド
CMD ["./main"]