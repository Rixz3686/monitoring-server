import React, { useState, useEffect } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const card = {
  bgcolor: "#fff",
  borderRadius: "18px",
  border: "1px solid #f0f0f6",
  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
};

export default function Settings() {
  const { activeTeamId, setActiveTeam } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchMyTeams = async () => {
    try {
      const res = await axios.get("/api/teams");
      setTeamsList(res.data.teams);
      if (!activeTeamId && res.data.teams.length > 0) setActiveTeam(res.data.teams[0].id);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchMyTeams(); }, [activeTeamId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/teams", { name: teamName });
      setActiveTeam(response.data.teamId);
      setSuccessMsg(`Tim "${teamName}" berhasil dibuat!`);
      setTeamName("");
      fetchMyTeams();
      setTimeout(() => { setSuccessMsg(""); setCreateOpen(false); }, 1500);
    } catch { alert("Gagal membuat tim."); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", animation: "fadeInUp 0.45s ease" }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} input::placeholder{color:#9ca3af!important}`}</style>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
        <Box>
          <Box component="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, fontWeight: 900, color: "#111827", letterSpacing: "-0.5px", mb: 0.4 }}>
            Pengaturan<Box component="span" sx={{ color: "#e91e63" }}>.</Box>
          </Box>
          <Box sx={{ fontSize: "0.875rem", color: "#9ca3af" }}>Kelola ruang kerja dan tim monitoringmu di sini</Box>
        </Box>
        <button
          onClick={() => setCreateOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 22px",
            background: "linear-gradient(135deg, #e91e63, #c2185b)",
            border: "none", borderRadius: 50, color: "#fff",
            fontFamily: "'Supermercado One', sans-serif", fontSize: "0.875rem", fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 18px rgba(233,30,99,0.28)", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 26px rgba(233,30,99,0.4)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(233,30,99,0.28)"; }}
        >
          <AddIcon sx={{ fontSize: 18 }} /> Buat Tim
        </button>
      </Box>

      {/* Teams card */}
      <Box sx={{ ...card, p: 4, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center", color: "#e91e63" }}>
            <GroupsRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#111827" }}>Tim Saya</Box>
        </Box>
        <Box sx={{ fontSize: "0.85rem", color: "#9ca3af", mb: 4, ml: "50px" }}>
          Pilih tim yang aktif. Dashboard akan menampilkan target sesuai tim yang dipilih.
        </Box>

        {teamsList.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {teamsList.map((team) => {
              const isActive = team.id === activeTeamId;
              return (
                <Box
                  key={team.id}
                  onClick={() => setActiveTeam(team.id)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    px: 2.5, py: 1.75, borderRadius: "14px", cursor: "pointer",
                    transition: "all 0.2s",
                    border: isActive ? "1.5px solid #f48fb1" : "1.5px solid #f0f0f6",
                    bgcolor: isActive ? "#fff0f5" : "#fafafa",
                    boxShadow: isActive ? "0 4px 18px rgba(233,30,99,0.1)" : "none",
                    "&:hover": {
                      border: "1.5px solid #f48fb1",
                      bgcolor: isActive ? "#fff0f5" : "#fff5f8",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {isActive && <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#e91e63", flexShrink: 0 }} />}
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: isActive ? "linear-gradient(135deg, #e91e63, #9c27b0)" : "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 800,
                    color: isActive ? "#fff" : "#9ca3af", flexShrink: 0,
                  }}>
                    {team.name.charAt(0).toUpperCase()}
                  </Box>
                  <Box>
                    <Box sx={{ fontWeight: isActive ? 800 : 600, fontSize: "0.9rem", color: isActive ? "#111827" : "#6b7280" }}>
                      {team.name}
                    </Box>
                    <Box sx={{ fontSize: "0.7rem", color: isActive ? "#e91e63" : "#d1d5db" }}>
                      {isActive ? "● Aktif" : "Klik untuk pilih"}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ p: 4, borderRadius: "14px", bgcolor: "#fff5f8", border: "1.5px dashed #f48fb1", textAlign: "center", color: "#9ca3af" }}>
            <Box sx={{ fontSize: "2rem", mb: 1 }}>🏗️</Box>
            <Box sx={{ fontWeight: 700, color: "#374151", mb: 0.5 }}>Belum ada tim</Box>
            <Box sx={{ fontSize: "0.875rem" }}>
              Buat tim pertamamu dengan mengklik tombol <Box component="span" sx={{ color: "#e91e63", fontWeight: 700 }}>Buat Tim</Box> di atas.
            </Box>
          </Box>
        )}
      </Box>

      {/* Info cards */}
      <Box sx={{ ...card, p: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
        {[
          { icon: "📡", title: "Real-time Monitoring", desc: "Pemantauan berjalan di backend, melacak status target setiap interval yang ditentukan." },
          { icon: "🔔", title: "Log Insiden", desc: "Setiap perubahan status UP/DOWN dicatat otomatis untuk audit dan analisis." },
          { icon: "📊", title: "Grafik Latensi", desc: "Pantau tren latensi server dari waktu ke waktu dengan grafik area interaktif." },
        ].map(({ icon, title, desc }) => (
          <Box key={title} sx={{ flex: "1 1 220px" }}>
            <Box sx={{ fontSize: "1.4rem", mb: 1 }}>{icon}</Box>
            <Box sx={{ fontWeight: 700, color: "#111827", mb: 0.5, fontSize: "0.95rem" }}>{title}</Box>
            <Box sx={{ fontSize: "0.8rem", color: "#9ca3af", lineHeight: 1.7 }}>{desc}</Box>
          </Box>
        ))}
      </Box>

      {/* Create Team Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px", bgcolor: "#fff", minWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.1)" } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#111827", pt: 4, borderBottom: "1px solid #f3f4f6" }}>
          🏗️ Buat Tim Baru
        </DialogTitle>
        <DialogContent>
          <Box sx={{ fontSize: "0.875rem", color: "#9ca3af", mb: 3, pt: 2 }}>
            Pisahkan target monitoringmu ke dalam ruang kerja yang berbeda.
          </Box>
          {successMsg && (
            <Box sx={{ mb: 3, p: "11px 14px", borderRadius: "10px", bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "0.875rem", fontWeight: 600 }}>
              ✅ {successMsg}
            </Box>
          )}
          <form id="create-team-form" onSubmit={handleCreateTeam}>
            <Box component="label" sx={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", mb: 1, letterSpacing: "0.6px", textTransform: "uppercase" }}>
              Nama Tim
            </Box>
            <input
              type="text" required value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Contoh: Backend Production"
              style={{ width: "100%", padding: "11px 14px", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10, color: "#111827", fontSize: "0.95rem", fontFamily: "'Supermercado One', sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={(e) => { e.target.style.borderColor = "#e91e63"; e.target.style.boxShadow = "0 0 0 3px rgba(233,30,99,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1, borderTop: "1px solid #f3f4f6" }}>
          <button onClick={() => setCreateOpen(false)} style={{ padding: "9px 20px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, color: "#6b7280", fontFamily: "'Supermercado One', sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>Batal</button>
          <button type="submit" form="create-team-form" disabled={loading} style={{ padding: "9px 24px", background: loading ? "#f48fb1" : "linear-gradient(135deg, #e91e63, #c2185b)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Supermercado One', sans-serif", fontSize: "0.875rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(233,30,99,0.25)" }}>
            {loading ? "Membuat..." : "Buat Tim →"}
          </button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


