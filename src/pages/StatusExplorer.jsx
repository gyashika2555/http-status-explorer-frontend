import { useEffect, useState } from "react";
import { getStatusCodes, addFavorite } from "../api/client.js";
import Skeleton from "../components/Skeleton.jsx";
import { categoryOf } from "../components/StatusChip.jsx";

const CATEGORIES = [
  { key: "", label: "all" },
  { key: "1xx", label: "1xx informational" },
  { key: "2xx", label: "2xx success" },
  { key: "3xx", label: "3xx redirection" },
  { key: "4xx", label: "4xx client error" },
  { key: "5xx", label: "5xx server error" },
];

export default function StatusExplorer() {
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;

    const timer = setTimeout(() => {
      getStatusCodes(params)
        .then((res) => {
          setCodes(res.data.data || []);
          setError("");
        })
        .catch(() => setError("Could not reach the API. Is the backend running on port 5000?"))
        .finally(() => setLoading(false));
    }, 200); // small debounce on typing

    return () => clearTimeout(timer);
  }, [search, category]);

  const handleFavorite = async (code) => {
    try {
      await addFavorite({ statusCode: code.code, name: code.name, notes: "" });
      setSavedMsg(`Saved ${code.code} ${code.name} to favorites`);
      setTimeout(() => setSavedMsg(""), 2500);
    } catch (err) {
      setSavedMsg(err.response?.data?.error || "Could not save favorite");
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">// status explorer</div>
        <h1 className="page-title">Browse & search status codes</h1>
        <p className="page-sub">
          Filter by category or search by code number, name, or keyword. Click any card for the
          full explanation.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search by code, name, or keyword — e.g. 404, timeout, redirect"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="pill-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`pill ${category === c.key ? "active" : ""}`}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <div className="banner error">{error}</div>}
      {savedMsg && <div className="banner success">{savedMsg}</div>}

      {loading ? (
        <div className="grid-cards">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div className="code-card" key={idx}>
              <Skeleton className="skeleton title" width="45%" style={{ marginBottom: 8 }} />
              <Skeleton className="skeleton text" width="70%" style={{ marginBottom: 6 }} />
              <Skeleton className="skeleton text" width="100%" style={{ marginBottom: 6 }} />
              <Skeleton className="skeleton text" width="86%" />
            </div>
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">404</div>
          <p>No status codes match your search.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {codes.map((c) => (
            <div className="code-card" key={c.code} onClick={() => setSelected(c)}>
              <div className={`code-num c-${c.category}`} style={{ color: `var(--c-${c.category})` }}>
                {c.code}
              </div>
              <div className="code-name">{c.name}</div>
              <div className="code-summary">{c.summary}</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span>status detail</span>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div
                  className="mono"
                  style={{ fontSize: 34, fontWeight: 800, color: `var(--c-${categoryOf(selected.code)})` }}
                >
                  {selected.code}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{selected.name}</div>
                  <div className="tag" style={{ marginTop: 4, display: "inline-block" }}>{selected.category}</div>
                </div>
              </div>

              <div className="kv-row">
                <div className="kv-key">explanation</div>
                <div className="kv-val">{selected.explanation}</div>
              </div>
              <div className="kv-row">
                <div className="kv-key">common causes</div>
                <div className="kv-val">
                  <div className="tag-list">
                    {selected.commonCauses?.map((cause, i) => (
                      <span className="tag" key={i}>{cause}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="kv-row">
                <div className="kv-key">example</div>
                <div className="kv-val">{selected.example}</div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button className="btn btn-primary" onClick={() => handleFavorite(selected)}>
                  ★ add to favorites
                </button>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
