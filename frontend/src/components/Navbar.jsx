import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandText}>Queue<span style={{ color: "var(--accent)" }}>Less</span></span>
        </Link>

        <div style={styles.links}>
          {!user ? (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: "8px 20px" }}>
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" style={styles.link}>Admin Panel</Link>
              ) : (
                <Link to="/dashboard" style={styles.link}>My Queue</Link>
              )}
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.roleBadge}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: "8px 16px", fontSize: "13px" }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    borderBottom: "1px solid var(--border)",
    background: "rgba(10,10,15,0.95)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandIcon: { fontSize: "22px" },
  brandText: {
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  link: {
    color: "var(--text2)",
    fontSize: "15px",
    fontWeight: "600",
    transition: "color 0.2s",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: "700",
    background: "rgba(108,99,255,0.2)",
    color: "var(--accent)",
    padding: "2px 8px",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};
