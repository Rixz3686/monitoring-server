import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Tooltip } from "@mui/material";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { text: "Monitoring", path: "/", icon: <SpaceDashboardRoundedIcon /> },
  { text: "Riwayat Log", path: "/logs", icon: <HistoryRoundedIcon /> },
  { text: "Tim & Pengaturan", path: "/settings", icon: <SettingsRoundedIcon /> },
];

export default function MainLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const userEmail = user?.email || "Tamu";
  const rawName = userEmail.split("@")[0];
  const displayName = rawName.replace(/^./, (s: string) => s.toUpperCase());
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => { logout(); navigate("/login"); };

  const sw = open ? 240 : 68;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f5f9", fontFamily: "'Supermercado One', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <Box
        component="nav"
        sx={{
          position: "fixed", top: 0, left: 0, height: "100vh",
          width: sw,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 1200,
          display: "flex", flexDirection: "column",
          bgcolor: "#fff",
          borderRight: "1px solid #e8eaf0",
          overflowX: "hidden", overflowY: "auto",
          boxShadow: "2px 0 20px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo row */}
        <Box
          sx={{
            height: 64, display: "flex", alignItems: "center",
            px: open ? 2 : 0, justifyContent: open ? "space-between" : "center",
            borderBottom: "1px solid #f3f4f6", flexShrink: 0,
          }}
        >
          {open && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
              {/* Logomark */}
              <Box sx={{
                width: 34, height: 34, borderRadius: "10px",
                background: "linear-gradient(135deg, #e91e63, #c2185b)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(233,30,99,0.3)", flexShrink: 0,
              }}>
                <Box sx={{
                  width: 13, height: 13, borderRadius: "50%",
                  border: "2.5px solid #fff",
                  position: "relative",
                  "&::after": {
                    content: '""', position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 4, height: 4, borderRadius: "50%", bgcolor: "#fff",
                  },
                }} />
              </Box>
              <Box sx={{ overflow: "hidden" }}>
                <Box sx={{ fontSize: "0.95rem", fontWeight: 900, color: "#111827", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
                  Victie <Box component="span" sx={{ color: "#e91e63" }}>Monitor</Box>
                </Box>
              </Box>
            </Box>
          )}
          <Box
            onClick={() => setOpen(!open)}
            sx={{
              width: 34, height: 34, borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#9ca3af", flexShrink: 0,
              transition: "all 0.18s",
              "&:hover": { bgcolor: "#fce4ec", color: "#e91e63" },
            }}
          >
            {open ? <MenuOpenRoundedIcon sx={{ fontSize: 20 }} /> : <MenuRoundedIcon sx={{ fontSize: 20 }} />}
          </Box>
        </Box>

        {/* Nav items */}
        <Box sx={{ flex: 1, py: 2, px: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path} title={!open ? item.text : ""} placement="right" arrow>
                <Box
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: "flex", alignItems: "center",
                    gap: open ? 1.5 : 0,
                    px: open ? 1.5 : 0, py: 1.1,
                    borderRadius: "11px",
                    cursor: "pointer",
                    justifyContent: open ? "flex-start" : "center",
                    position: "relative",
                    transition: "all 0.18s",
                    color: isActive ? "#e91e63" : "#6b7280",
                    bgcolor: isActive ? "#fce4ec" : "transparent",
                    fontWeight: isActive ? 700 : 500,
                    "&:hover": {
                      bgcolor: isActive ? "#fce4ec" : "#f9fafb",
                      color: isActive ? "#e91e63" : "#111827",
                    },
                    ...(isActive && {
                      "&::before": {
                        content: '""', position: "absolute",
                        left: 0, top: "50%", transform: "translateY(-50%)",
                        width: 3, height: "55%",
                        borderRadius: "0 4px 4px 0",
                        bgcolor: "#e91e63",
                        boxShadow: "0 0 6px rgba(233,30,99,0.5)",
                      },
                    }),
                  }}
                >
                  <Box sx={{ color: "inherit", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& .MuiSvgIcon-root": { fontSize: 20 } }}>
                    {item.icon}
                  </Box>
                  {open && (
                    <Box component="span" sx={{ fontSize: "0.875rem", whiteSpace: "nowrap", opacity: open ? 1 : 0, transition: "opacity 0.2s" }}>
                      {item.text}
                    </Box>
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* Footer: user + logout */}
        <Box sx={{ borderTop: "1px solid #f3f4f6", p: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {open && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, borderRadius: "11px", bgcolor: "#f9fafb", mb: 0.5 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #e91e63, #9c27b0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: 800, color: "#fff", flexShrink: 0,
              }}>
                {initial}
              </Box>
              <Box sx={{ overflow: "hidden" }}>
                <Box sx={{ fontSize: "0.83rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {displayName}
                </Box>
                <Box sx={{ fontSize: "0.7rem", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {userEmail}
                </Box>
              </Box>
            </Box>
          )}

          <Tooltip title={!open ? "Keluar" : ""} placement="right" arrow>
            <Box
              onClick={handleLogout}
              sx={{
                display: "flex", alignItems: "center",
                gap: open ? 1.5 : 0,
                px: open ? 1.5 : 0, py: 1,
                borderRadius: "11px", cursor: "pointer",
                justifyContent: open ? "flex-start" : "center",
                color: "#ef4444", transition: "all 0.18s",
                "&:hover": { bgcolor: "#fee2e2" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <LogoutRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              {open && <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap" }}>Keluar</Box>}
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* ── TOPBAR ── */}
      <Box
        sx={{
          position: "fixed", top: 0,
          left: sw, right: 0, height: 64, zIndex: 1100,
          display: "flex", alignItems: "center",
          px: { xs: 2, sm: 4 }, gap: 2,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #f0f0f6",
          boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
          transition: "left 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box component="span" sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#e91e63", letterSpacing: "1.8px", textTransform: "uppercase" }}>
            {menuItems.find((m) => m.path === location.pathname)?.text || "Dashboard"}
          </Box>
        </Box>

        {/* Live indicator */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          px: 2, py: 0.7, borderRadius: "50px",
          bgcolor: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
        }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: "50%", bgcolor: "#10b981",
            animation: "pulseDot 2s infinite",
          }} />
          <Box component="span" sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>Live</Box>
        </Box>

        {/* Avatar */}
        <Box sx={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #e91e63, #9c27b0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", fontWeight: 800, color: "#fff",
          boxShadow: "0 2px 10px rgba(233,30,99,0.25)",
          cursor: "pointer", transition: "transform 0.18s",
          "&:hover": { transform: "scale(1.06)" },
        }}>
          {initial}
        </Box>
      </Box>

      {/* ── CONTENT ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${sw}px`,
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          bgcolor: "#f4f5f9",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Outlet />
      </Box>

      <style>{`@keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Box>
  );
}


