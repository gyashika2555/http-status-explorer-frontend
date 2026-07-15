import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, getHistory, getFavorites } from "../api/client.js";
import Skeleton from "../components/Skeleton.jsx";
import StatusChip from "../components/StatusChip.jsx";

const CAT_COLOR = { "1xx": "var(--c-1xx)", "2xx": "var(--c-2xx)", "3xx": "var(--c-3xx)", "4xx": "var(--c-4xx)", "5xx": "var(--c-5xx)" };

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCategories(),
      getHistory(5),
      getFavorites(),
    ])
      .then(([categoriesRes, historyRes, favoritesRes]) => {
        setCategories(categoriesRes.data.data || []);
        setHistory(historyRes.data.data || []);
        setFavorites(favoritesRes.data.data || []);
        setError("");
      })
      .catch(() => setError("Could not reach the API. Is the backend running on port 5000?"))
      .finally(() => setLoading(false));
  }, []);

  const totalCodes = (categories || []).reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">// dashboard</div>
        <h1 className="page-title">HTTP Status Code Explorer</h1>
        <p className="page-sub">
          Browse every status code, fire real requests against live endpoints, and build a
          personal reference of the ones you use most.
        </p>
      </div>

      {error && <div className="banner error">{error}</div>}

      <div className="stat-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div className="stat-card" key={idx}>
              <div className="stat-bar" style={{ background: "var(--c-2xx)" }} />
              <Skeleton className="skeleton title" width="60%" style={{ marginBottom: 10 }} />
              <Skeleton className="skeleton text" width="90%" style={{ marginBottom: 8 }} />
              <Skeleton className="skeleton text" width="70%" />
            </div>
          ))
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-bar" style={{ background: "var(--c-2xx)" }} />
              <div className="stat-num">{totalCodes || "—"}</div>
              <div className="stat-label">status codes indexed</div>
            </div>
            {categories.map((c) => (
              <div className="stat-card" key={c.category}>
                <div className="stat-bar" style={{ background: CAT_COLOR[c.category] }} />
                <div className="stat-num mono">{c.count}</div>
                <div className="stat-label">{c.category} · {c.label}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        <div className="panel">
          <div className="panel-header">
            <span>recent requests</span>
            <Link to="/tester" className="btn btn-ghost" style={{ padding: "4px 10px" }}>
              open tester →
            </Link>
          </div>
          {loading ? (
            <div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div className="skeleton-row" key={idx}>
                  <Skeleton className="skeleton circle" width={70} height={24} />
                  <Skeleton className="skeleton text" width="90%" />
                  <Skeleton className="skeleton text" width={56} />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">000</div>
              <p>No requests tested yet. Head to the API Tester to send your first one.</p>
            </div>
          ) : (
            <div>
              {history.map((h) => (
                <div className="history-row" key={h._id}>
                  {h.statusCode ? <StatusChip code={h.statusCode} /> : <span className="tag">failed</span>}
                  <span className="history-url" title={h.testedUrl}>{h.method} {h.testedUrl}</span>
                  <span className="history-time">{h.requestTime}ms</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>favorites</span>
            <Link to="/favorites" className="btn btn-ghost" style={{ padding: "4px 10px" }}>
              view all →
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="skeleton circle" width={84} height={32} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">☆</div>
              <p>Star status codes in the Explorer to pin them here.</p>
            </div>
          ) : (
            <div style={{ padding: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {favorites.map((f) => (
                <StatusChip key={f._id} code={f.statusCode} name={f.name} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }} className="panel">
        <div className="panel-header"><span>quick links</span></div>
        <div style={{ padding: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/explorer" className="btn">browse status codes</Link>
          <Link to="/tester" className="btn">test an endpoint</Link>
          <Link to="/favorites" className="btn">manage favorites</Link>
        </div>
      </div>
    </>
  );
}
