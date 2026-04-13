import { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import moment from "moment";

const card = {
  bgcolor: "#fff",
  borderRadius: "18px",
  border: "1px solid #f0f0f6",
  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
};

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <Box
      sx={{
        ...card,
        p: 3,
        flex: "1 1 150px",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 32px ${color}20`,
        },
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "13px",
          bgcolor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      <Box
        sx={{ fontSize: "1.8rem", fontWeight: 800, color: "#111827", mb: 0.25 }}
      >
        {value}
      </Box>
      <Box sx={{ fontSize: "0.78rem", color: "#9ca3af", fontWeight: 600 }}>
        {label}
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const { activeTeamId } = useAuth();
  const [targets, setTargets] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    host: "",
    port: "",
    protocol: "HTTP",
    interval_seconds: 60,
  });
  const [chartOpen, setChartOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchTargets = async () => {
    if (!activeTeamId) return;
    try {
      const res = await axios.get(`/api/teams/${activeTeamId}/targets`);
      setTargets(res.data.targets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTargets();
    const iv = setInterval(fetchTargets, 5000);
    return () => clearInterval(iv);
  }, [activeTeamId]);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({
      name: "",
      host: "",
      port: "",
      protocol: "HTTP",
      interval_seconds: 60,
    });
    setOpen(true);
  };
  const handleOpenEdit = (row: any) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      host: row.host,
      port: row.port?.toString() || "",
      protocol: row.protocol,
      interval_seconds: row.interval_seconds,
    });
    setOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus target ini?")) return;
    try {
      await axios.delete(`/api/teams/${activeTeamId}/targets/${id}`);
      fetchTargets();
    } catch {
      alert("Gagal menghapus target");
    }
  };
  const handleSave = async () => {
    try {
      const payload = { ...form, port: form.port ? parseInt(form.port) : null };
      if (editingId)
        await axios.put(
          `/api/teams/${activeTeamId}/targets/${editingId}`,
          payload,
        );
      else await axios.post(`/api/teams/${activeTeamId}/targets`, payload);
      setOpen(false);
      fetchTargets();
    } catch {
      alert("Gagal menyimpan target!");
    }
  };
  const handleOpenChart = async (row: any) => {
    setSelectedTarget(row);
    try {
      const res = await axios.get(
        `/api/teams/${activeTeamId}/targets/${row.id}/history`,
      );
      setChartData(
        res.data.history.map((h: any) => ({
          time: moment.utc(h.checked_at).local().format("HH:mm:ss"),
          latency: h.latency_ms,
        })),
      );
      setChartOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const upCount = targets.filter((t) => t.current_status === "UP").length;
  const downCount = targets.filter((t) => t.current_status === "DOWN").length;
  const avgLat =
    targets.filter((t) => t.latency_ms).length > 0
      ? Math.round(
          targets
            .filter((t) => t.latency_ms)
            .reduce((a, t) => a + t.latency_ms, 0) /
            targets.filter((t) => t.latency_ms).length,
        )
      : 0;

  const inputSx: React.CSSProperties = {
    width: "100%",
    padding: "10px 13px",
    background: "#f9fafb",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    color: "#111827",
    fontSize: "0.9rem",
    fontFamily: "'Supermercado One', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "TARGET",
      flex: 1,
      minWidth: 150,
      renderCell: (p) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              flexShrink: 0,
              bgcolor: p.row.current_status === "UP" ? "#10b981" : "#ef4444",
              boxShadow:
                p.row.current_status === "UP"
                  ? "0 0 6px rgba(16,185,129,0.6)"
                  : "0 0 6px rgba(239,68,68,0.6)",
            }}
          />
          <Box sx={{ fontWeight: 600, color: "#111827" }}>{p.value}</Box>
        </Box>
      ),
    },
    {
      field: "host",
      headerName: "HOST / URL",
      flex: 1.5,
      minWidth: 200,
      renderCell: (p) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            color: "#6b7280",
            fontFamily: "monospace",
            fontSize: "0.85rem",
          }}
        >
          {p.value}
        </Box>
      ),
    },
    {
      field: "protocol",
      headerName: "PROTOKOL",
      width: 120,
      renderCell: (p) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
              bgcolor: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
              letterSpacing: "0.5px",
            }}
          >
            {p.value}
          </Box>
        </Box>
      ),
    },
    { field: "interval_seconds", headerName: "INTERVAL (s)", width: 120 },
    {
      field: "current_status",
      headerName: "STATUS",
      width: 185,
      renderCell: (p) => {
        const isUp = p.value === "UP";
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip
              label={isUp ? `● UP · ${p.row.latency_ms || 0}ms` : "● DOWN"}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.78rem",
                borderRadius: "8px",
                bgcolor: isUp ? "#ecfdf5" : "#fef2f2",
                color: isUp ? "#059669" : "#dc2626",
                border: `1px solid ${isUp ? "#a7f3d0" : "#fecaca"}`,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "AKSI",
      width: 130,
      sortable: false,
      renderCell: (p) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            height: "100%",
          }}
        >
          <IconButton
            size="small"
            sx={{
              color: "#d1d5db",
              borderRadius: "8px",
              "&:hover": { color: "#0ea5e9", bgcolor: "#e0f2fe" },
            }}
            onClick={() => handleOpenChart(p.row)}
          >
            <InsightsRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: "#d1d5db",
              borderRadius: "8px",
              "&:hover": { color: "#e91e63", bgcolor: "#fce4ec" },
            }}
            onClick={() => handleOpenEdit(p.row)}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: "#d1d5db",
              borderRadius: "8px",
              "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" },
            }}
            onClick={() => handleDelete(p.row.id)}
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (!activeTeamId)
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          gap: 2,
        }}
      >
        <Box sx={{ fontSize: "3rem" }}>🏗️</Box>
        <Box sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#374151" }}>
          Belum ada tim dipilih
        </Box>
        <Box sx={{ fontSize: "0.875rem" }}>
          Silakan buat atau pilih tim dari menu{" "}
          <Box component="span" sx={{ color: "#e91e63", fontWeight: 600 }}>
            Tim & Pengaturan
          </Box>
        </Box>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", animation: "fadeInUp 0.45s ease" }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} input::placeholder{color:#9ca3af!important}`}</style>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mb: 4,
        }}
      >
        <Box>
          <Box
            component="h1"
            sx={{
              fontSize: { xs: "1.75rem", sm: "2rem" },
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "-0.5px",
              mb: 0.4,
            }}
          >
            Dashboard
            <Box component="span" sx={{ color: "#e91e63" }}>
              .
            </Box>
          </Box>
          <Box sx={{ fontSize: "0.875rem", color: "#9ca3af" }}>
            Pantau status server dan layananmu secara real-time
          </Box>
        </Box>
        <button
          onClick={handleOpenNew}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 22px",
            background: "linear-gradient(135deg, #e91e63, #c2185b)",
            border: "none",
            borderRadius: 50,
            color: "#fff",
            fontFamily: "'Supermercado One', sans-serif",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 18px rgba(233,30,99,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 8px 26px rgba(233,30,99,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 18px rgba(233,30,99,0.3)";
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} /> Target Baru
        </button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        <StatCard
          label="Total Target"
          value={targets.length}
          icon="🎯"
          color="#e91e63"
        />
        <StatCard label="Online" value={upCount} icon="✅" color="#10b981" />
        <StatCard label="Offline" value={downCount} icon="🔴" color="#ef4444" />
        <StatCard
          label="Avg Latency"
          value={`${avgLat}ms`}
          icon="⚡"
          color="#f59e0b"
        />
      </Box>

      <Box
        sx={{
          ...card,
          height: 520,
          overflow: "hidden",
          transition: "box-shadow 0.25s",
          "&:hover": { boxShadow: "0 4px 32px rgba(233,30,99,0.08)" },
        }}
      >
        <DataGrid
          rows={targets}
          columns={columns}
          disableRowSelectionOnClick
          rowHeight={68}
          sx={{
            border: "none",
            fontFamily: "'Supermercado One', sans-serif",
            color: "#374151",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#fafafa",
              borderBottom: "2px solid #fce4ec",
              color: "#9ca3af",
              fontSize: "0.7rem",
              letterSpacing: "1.4px",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f9f9fb",
              color: "#374151",
            },
            "& .MuiDataGrid-row:hover": { bgcolor: "#fff8fb" },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #f3f4f6",
              color: "#9ca3af",
            },
            "& .MuiDataGrid-iconSeparator": { display: "none" },
            "& .MuiTablePagination-root": { color: "#9ca3af" },
          }}
        />
      </Box>

      <Dialog
        open={chartOpen}
        onClose={() => setChartOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            bgcolor: "#fff",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "#111827",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          Riwayat Latensi:{" "}
          <Box component="span" sx={{ color: "#e91e63" }}>
            {selectedTarget?.name}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e91e63" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#e91e63" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="time"
                  stroke="#d1d5db"
                  fontSize={11}
                  tickMargin={10}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#d1d5db"
                  fontSize={11}
                  unit="ms"
                  tick={{ fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #fce4ec",
                    borderRadius: "12px",
                    color: "#111827",
                    fontSize: "0.875rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: "#e91e63", fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  name="Latensi (ms)"
                  stroke="#e91e63"
                  strokeWidth={2.5}
                  fill="url(#pinkGrad)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#e91e63",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, borderTop: "1px solid #f3f4f6" }}>
          <button
            onClick={() => setChartOpen(false)}
            style={{
              padding: "8px 20px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              color: "#6b7280",
              fontFamily: "'Supermercado One', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tutup
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            bgcolor: "#fff",
            minWidth: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: "1.15rem",
            color: "#111827",
            pt: 4,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          {editingId ? "✏️ Edit Target" : "🎯 Target Baru"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}
        >
          {[
            { label: "Nama Target", field: "name", type: "text" },
            { label: "Host / IP / URL", field: "host", type: "text" },
          ].map(({ label, field, type }) => (
            <Box key={field}>
              <Box
                component="label"
                sx={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#9ca3af",
                  mb: 1,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </Box>
              <input
                type={type}
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                style={inputSx}
                onFocus={(e) => (e.target.style.borderColor = "#e91e63")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </Box>
          ))}
          <Box>
            <Box
              component="label"
              sx={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#9ca3af",
                mb: 1,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
              }}
            >
              Protokol
            </Box>
            <select
              value={form.protocol}
              onChange={(e) => setForm({ ...form, protocol: e.target.value })}
              style={{ ...inputSx, background: "#f9fafb", cursor: "pointer" }}
            >
              <option value="HTTP">HTTP / HTTPS</option>
              <option value="TCP">TCP</option>
              <option value="ICMP">ICMP (Ping)</option>
            </select>
          </Box>
          {form.protocol === "TCP" && (
            <Box>
              <Box
                component="label"
                sx={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#9ca3af",
                  mb: 1,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                }}
              >
                Port
              </Box>
              <input
                type="number"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: e.target.value })}
                style={inputSx}
                onFocus={(e) => (e.target.style.borderColor = "#e91e63")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </Box>
          )}
          <Box>
            <Box
              component="label"
              sx={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#9ca3af",
                mb: 1,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
              }}
            >
              Interval (Detik)
            </Box>
            <input
              type="number"
              value={form.interval_seconds}
              onChange={(e) =>
                setForm({
                  ...form,
                  interval_seconds: parseInt(e.target.value) || 60,
                })
              }
              style={inputSx}
              onFocus={(e) => (e.target.style.borderColor = "#e91e63")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 3, gap: 1, borderTop: "1px solid #f3f4f6" }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              padding: "9px 20px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              color: "#6b7280",
              fontFamily: "'Supermercado One', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "9px 24px",
              background: "linear-gradient(135deg, #e91e63, #c2185b)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontFamily: "'Supermercado One', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(233,30,99,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 22px rgba(233,30,99,0.38)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px rgba(233,30,99,0.25)")
            }
          >
            {editingId ? "Simpan Perubahan" : "Tambahkan →"}
          </button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
