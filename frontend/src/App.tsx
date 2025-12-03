// frontend/src/App.tsx
import { useState } from 'react';

// 👇 Cloud RunのURL
const API_BASE_URL = "https://flaky-api-310901204016.asia-northeast1.run.app";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [copyMessage, setCopyMessage] = useState(""); // コピー完了メッセージ用
  
  // 設定値
  const [failRate, setFailRate] = useState(0);
  const [delay, setDelay] = useState(1000);
  const [errorCode, setErrorCode] = useState(500);

  // カスタムJSON用のState
  const [customJsonStr, setCustomJsonStr] = useState<string>('{\n  "message": "Hello custom world!",\n  "userId": 123\n}')

  // UTF-8対応のBase64エンコード関数
  const encodeBase64 = (str: string) => {
  try {
    // 1. 文字列をUTF-8のバイト列（Uint8Array）に変換
    const bytes = new TextEncoder().encode(str);
    
    // 2. バイト列をバイナリ文字列に変換
    // (btoaはバイナリ文字列しか受け付けないためこの工程が必要)
    const binary = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    
    // 3. Base64化
    return window.btoa(binary);
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
};

  // ユーザー提供用のURLをリアルタイム生成
  let generatedUrl = `${API_BASE_URL}/flaky?delay=${delay}&fail_rate=${failRate}&error_code=${errorCode}`;

  // JSONが入力されていればBase64化してパラメータに追加
  if (customJsonStr.trim()){
    const base64Json = encodeBase64(customJsonStr);
    generatedUrl += `&response=${base64Json}`;
  }

  const callFlakyApi = async () => {
    setLoading(true);
    setResult(null);
    setIsError(false);
    setDuration(null);

    const startTime = performance.now();

    try {
      // 生成されたURLを実際に叩いてみる
      const response = await fetch(generatedUrl);
      const data = await response.json();
      
      const endTime = performance.now();
      setDuration(Math.round(endTime - startTime));

      if (!response.ok) {
        setIsError(true);
      }
      setResult(data);

    } catch (error) {
      console.error(error);
      setIsError(true);
      setResult({ error: "Network Error or Server Crash" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopyMessage("✅ コピーしました！");
    setTimeout(() => setCopyMessage(""), 2000); // 2秒後にメッセージを消す
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>😈 Flaky API Generator</h1>
      <p style={{ color: '#666' }}>
        意図的に「遅延」や「エラー」が発生するAPIのURLを発行します。<br/>
        開発中のアプリのローディングやエラー処理のテストに使ってください。
      </p>
      
      <div style={{ border: '1px solid #ddd', padding: '25px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        {/* --- URL生成エリア (ここが新機能！) --- */}
        <div style={{ marginBottom: '30px', background: '#f0f4f8', padding: '15px', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
            👇 あなた専用のAPIエンドポイント
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={generatedUrl} 
              readOnly 
              style={{ 
                flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc',
                background: '#e9ecef', color: '#555', fontFamily: 'monospace'
              }}
            />
            <button 
              onClick={copyToClipboard}
              style={{ 
                padding: '0 20px', background: '#007bff', color: 'white', border: 'none', 
                borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              コピー
            </button>
          </div>
          {copyMessage && <p style={{ margin: '5px 0 0', color: 'green', fontSize: '12px' }}>{copyMessage}</p>}
        </div>

        <div style={{ marginBottom: '20px', color: 'black' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            返却したいJSONレスポンス
          </label>
          <textarea
            value={customJsonStr}
            onChange={(e) => setCustomJsonStr(e.target.value)}
            rows={5}
            style={{ 
              width: '100%', padding: '10px', fontFamily: 'monospace', borderRadius: '5px', border: '1px solid #ccc',
              backgroundColor: '#fafafa', color: 'black'
            }}
            placeholder='{"key": "value"}'
          />
          <small style={{ color: '#666' }}>※ 入力したJSONがそのままAPIから返ってきます</small>
        </div>

        {/* --- 設定スライダー --- */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: "black" }}>
            遅延時間: {delay} ms
          </label>
          <input 
            type="range" min="0" max="5000" step="100" 
            value={delay} onChange={(e) => setDelay(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: failRate > 70 ? 'red' : 'black' }}>
            爆発確率 (Fail Rate): {failRate} %
          </label>
          <input 
            type="range" min="0" max="100" 
            value={failRate} onChange={(e) => setFailRate(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'red' }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            発生させるエラー (Status Code)
          </label>
          <select 
          value={errorCode} 
          onChange={(e) => setErrorCode(Number(e.target.value))}
          style={{ 
            width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' 
          }}
          >
            <option value="400">400 Bad Request (不正なリクエスト)</option>
            <option value="401">401 Unauthorized (未認証・ログアウト)</option>
            <option value="403">403 Forbidden (権限なし)</option>
            <option value="404">404 Not Found (見つからない)</option>
            <option value="408">408 Request Timeout (タイムアウト)</option>
            <option value="429">429 Too Many Requests (リクエスト過多)</option>
            <option value="500">500 Internal Server Error (サーバーエラー)</option>
            <option value="503">503 Service Unavailable (メンテ中)</option>
            <option value="504">504 Gateway Timeout (応答なし)</option>
          </select>
        </div>

        {/* --- テスト実行ボタン --- */}
        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
        
        <p style={{ fontSize: '14px', marginBottom: '10px' }}>試してみる：</p>
        <button 
          onClick={callFlakyApi} disabled={loading}
          style={{ 
            width: '100%', padding: '12px', fontSize: '16px', 
            background: loading ? '#ccc' : '#333', color: 'white', 
            border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '通信中...' : 'この設定でテスト実行 👊'}
        </button>
      </div>

      {/* --- 結果表示 --- */}
      {result && (
        <div style={{ 
          marginTop: '20px', padding: '15px', borderRadius: '8px',
          border: isError ? '2px solid red' : '2px solid green',
          background: isError ? '#ffe6e6' : '#e6ffe6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: isError ? 'red' : 'green' }}>
            {isError ? `💥 ${result.status || 'Error'} Failed` : '🎉 200 OK'}
          </h3>
          <p style={{color: 'black'}}><strong>実際の待ち時間:</strong> {duration} ms</p>
          <div style={{ fontSize: '12px', color: '#666' }}>※本番サーバーからのレスポンスです</div>
        </div>
      )}
    </div>
  );
}

export default App;