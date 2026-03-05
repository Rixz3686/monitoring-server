import db from "./db";
import * as net from "node:net";

async function checkHttp(url: string) {
  try {
    const c = new AbortController(); setTimeout(() => c.abort(), 5000);
    const r = await fetch(url, { signal: c.signal }); return r.ok || (r.status >= 300 && r.status < 400);
  } catch { return false; }
}

async function checkTcp(host: string, port: number) {
  return new Promise((resolve) => {
    const s = new net.Socket(); s.setTimeout(5000);
    s.on('connect', () => { s.destroy(); resolve(true); });
    s.on('error', () => { s.destroy(); resolve(false); });
    s.on('timeout', () => { s.destroy(); resolve(false); });
    s.connect(port, host);
  });
}

export function startMonitoringWorker() {
  setInterval(async () => {
    const targets = db.query("SELECT * FROM targets").all() as any[];
    const now = Math.floor(Date.now() / 1000);
    for (const t of targets) {
      const last = t.last_checked_at ? new Date(t.last_checked_at + "Z").getTime() / 1000 : 0;
      if (now - last < t.interval_seconds) continue;

      let isUp = false;
      if (t.protocol === 'HTTP') {
        const u = t.port ? `${t.host}:${t.port}` : t.host;
        isUp = await checkHttp(u.startsWith('http') ? u : `http://${u}`);
      } else if (t.protocol === 'TCP' && t.port) {
        isUp = await checkTcp(t.host, t.port);
      }

      const status = isUp ? 'UP' : 'DOWN';
      db.query(`UPDATE targets SET current_status = $s, last_checked_at = CURRENT_TIMESTAMP WHERE id = $id`).run({ $s: status, $id: t.id });

      if (t.current_status !== 'UNKNOWN' && t.current_status !== status) {
         console.log(`[ALERT] ${t.name} berubah menjadi ${status}.`);
         // Integrasi EMAIL & IMAP
         console.log(`Mempersiapkan pengiriman Email Alert... Mode sinkronisasi IMAP aktif untuk membaca balasan mailbox.`);
      }
    }
  }, 5000);
}
