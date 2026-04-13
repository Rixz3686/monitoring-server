import { useEffect, useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import moment from "moment";

const card = {
  bgcolor: "#fff",
  borderRadius: "18px",
  border: "1px solid #f0f0f6",
  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
};

export default function Logs() {
  const { activeTeamId } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchLogs = async () => {
    if (!activeTeamId) return;
    try {
      const res = await axios.get(`/api/teams/${activeTeamId}/logs`);
      setLogs(res.data.logs);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchLogs();
    const iv = setInterval(fetchLogs, 10000);
    return () => clearInterval(iv);
  }, [activeTeamId]);

  const handleClearLogs = async () => {
    try {
      await axios.delete(`/api/teams/${activeTeamId}/logs`);
      setLogs([]);
      setConfirmOpen(false);
    } catch { alert("Gagal membersihkan riwayat log."); }
  };

  const columns: GridColDef[] = [
    {
      field: "created_at", headerName: "WAKTU", width: 230,
      renderCell: (p) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%", fontFamily: "monospace", color: "#6b7280", fontSize: "0.85rem", fontWeight: 600 }}>
          {moment.utc(p.value).local().format("DD MMM YYYY · HH:mm:ss")}
        </Box>
      ),
    },
    {
      field: "target_name", headerName: "TARGET", flex: 1, minWidth: 200,
      renderCell: (p) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%", fontWeight: 600, color: "#111827" }}>{p.value}</Box>
      ),
    },
    {
      field: "status", headerName: "PERUBAHAN STATUS", width: 240, align: "center", headerAlign: "center",
      renderCell: (p) => {
        const isUp = p.value === "UP";
        return (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
            <Chip
              label={isUp ? "✅ RECOVERED · UP" : "🚨 INCIDENT · DOWN"}
              size="small"
              sx={{
                fontWeight: 800, fontSize: "0.78rem", borderRadius: "8px", px: 0.5,
                bgcolor: isUp ? "#ecfdf5" : "#fef2f2",
                color: isUp ? "#059669" : "#dc2626",
                border: `1px solid ${isUp ? "#a7f3d0" : "#fecaca"}`,
              }}
            />
          </Box>
        );
      },
    },
  ];

  if (!activeTeamId)
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", gap: 2 }}>
        <Box sx={{ fontSize: "3rem" }}>📋</Box>
        <Box sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#374151" }}>Belum ada tim dipilih</Box>
        <Box sx={{ fontSize: "0.875rem" }}>Pilih tim dari menu <Box component="span" sx={{ color: "#e91e63", fontWeight: 600 }}>Tim & Pengaturan</Box></Box>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", animation: "fadeInUp 0.45s ease" }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
        <Box>
          <Box component="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, fontWeight: 900, color: "#111827", letterSpacing: "-0.5px", mb: 0.4 }}>
            Riwayat Log<Box component="span" sx={{ color: "#e91e63" }}>.</Box>
          </Box>
          <Box sx={{ fontSize: "0.875rem", color: "#9ca3af" }}>Jejak rekam historis perubahan status peladenmu</Box>
        </Box>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={logs.length === 0}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 22px",
            background: logs.length === 0 ? "#f9fafb" : "#fef2f2",
            border: `1px solid ${logs.length === 0 ? "#e5e7eb" : "#fecaca"}`,
            borderRadius: 50, color: logs.length === 0 ? "#d1d5db" : "#ef4444",
            fontFamily: "'Supermercado One', sans-serif", fontSize: "0.875rem", fontWeight: 700,
            cursor: logs.length === 0 ? "not-allowed" : "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { if (logs.length > 0) (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2"; }}
          onMouseLeave={(e) => { if (logs.length > 0) (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
        >
          <DeleteSweepRoundedIcon sx={{ fontSize: 18 }} /> Bersihkan Log
        </button>
      </Box>

      {/* Stat row */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {[
          { label: "Total Event", value: logs.length, icon: "📊", color: "#e91e63" },
          { label: "Incident", value: logs.filter(l => l.status === "DOWN").length, icon: "🚨", color: "#ef4444" },
          { label: "Recovery", value: logs.filter(l => l.status === "UP").length, icon: "✅", color: "#10b981" },
        ].map(({ label, value, icon, color }) => (
          <Box key={label} sx={{
            ...card, p: "18px 24px", flex: "1 1 140px",
            display: "flex", alignItems: "center", gap: 2,
            transition: "transform 0.2s", "&:hover": { transform: "translateY(-2px)" },
          }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{icon}</Box>
            <Box>
              <Box sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</Box>
              <Box sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, mt: 0.5 }}>{label}</Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Table */}
      <Box sx={{ ...card, height: 560, overflow: "hidden", transition: "box-shadow 0.25s", "&:hover": { boxShadow: "0 4px 32px rgba(233,30,99,0.07)" } }}>
        <DataGrid
          rows={logs} columns={columns}
          disableRowSelectionOnClick rowHeight={72}
          sx={{
            border: "none", fontFamily: "'Supermercado One', sans-serif", color: "#374151",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#fafafa", borderBottom: "2px solid #fce4ec", color: "#9ca3af", fontSize: "0.7rem", letterSpacing: "1.4px" },
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #f9f9fb" },
            "& .MuiDataGrid-row:hover": { bgcolor: "#fff8fb" },
            "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #f3f4f6", color: "#9ca3af" },
            "& .MuiDataGrid-iconSeparator": { display: "none" },
            "& .MuiTablePagination-root": { color: "#9ca3af" },
          }}
        />
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: "18px", bgcolor: "#fff", minWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.1)" } }}>
        <DialogTitle sx={{ fontWeight: 800, pt: 4, fontSize: "1.1rem", color: "#111827" }}>🚨 Konfirmasi Hapus Log</DialogTitle>
        <DialogContent>
          <Box sx={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.7 }}>
            Semua riwayat log untuk tim ini akan <Box component="span" sx={{ color: "#ef4444", fontWeight: 700 }}>dihapus permanen</Box>. Tindakan ini tidak dapat dibatalkan.
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1, borderTop: "1px solid #f3f4f6" }}>
          <button onClick={() => setConfirmOpen(false)} style={{ padding: "9px 20px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, color: "#6b7280", fontFamily: "'Supermercado One', sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>Batal</button>
          <button onClick={handleClearLogs} style={{ padding: "9px 24px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Supermercado One', sans-serif", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(239,68,68,0.25)" }}>Hapus Semua</button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


