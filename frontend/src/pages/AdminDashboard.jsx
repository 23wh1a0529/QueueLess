import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllTokens, updateTokenStatus, getQueueStatus, getAllUsers } from "../services/api";

const statusClass = {
  waiting: "badge-waiting",
  serving: "badge-serving",
  completed: "badge-completed",
  skipped: "badge-skipped",
};

const statusOptions = ["waiting", "serving", "completed", "skipped"];

export default function AdminDashboard() {
  const [tokens, setTokens] = useState([]);
  const [users, setUsers] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("queue");
  const [updating, setUpdating] = useState(null);

  const fetchData = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const [tokensRes, statusRes, usersRes] = await Promise.all([
        getAllTokens(params),
        getQueueStatus(),
        getAllUsers(),
      ]);
      setTokens(tokensRes.data.tokens);
      setQueueStatus(statusRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleStatusUpdate = async (tokenId, newStatus) => {
    setUpdating(tokenId);
    try {
      await updateTokenStatus(tokenId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const callNext = async () => {
    const nextToken = tokens.find((t) => t.status === "waiting");
    if (!nextToken) {
      toast.error("No tokens waiting in queue");
      return;
    }
    await handleStatusUpdate(nextToken._id, "serving");
  };

  if (loading) return <div className="spinner" />;

  const counts = {
    waiting: tokens.filter((t) => t.status === "waiting").length,
    serving: tokens.filter((t) => t.status === "serving").length,
    completed: tokens.filter((t) => t.status === "completed").length,
    skipped: tokens.filter((t) => t.status === "skipped").length,
  };

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div className="flex-between" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Manage and control the queue</p>
        </div>
        <button className="btn btn-success" onClick={callNext} style={{ fontSize: "15px" }}>
          ▶ Call Next
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: "32px" }}>
        {[
          { label: "Waiting", count: counts.waiting, color: "var(--yellow)" },
          { label: "Serving", count: counts.serving, color: "var(--accent)" },
          { label: "Completed", count: counts.completed, color: "var(--green)" },
          { label: "Skipped", count: counts.skipped, color: "var(--red)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "36px", fontWeight: "700", color: s.color }}>
              {s.count}
            </div>
          </div>
        ))}
      </div>

      {/* Currently Serving Banner */}
      {queueStatus?.currentlyServing !== "None" && (
        <div style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "var(--radius)", padding: "16px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "20px" }}>📢</span>
          <span style={{ fontWeight: "700" }}>Now Serving:</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: "700", color: "var(--accent)" }}>
            {queueStatus.currentlyServing}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg3)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {["queue", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              background: activeTab === tab ? "var(--accent)" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--text2)",
              transition: "all 0.2s",
            }}
          >
            {tab === "queue" ? `Queue (${tokens.length})` : `Users (${users.length})`}
          </button>
        ))}
      </div>

      {activeTab === "queue" && (
        <div className="card">
          {/* Filter */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {["", "waiting", "serving", "completed", "skipped"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: filter === s ? "var(--accent)" : "var(--border)",
                  background: filter === s ? "rgba(108,99,255,0.15)" : "transparent",
                  color: filter === s ? "var(--accent)" : "var(--text2)",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  cursor: "pointer",
                }}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Token", "User", "Purpose", "Status", "Time", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "var(--text2)" }}>
                      No tokens found
                    </td>
                  </tr>
                ) : (
                  tokens.map((t) => (
                    <tr key={t._id}>
                      <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                        {t.tokenNumber}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "14px", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontWeight: "600" }}>{t.userId?.name}</div>
                        <div style={{ color: "var(--text2)", fontSize: "12px" }}>{t.userId?.email}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px", color: "var(--text2)", borderBottom: "1px solid var(--border)" }}>{t.purpose}</td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                        <span className={`badge ${statusClass[t.status]}`}>{t.status}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "var(--text2)", borderBottom: "1px solid var(--border)" }}>
                        {new Date(t.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                        <select
                          value={t.status}
                          disabled={updating === t._id}
                          onChange={(e) => handleStatusUpdate(t._id, e.target.value)}
                          style={{
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            color: "var(--text)",
                            padding: "6px 10px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="card">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name", "Email", "Role", "Joined"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ padding: "12px 14px", fontWeight: "600", borderBottom: "1px solid var(--border)" }}>{u.name}</td>
                  <td style={{ padding: "12px 14px", color: "var(--text2)", fontSize: "13px", borderBottom: "1px solid var(--border)" }}>{u.email}</td>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: "700",
                      background: u.role === "admin" ? "rgba(255,101,132,0.15)" : "rgba(108,99,255,0.15)",
                      color: u.role === "admin" ? "var(--accent2)" : "var(--accent)",
                      padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text2)", fontSize: "12px", borderBottom: "1px solid var(--border)" }}>
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
