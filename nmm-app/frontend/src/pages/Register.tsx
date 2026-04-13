import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    setLoading(true);
    try {
      await axios.post("/api/auth/register", { email, password });
      setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke halaman login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setErrorMsg("Pendaftaran gagal. Email mungkin sudah terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: "#f9fafb", border: "1.5px solid #e5e7eb",
    borderRadius: 10, color: "#111827",
    fontSize: "0.95rem", fontFamily: "'Supermercado One', sans-serif",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: 700,
    color: "#6b7280", marginBottom: 7,
    letterSpacing: "0.6px", textTransform: "uppercase",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg, #f8f0f4 0%, #f4f5f9 50%, #f0f4f8 100%)",
      fontFamily: "'Supermercado One', sans-serif", position: "relative", overflow: "hidden", padding: "16px",
    }}>
      <div style={{ position: "absolute", top: "-100px", left: "-100px", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(233,30,99,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(156,39,176,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: 420, background: "#ffffff",
        borderRadius: 24, padding: "44px 40px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.08), 0 2px 12px rgba(233,30,99,0.06)",
        border: "1px solid rgba(233,30,99,0.08)",
        animation: "fadeInUp 0.5s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: "linear-gradient(135deg, #e91e63, #c2185b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(233,30,99,0.3)",
          }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2.5px solid #fff", position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#111827", letterSpacing: "-0.3px" }}>
              Victie <span style={{ color: "#e91e63" }}>Monitor</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 1 }}>Network Monitoring Platform</div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginBottom: 5, letterSpacing: "-0.3px" }}>
            Buat Akun Baru
          </div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Bergabunglah dan mulai pantau infrastrukturmu</div>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: 18, padding: "11px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ marginBottom: 18, padding: "11px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "0.875rem", fontWeight: 600 }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@domain.com" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#e91e63"; e.target.style.boxShadow = "0 0 0 3px rgba(233,30,99,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#e91e63"; e.target.style.boxShadow = "0 0 0 3px rgba(233,30,99,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px",
            background: loading ? "#f48fb1" : "linear-gradient(135deg, #e91e63, #c2185b)",
            border: "none", borderRadius: 12, color: "#fff",
            fontFamily: "'Supermercado One', sans-serif", fontSize: "0.95rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 18px rgba(233,30,99,0.3)",
          }}
            onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(233,30,99,0.42)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(233,30,99,0.3)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            {loading ? "Memproses..." : "Daftar Sekarang →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Sudah punya akun? </span>
          <Link to="/login" style={{ color: "#e91e63", fontWeight: 700, fontSize: "0.875rem" }}>Masuk di sini</Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: #9ca3af !important; }
      `}</style>
    </div>
  );
}


