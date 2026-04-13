import db from "./db";
import { spawn } from "bun";
import nodemailer from "nodemailer";

if ((globalThis as any).monitorInterval) {
  clearInterval((globalThis as any).monitorInterval);
}

// 🛡️ MEMORI SISTEM: Untuk mencegah tumpang tindih pengecekan
const lastCheckTimes = new Map<string, number>();
const isChecking = new Set<string>();

async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {}
}

async function sendDiscordAlert(target: any, status: "UP" | "DOWN", latency: number) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  const isDown = status === "DOWN";
  const embed = {
    title: isDown ? "🚨 SERVER DOWN 🚨" : "✅ SERVER RECOVERED ✅",
    color: isDown ? 15548997 : 5763719,
    fields: [
      { name: "🎯 Target", value: target.name, inline: true },
      { name: "🌐 Host", value: `\`${target.host}\``, inline: true },
      { name: "🔌 Protokol", value: target.protocol, inline: true },
      ...(isDown ? [] : [{ name: "⚡ Latensi", value: `${latency} ms`, inline: true }]),
      { name: "🕒 Waktu", value: new Date().toLocaleString("id-ID") },
    ],
  };
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (e) {}
}

async function sendEmailAlert(target: any, status: "UP" | "DOWN", latency: number) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const teamUsers = db.query(`
    SELECT u.email 
    FROM users u 
    JOIN team_members tm ON u.id = tm.user_id 
    WHERE tm.team_id = $teamId
  `).all({ $teamId: target.team_id }) as { email: string }[];

  if (teamUsers.length === 0) return;

  const targetEmails = teamUsers.map((u) => u.email).join(", ");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const isDown = status === "DOWN";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fce4ec; border-radius: 10px; max-width: 600px; background-color: #f9fafb;">
      <h2 style="color: ${isDown ? "#e91e63" : "#059669"}; margin-bottom: 20px;">
        ${isDown ? "🚨 SERVER DOWN 🚨" : "✅ SERVER RECOVERED ✅"}
      </h2>
      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #f3f4f6;">
        <p style="margin: 5px 0;"><strong>🎯 Target:</strong> ${target.name}</p>
        <p style="margin: 5px 0;"><strong>🌐 Host:</strong> <a href="${target.host}" style="color: #0ea5e9;">${target.host}</a></p>
        <p style="margin: 5px 0;"><strong>🔌 Protokol:</strong> ${target.protocol}</p>
        ${!isDown ? `<p style="margin: 5px 0;"><strong>⚡ Latensi:</strong> ${latency} ms</p>` : ""}
        <p style="margin: 5px 0;"><strong>🕒 Waktu:</strong> ${new Date().toLocaleString("id-ID")}</p>
      </div>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; text-align: center;">Victie Monitoring System</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Victie Alerts" <${SMTP_USER}>`,
      to: targetEmails,
      subject: isDown ? `🚨 ALERT: ${target.name} is DOWN` : `✅ RECOVERED: ${target.name} is UP`,
      html: htmlContent,
    });
    console.log(`📧 Email terkirim ke tim: ${targetEmails}`);
  } catch (e) {}
}

export function startMonitoringWorker() {
  console.log("⚙️  Background Worker berjalan");

  // Detak jantung (tick) diubah menjadi setiap 1 detik
  (globalThis as any).monitorInterval = setInterval(() => {
    const targets = db.query("SELECT * FROM targets").all() as any[];
    const now = Date.now();

    targets.forEach(async (target) => {
      // 1. Ambil interval dari database (default 60 detik jika kosong)
      const intervalMs = (target.interval_seconds || 60) * 1000;
      const lastCheck = lastCheckTimes.get(target.id) || 0;

      // 2. CEGAH OVERLAP: Lewati jika belum waktunya atau sedang diproses
      if (now - lastCheck < intervalMs || isChecking.has(target.id)) {
        return;
      }

      // Kunci target ini agar tidak di-ping ganda
      isChecking.add(target.id);
      lastCheckTimes.set(target.id, now);

      try {
        let status = "DOWN";
        let latency = 0;

        try {
          const start = performance.now();
          if (target.protocol === "HTTP" || target.protocol === "HTTPS") {
            const url = target.host.startsWith("http") ? target.host : `http://${target.host}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
            if (res) {
              status = "UP";
              latency = Math.round(performance.now() - start);
            }
          } else if (target.protocol === "TCP") {
            // 3. TAMBAHKAN TIMEOUT UNTUK TCP AGAR TIDAK HANG
            const tcpPromise = Bun.connect({
              hostname: target.host,
              port: target.port,
              socket: {
                data() {},
                open(s) { s.end(); },
                error() {},
              },
            });
            
            await Promise.race([
              tcpPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
            ]);
            
            status = "UP";
            latency = Math.round(performance.now() - start);
          } else if (target.protocol === "ICMP") {
            const proc = spawn(["ping", "-c", "1", "-W", "2", target.host]);
            const output = await new Response(proc.stdout).text();
            await proc.exited;
            if (proc.exitCode === 0) {
              status = "UP";
              const match = output.match(/time=([\d.]+)\s*ms/);
              if (match) latency = Math.round(parseFloat(match[1]!));
            }
          }
        } catch (error) {
          status = "DOWN";
          latency = 0;
        }

        const oldStatus = target.current_status;

        if (status === "DOWN" && oldStatus !== "DOWN") {
          sendTelegramAlert(`🚨 *SERVER DOWN* 🚨\n\n*Target:* ${target.name}\n*Host:* \`${target.host}\`\n*Waktu:* ${new Date().toLocaleString("id-ID")}`);
          sendDiscordAlert(target, "DOWN", 0);
          sendEmailAlert(target, "DOWN", 0);

          db.query("INSERT INTO incident_logs (id, target_id, status) VALUES ($id, $t, 'DOWN')").run({ $id: crypto.randomUUID(), $t: target.id });
        } else if (status === "UP" && oldStatus === "DOWN") {
          sendTelegramAlert(`✅ *SERVER RECOVERED* ✅\n\n*Target:* ${target.name}\n*Host:* \`${target.host}\`\n*Latensi:* ${latency} ms\n*Waktu:* ${new Date().toLocaleString("id-ID")}`);
          sendDiscordAlert(target, "UP", latency);
          sendEmailAlert(target, "UP", latency);

          db.query("INSERT INTO incident_logs (id, target_id, status) VALUES ($id, $t, 'UP')").run({ $id: crypto.randomUUID(), $t: target.id });
        }

        db.query("UPDATE targets SET current_status = $status, latency_ms = $latency WHERE id = $id").run({ $status: status, $latency: latency, $id: target.id });
        
        const historyId = crypto.randomUUID();
        db.query("INSERT INTO ping_history (id, target_id, status, latency_ms) VALUES ($id, $t, $s, $l)").run({ $id: historyId, $t: target.id, $s: status, $l: latency });
        
        db.query(`DELETE FROM ping_history WHERE id NOT IN (SELECT id FROM ping_history WHERE target_id = $t ORDER BY checked_at DESC LIMIT 30) AND target_id = $t`).run({ $t: target.id });

      } finally {
        // SELALU buka kunci saat selesai, entah berhasil atau error
        isChecking.delete(target.id);
      }
    });
  }, 1000); // Ticking 1 detik
}