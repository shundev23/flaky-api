// frontend/src/App.tsx
import { useState } from 'react';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  
  // 設定値
  const [failRate, setFailRate] = useState(50); // デフォルト50%で失敗させる
  const [delay, setDelay] = useState(1000);

  const callFlakyApi = async () => {
    setLoading(true);
    setResult(null);
    setIsError(false);
    setDuration(null);

    const startTime = performance.now();

    try {
      // 故障率(fail_rate) と 遅延(delay) をクエリに含める
      const response = await fetch(`http://localhost:8080/flaky?delay=${delay}&fail_rate=${failRate}`);
      const data = await response.json();
      
      const endTime = performance.now();
      setDuration(Math.round(endTime - startTime));

      // ステータスコードが200系以外ならエラー扱いにする
      if (!response.ok) {
        setIsError(true);
      }
      setResult(data);

    } catch (error) {
      // ネットワークエラーなど
      console.error(error);
      setIsError(true);
      setResult({ error: "Network Error or Server Crash" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>😈 Chaos API Tester</h1>
      
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: '#f9f9f9' }}>
        
        {/* 遅延の設定 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
            遅延時間: {delay} ms
          </label>
          <input 
            type="range" min="0" max="5000" step="100" 
            value={delay} onChange={(e) => setDelay(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* 故障率の設定 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: failRate > 70 ? 'red' : 'black' }}>
            爆発確率 (Fail Rate): {failRate} %
          </label>
          <input 
            type="range" min="0" max="100" 
            value={failRate} onChange={(e) => setFailRate(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'red' }} 
          />
          <small style={{ color: '#666' }}>数値を上げるほど500エラーが出やすくなります</small>
        </div>

        <button 
          onClick={callFlakyApi} disabled={loading}
          style={{ 
            width: '100%', padding: '15px', fontSize: '18px', 
            background: loading ? '#ccc' : '#222', color: 'white', 
            border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '祈っています...' : 'APIを叩く 👊'}
        </button>
      </div>

      {/* 結果表示エリア */}
      {result && (
        <div style={{ 
          marginTop: '20px', padding: '15px', borderRadius: '8px',
          border: isError ? '2px solid red' : '2px solid green',
          background: isError ? '#ffe6e6' : '#e6ffe6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: isError ? 'red' : 'green' }}>
            {isError ? '💥 爆発しました (500 Error)' : '🎉 成功しました (200 OK)'}
          </h3>
          <p style={{color: 'black'}}><strong>経過時間:</strong> {duration} ms</p>
          <pre style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', color: "black" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;