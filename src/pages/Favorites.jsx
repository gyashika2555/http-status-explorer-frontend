import { useEffect, useState } from "react";
import { getFavorites, updateFavorite, deleteFavorite, getHistory, clearHistory } from "../api/client.js";
import Skeleton from "../components/Skeleton.jsx";
import StatusChip from "../components/StatusChip.jsx";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draftNote, setDraftNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    getFavorites()
      .then((res) => setFavorites(res.data.data || []))
      .catch(() => setError("Could not reach the API. Is the backend running on port 5000?"));
  };

  const loadHistory = () => {
    getHistory(20)
      .then((res) => setHistory(res.data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getFavorites(), getHistory(20)])
      .then(([favoritesRes, historyRes]) => {
        setFavorites(favoritesRes.data.data || []);
        setHistory(historyRes.data.data || []);
        setError("");
      })
      .catch(() => setError("Could not reach the API. Is the backend running on port 5000?"))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (f) => {
    setEditingId(f._id);
    setDraftNote(f.notes || "");
  };

  const saveNote = async (id) => {
    await updateFavorite(id, { notes: draftNote });
    setEditingId(null);
    loadFavorites();
  };

  const removeFavorite = async (id) => {
    await deleteFavorite(id);
    loadFavorites();
  };

  const handleClearHistory = async () => {
    await clearHistory();
    loadHistory();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">// favorites</div>
        <h1 className="page-title">Saved status codes & notes</h1>
        <p className="page-sub">
          Status codes you've starred in the Explorer, with your own notes attached.
        </p>
      </div>

      {error && <div className="banner error">{error}</div>}

      {loading ? (
        <div className="grid-cards" style={{ marginBottom: 32 }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div className="code-card" key={idx} style={{ cursor: "default" }}>
              <Skeleton className="skeleton circle" width={120} height={28} />
              <Skeleton className="skeleton text" width="100%" style={{ marginTop: 6 }} />
              <Skeleton className="skeleton text" width="85%" />
              <Skeleton className="skeleton text" width="40%" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-icon">☆</div>
            <p>No favorites yet. Star a status code from the Explorer to save it here.</p>
          </div>
        </div>
      ) : (
        <div className="grid-cards" style={{ marginBottom: 32 }}>
          {favorites.map((f) => (
            <div className="code-card" key={f._id} style={{ cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <StatusChip code={f.statusCode} name={f.name} />
                <button className="close-btn" onClick={() => removeFavorite(f._id)} title="Remove favorite">✕</button>
              </div>

              {editingId === f._id ? (
                <>
                  <textarea
                    className="input"
                    rows={3}
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="Add a note..."
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => saveNote(f._id)}>save</button>
                    <button className="btn btn-ghost" onClick={() => setEditingId(null)}>cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="code-summary" style={{ minHeight: 20 }}>
                    {f.notes || <span style={{ color: "var(--text-faint)" }}>No notes yet.</span>}
                  </p>
                  <button className="btn btn-ghost" style={{ alignSelf: "flex-start", padding: "4px 0" }} onClick={() => startEdit(f)}>
                    edit note
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span>request history</span>
          {history.length > 0 && (
            <button className="btn btn-danger" style={{ padding: "4px 10px" }} onClick={handleClearHistory}>
              clear all
            </button>
          )}
        </div>
        {loading ? (
          <div>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="skeleton-row" key={idx}>
                <Skeleton className="skeleton circle" width={70} height={24} />
                <Skeleton className="skeleton text" width="88%" />
                <Skeleton className="skeleton text" width={56} />
                <Skeleton className="skeleton text" width={70} />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">000</div>
            <p>No tested requests yet.</p>
          </div>
        ) : (
          <div>
            {history.map((h) => (
              <div className="history-row" key={h._id}>
                {h.statusCode ? <StatusChip code={h.statusCode} /> : <span className="tag">failed</span>}
                <span className="history-url" title={h.testedUrl}>{h.method} {h.testedUrl}</span>
                <span className="history-time">{h.requestTime}ms</span>
                <span className="tag">{new Date(h.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
