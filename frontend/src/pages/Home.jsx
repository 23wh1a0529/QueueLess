import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQueueStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getQueueStatus()
      .then((res) => setStatus(res.data))
      .catch(() => {});

    const interval = setInterval(() => {
      getQueueStatus()
        .then((res) => setStatus(res.data))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div className="container" style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "80px" }}>
          <div style={styles.heroBadge}>✦ Digital Queue System</div>
          <h1 style={styles.heroTitle}>
            Skip the Line.<br />
            <span style={{ color: "var(--accent)" }}>Not the Service.</span>
          </h1>
          <p style={styles.heroSub}>
            Generate your token online, track your position in real time,<br />
            and show up only when it's your turn.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "36px" }}>
            {user ? (
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="btn btn-primary"
                style={{ fontSize: "16px", padding: "14px 32px" }}
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ fontSize: "16px", padding: "14px 32px" }}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live Status */}
      {status && (
        <section style={{ padding: "40px 0" }}>
          <div className="container">
            <h2 style={{ textAlign: "center", fontSize: "18px", color: "var(--text2)", marginBottom: "24px", fontWeight: "600" }}>
              LIVE QUEUE STATUS
            </h2>
            <div className="grid-3">
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ color: "var(--text2)", fontSize: "13px", fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Now Serving</div>
                <div className="token-big">{status.currentlyServing}</div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ color: "var(--text2)", fontSize: "13px", fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>In Queue</div>
                <div className="token-big" style={{ color: "var(--yellow)" }}>{status.waitingCount}</div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ color: "var(--text2)", fontSize: "13px", fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Est. Wait (new)</div>
                <div className="token-big" style={{ color: "var(--green)" }}>{status.estimatedWaitForNew}m</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="card">
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: "1.7" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  { icon: "🎫", title: "Instant Token", desc: "Generate your digital token in seconds. No physical counter visit needed." },
  { icon: "📊", title: "Live Tracking", desc: "See your position in queue and estimated wait time updated every 10 seconds." },
  { icon: "🛡️", title: "Secure Access", desc: "JWT-based authentication with role-based access for users and admins." },
];

const styles = {
  hero: {
    borderBottom: "1px solid var(--border)",
    background: "radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 65%)",
  },
  heroBadge: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "var(--accent)",
    border: "1px solid rgba(108,99,255,0.3)",
    borderRadius: "20px",
    padding: "6px 16px",
    marginBottom: "24px",
  },
  heroTitle: {
    fontSize: "clamp(40px, 6vw, 72px)",
    fontWeight: "800",
    lineHeight: "1.1",
    letterSpacing: "-2px",
  },
  heroSub: {
    fontSize: "18px",
    color: "var(--text2)",
    marginTop: "20px",
    lineHeight: "1.7",
  },
};
