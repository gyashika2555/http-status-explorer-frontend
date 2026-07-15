import { useState } from "react";
import { runTest } from "../api/client.js";
import StatusChip from "../components/StatusChip.jsx";
import { categoryOf } from "../components/StatusChip.jsx";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];

const PRESETS = [
  { label: "200 OK", url: "https://httpbin.org/status/200" },
  { label: "201 Created", url: "https://httpbin.org/status/201" },
  { label: "301 Redirect", url: "https://httpbin.org/redirect-to?url=https://httpbin.org/get" },
  { label: "404 Not Found", url: "https://httpbin.org/status/404" },
  { label: "500 Server Error", url: "https://httpbin.org/status/500" },
  { label: "Delay 2s", url: "https://httpbin.org/delay/2" },
];

export default function ApiTester() {
  const [url, setUrl] = useState("https://httpbin.org/status/200");
  const [method, setMethod] = useState("GET");
  const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
  const [bodyText, setBodyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    let headers = {};
    try {
      headers = headersText.trim() ? JSON.parse(headersText) : {};
    } catch {
      setError("Headers must be valid JSON");
      setLoading(false);
      return;
    }

    let body;
    if (bodyText.trim() && !["GET", "HEAD"].includes(method)) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        body = bodyText; // send as raw text if not valid JSON
      }
    }

    try {
      const res = await runTest({ url, method, headers, body });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.error || "Request failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">// api tester</div>
        <h1 className="page-title">Send a real request</h1>
        <p className="page-sub">
          Requests are proxied through the backend with Axios so there are no browser CORS
          restrictions. Every test is logged to History.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {PRESETS.map((p) => (
          <button key={p.label} className="pill" onClick={() => { setUrl(p.url); setMethod("GET"); }}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header"><span>request</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <select className="input" style={{ width: 120, flex: "none" }} value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              className="input"
              placeholder="https://api.example.com/resource"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={loading || !url}>
              {loading ? <span className="loader" /> : "send →"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="field-label">headers (JSON)</label>
              <textarea className="input" value={headersText} onChange={(e) => setHeadersText(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="field-label">body (JSON, optional)</label>
              <textarea
                className="input"
                placeholder='{ "key": "value" }'
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={4}
                disabled={["GET", "HEAD"].includes(method)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && <div className="banner error">⚠ {error}</div>}

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="panel">
            <div className="panel-header"><span>status</span></div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <StatusChip code={result.status} name={result.statusText} />
                <span className="tag">{result.requestTime}ms</span>
              </div>
              {result.explanation && (
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                  {result.explanation.explanation}
                </p>
              )}
            </div>
            <div className="panel-header"><span>response headers</span></div>
            <div style={{ padding: "8px 16px 16px" }}>
              {Object.entries(result.headers || {}).map(([k, v]) => (
                <div className="header-row" key={k}>
                  <span className="header-key">{k}</span>
                  <span className="header-val">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span>response body</span></div>
            <div style={{ padding: 16 }}>
              <div className="response-block">
                {typeof result.body === "string" ? result.body : JSON.stringify(result.body, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && !error && !loading && (
        <div className="empty-state">
          <div className="empty-icon">···</div>
          <p>Pick a preset above or enter a URL, then hit send.</p>
        </div>
      )}
    </>
  );
}
