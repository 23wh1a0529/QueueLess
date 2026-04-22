import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { generateToken, getMyTokens, getQueueStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusClass = {
  waiting: "badge-waiting",
  serving: "badge-serving",
  completed: "badge-completed",
  skipped: "badge-skipped",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [purpose, setPurpose] = useState("General");

  const fetchData = async () => {
    try {
      const [tokensRes, statusRes] = await Promise.all([
        getMyTokens(),
        getQueueStatus(),
      ]);
      setTokens(tokensRes.data.tokens);
      setQueueInfo(tokensRes.data.queueInfo);
      setQueueStatus(statusRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateToken({ purpose });
      toast.success("Token generated!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate token");
    } finally {
      setGenerating(false);
    }
  };

  const activeToken = tokens.find(
    (t) => t.status === "waiting" || t.status === "serving"
  );

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div className="flex-between" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">My Queue</h1>
          <p className="page-sub">Hello, {user.name} 👋</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "32px" }}>
        {/* Active Token Card */}
        <div className="card" style={{ borderColor: activeToken ? "var(--accent)" : "var(--border)" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
            Your Active Token
          </h3>
          {activeToken ? (
            <>
              <div className="token-big">{activeToken.tokenNumber}</div>
              <div style={{ marginTop: "12px" }}>
                <span className={`badge ${statusClass[activeToken.status]}`}>
                  {activeToken.status}
                </span>
              </div>
              {activeToken.status === "waiting" && queueInfo && (
                <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={styles.infoBox}>
                    <div style={styles.infoLabel}>Position</div>
                    <div style={styles.infoValue}>#{queueInfo.position}</div>
                  </div>
                  <div style={styles.infoBox}>
                    <div style={styles.infoLabel}>Est. Wait</div>
                    <div style={styles.infoValue}>{queueInfo.estimatedWait}m</div>
                  </div>
                </div>
              )}
              {activeToken.status === "serving" && (
                <div style={{ marginTop: "16px", padding: "12px", background: "rgba(108,99,255,0.1)", borderRadius: "8px", color: "var(--accent)", fontWeight: "700", fontSize: "14px" }}>
                  🎉 It's your turn! Please proceed to the counter.
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "var(--text2)", fontSize: "14px", marginTop: "8px" }}>
              No active token. Generate one below.
            </div>
          )}
        </div>

        {/* Live Queue Status */}
        <div className="card">
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
            Live Queue Status
          </h3>
          {queueStatus && (
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Now Serving</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: "700", color: "var(--accent)" }}>
                  {queueStatus.currentlyServing}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={styles.infoBox}>
                  <div style={styles.infoLabel}>Waiting</div>
                  <div style={{ ...styles.infoValue, color: "var(--yellow)" }}>{queueStatus.waitingCount}</div>
                </div>
                <div style={styles.infoBox}>
                  <div style={styles.infoLabel}>Done Today</div>
                  <div style={{ ...styles.infoValue, color: "var(--green)" }}>{queueStatus.completedToday}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Token */}
      {!activeToken && (
        <div className="card" style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Generate New Token</h3>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label>Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option>General</option>
                <option>Billing</option>
                <option>Support</option>
                <option>Enquiry</option>
                <option>Document Submission</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
              style={{ whiteSpace: "nowrap" }}
            >
              {generating ? "Generating..." : "🎫 Get Token"}
            </button>
          </div>
        </div>
      )}

      {/* Token History */}
      <div className="card">
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Token History</h3>
        {tokens.length === 0 ? (
          <p style={{ color: "var(--text2)", fontSize: "14px" }}>No tokens yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Token", "Purpose", "Status", "Date"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t._id} style={styles.tr}>
                    <td style={{ ...styles.td, fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--accent)" }}>{t.tokenNumber}</td>
                    <td style={styles.td}>{t.purpose}</td>
                    <td style={styles.td}><span className={`badge ${statusClass[t.status]}`}>{t.status}</span></td>
                    <td style={{ ...styles.td, color: "var(--text2)", fontSize: "13px" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  infoBox: {
    background: "var(--bg3)",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text2)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  infoValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "24px",
    fontWeight: "700",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text2)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid var(--border)",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    borderBottom: "1px solid var(--border)",
  },
  tr: {},
};
