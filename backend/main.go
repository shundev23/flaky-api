package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	// CORS設定：フロントエンドからのリクエストに合わせる
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		// AllowOrigins: []string{"http://localhost:5173"},
		AllowOrigins: []string{"*"}, // 全てのアクセスを許可するため、ワイルドカードを設定
		AllowMethods: []string{http.MethodGet, http.MethodPost},
	}))

	// ルートパス
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, Flaky API!")
	})

	// 遅延API
	e.GET("/flaky", func(c echo.Context) error {
		// 1.クエリパラメータからdelayを取得
		delayParam := c.QueryParam("delay")
		failRateParam := c.QueryParam("fail_rate")   // 失敗率（0~100）
		errorCodeParam := c.QueryParam("error_code") // フロントから追加したいステータスコードを受け取る

		responseBase64 := c.QueryParam("response")

		delayMs, _ := strconv.Atoi(delayParam)
		failRate, _ := strconv.Atoi(failRateParam)
		errorCode, err := strconv.Atoi(errorCodeParam) // エラーコードのパース(指定がなければ500にする)
		if err != nil || errorCode == 0 {
			errorCode = http.StatusInternalServerError // 500
		}

		// 2.カオス判定
		if failRate > 0 && rand.Intn(100) < failRate {
			return c.JSON(errorCode, map[string]interface{}{
				"error":   "💥 Chaos triggered.",
				"code":    errorCode,
				"message": http.StatusText(errorCode),
			})
		}

		// 3.遅延処理
		if delayMs > 0 {
			time.Sleep(time.Duration(delayMs) * time.Millisecond)
		}

		// 4.レスポンス生成
		// カスタムJSONが指定されていたら、デコードして返す
		if responseBase64 != "" {
			// 【重要】URLデコードの過程で '+' がスペースに化ける問題の対策
			// Base64文字列の中にスペースが混じっていたら + に戻す
			safeBase64 := strings.ReplaceAll(responseBase64, " ", "+")

			decodedBytes, err := base64.StdEncoding.DecodeString(safeBase64)
			if err != nil {
				// ログにエラーを出す（Cloud Runのログで見れるようになります）
				fmt.Printf("Base64 Decode Error: %v\nString: %s\n", err, safeBase64)
			} else {
				var customData interface{}
				if jsonErr := json.Unmarshal(decodedBytes, &customData); jsonErr == nil {
					return c.JSON(http.StatusOK, customData)
				} else {
					fmt.Printf("JSON Unmarshal Error: %v\n", jsonErr)
				}
			}
		}

		return c.JSON(http.StatusOK, map[string]string{
			"message":    "🎉 Success! You survived the chaos.",
			"delayed_ms": strconv.Itoa(delayMs),
		})
	})

	e.Logger.Fatal(e.Start(":8080"))
}
