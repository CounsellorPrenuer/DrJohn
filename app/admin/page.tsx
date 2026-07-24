"use client";

import { useState, useEffect } from "react";

interface Attempt {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number | null;
  city: string | null;
  sex: string | null;
  experience: number | null;
  test_type: string;
  status: string;
  payment_id: string | null;
  created_at: string;
  report: string | null;
}

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://mentoria-payments-worker.sarwatemihika.workers.dev/admin/attempts", {
        method: "GET",
        headers: {
          "X-Admin-Password": password,
        },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAttempts(data.attempts);
        setAuthorized(true);
        // Save token in session
        sessionStorage.setItem("admin_password", password);
      } else {
        setError(data.message || "Invalid Admin Password.");
      }
    } catch (err) {
      setError("Failed to fetch database records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async (pass: string) => {
    setLoading(true);
    try {
      const res = await fetch("https://mentoria-payments-worker.sarwatemihika.workers.dev/admin/attempts", {
        method: "GET",
        headers: {
          "X-Admin-Password": pass,
        },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAttempts(data.attempts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = sessionStorage.getItem("admin_password");
    if (savedPassword) {
      setPassword(savedPassword);
      setAuthorized(true);
      fetchAttempts(savedPassword);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_password");
    setAuthorized(false);
    setPassword("");
    setAttempts([]);
    setSelectedAttempt(null);
  };

  if (!authorized) {
    return (
      <div style={{ background: "#F1F5F9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", width: "100%", maxWidth: 400 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E3A8A", marginBottom: 8, textAlign: "center" }}>Admin Login</h1>
          <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", marginBottom: 24 }}>Enter password to access test candidate records.</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontSize: 15, outline: "none" }}
              />
            </div>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>❌ {error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "12px", background: "#1E3A8A", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Authorizing..." : "Login →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#1E293B" }}>
      {/* Navbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1E3A8A", margin: 0 }}>Mentoria Admin Panel</h1>
          <p style={{ color: "#64748B", fontSize: 12, margin: "2px 0 0" }}>View test candidates, payment logs, and psychometric reports.</p>
        </div>
        <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Logout</button>
      </header>

      {/* Main Content */}
      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: selectedAttempt ? "1fr 1fr" : "1fr", gap: 24 }}>
          {/* List Section */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#334155" }}>
              Total Candidates: {attempts.length}
            </h2>
            {loading ? (
              <p style={{ color: "#64748B", fontSize: 14 }}>Loading candidate data...</p>
            ) : attempts.length === 0 ? (
              <p style={{ color: "#64748B", fontSize: 14 }}>No candidate attempts stored yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "#64748B" }}>
                      <th style={{ padding: "10px 8px" }}>Name</th>
                      <th style={{ padding: "10px 8px" }}>Contact</th>
                      <th style={{ padding: "10px 8px" }}>Test Type</th>
                      <th style={{ padding: "10px 8px" }}>Status</th>
                      <th style={{ padding: "10px 8px" }}>Payment ID</th>
                      <th style={{ padding: "10px 8px" }}>Date</th>
                      <th style={{ padding: "10px 8px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((att) => (
                      <tr key={att.id} style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer" }} onClick={() => setSelectedAttempt(att)}>
                        <td style={{ padding: "12px 8px", fontWeight: 600 }}>{att.name}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <div>{att.email}</div>
                          <div style={{ color: "#64748B", fontSize: 11 }}>{att.phone}</div>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ background: att.test_type === "tna" ? "#EEF2FF" : "#F0FDF4", color: att.test_type === "tna" ? "#4338CA" : "#15803D", padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>
                            {att.test_type}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ color: att.status === "completed" ? "#059669" : "#D97706", fontWeight: 600 }}>
                            {att.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px", fontFamily: "monospace", color: "#475569" }}>{att.payment_id || "N/A"}</td>
                        <td style={{ padding: "12px 8px", color: "#64748B" }}>{new Date(att.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <button style={{ padding: "4px 8px", background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1D4ED8", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>View Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Details Section */}
          {selectedAttempt && (
            <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "sticky", top: 100 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1E3A8A" }}>Candidate Report Details</h2>
                <button onClick={() => setSelectedAttempt(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8" }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, fontSize: 13 }}>
                <div><strong>Name:</strong> {selectedAttempt.name}</div>
                <div><strong>Age:</strong> {selectedAttempt.age || "N/A"}</div>
                <div><strong>Email:</strong> {selectedAttempt.email}</div>
                <div><strong>Phone:</strong> {selectedAttempt.phone}</div>
                <div><strong>City:</strong> {selectedAttempt.city || "N/A"}</div>
                <div><strong>Sex/Designation:</strong> {selectedAttempt.sex || "N/A"}</div>
                <div><strong>Work Exp:</strong> {selectedAttempt.experience || 0} years</div>
                <div><strong>Payment ID:</strong> {selectedAttempt.payment_id || "N/A"}</div>
              </div>

              <hr style={{ border: "0", borderTop: "1px solid #E2E8F0", marginBottom: 16 }} />

              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Generated AI Assessment Report:</h3>
              <div style={{ maxHeight: "400px", overflowY: "auto", padding: 14, background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#334155" }}>
                {selectedAttempt.report || "Candidate has not completed the test or report generation failed."}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
