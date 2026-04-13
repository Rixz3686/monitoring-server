import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import db from "./db";
import { startMonitoringWorker } from "./worker";

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "RAHASIA_SUPER_AMAN",
    }),
  )
  .get("/api/health", () => ({ status: "OK" }))

  .post("/api/auth/register", async ({ body, set }: any) => {
    try {
      const hash = await Bun.password.hash(body.password);
      const userId = crypto.randomUUID();
      db.query(
        "INSERT INTO users (id, email, password_hash) VALUES ($id, $email, $hash)",
      ).run({ $id: userId, $email: body.email, $hash: hash });
      set.status = 201;
      return { message: "Registrasi berhasil", userId };
    } catch (e) {
      set.status = 400;
      return { error: "Email sudah terdaftar." };
    }
  })

  .post(
    "/api/auth/login",
    async ({ body, jwt, cookie: { auth_token }, set }: any) => {
      const user = db
        .query("SELECT * FROM users WHERE email = $email")
        .get({ $email: body.email }) as any;
      if (
        !user ||
        !(await Bun.password.verify(body.password, user.password_hash))
      ) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }
      auth_token.set({
        value: await jwt.sign({ id: user.id, email: user.email }),
        httpOnly: true,
        path: "/",
        maxAge: 604800,
      });
      return { message: "Login berhasil", userId: user.id };
    },
  )

  .post(
    "/api/teams",
    async ({ body, jwt, cookie: { auth_token }, set }: any) => {
      const payload = await jwt.verify(auth_token.value);
      if (!payload) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const teamId = crypto.randomUUID();
      db.run("BEGIN TRANSACTION;");
      try {
        db.query("INSERT INTO teams (id, name) VALUES ($id, $name)").run({
          $id: teamId,
          $name: body.name,
        });
        db.query(
          "INSERT INTO team_members (team_id, user_id, role) VALUES ($t, $u, 'ADMIN')",
        ).run({ $t: teamId, $u: payload.id });
        db.run("COMMIT;");
        set.status = 201;
        return { teamId };
      } catch {
        db.run("ROLLBACK;");
        set.status = 500;
        return { error: "Gagal" };
      }
    },
  )

  .get("/api/teams/:teamId/targets", ({ params }: any) => {
    return {
      targets: db
        .query("SELECT * FROM targets WHERE team_id = $t")
        .all({ $t: params.teamId }),
    };
  })

  .post("/api/teams/:teamId/targets", ({ params, body, set }: any) => {
    try {
      const id = crypto.randomUUID();
      db.query(
        "INSERT INTO targets (id, team_id, name, host, port, protocol, interval_seconds) VALUES ($id, $t, $n, $h, $p, $pr, $i)",
      ).run({
        $id: id,
        $t: params.teamId,
        $n: body.name,
        $h: body.host,
        $p: body.port || null,
        $pr: body.protocol,
        $i: body.interval_seconds,
      });
      set.status = 201;
      return { message: "Created", id };
    } catch (error: any) {
      console.error("❌ GAGAL SIMPAN TARGET:", error.message);
      set.status = 500;
      return { error: "Gagal menyimpan ke database" };
    }
  })

  .put("/api/teams/:teamId/targets/:targetId", ({ params, body }: any) => {
    db.query(
      `
      UPDATE targets SET 
        name = COALESCE($n, name), host = COALESCE($h, host), port = COALESCE($p, port), protocol = COALESCE($pr, protocol), interval_seconds = COALESCE($i, interval_seconds) 
      WHERE id = $id AND team_id = $t
    `,
    ).run({
      $id: params.targetId,
      $t: params.teamId,
      $n: body.name ?? null,
      $h: body.host ?? null,
      $p: body.port ?? null,
      $pr: body.protocol ?? null,
      $i: body.interval_seconds ?? null,
    });
    return { message: "Updated" };
  })

  .delete("/api/teams/:teamId/targets/:targetId", ({ params }: any) => {
    db.query("DELETE FROM targets WHERE id = $id AND team_id = $t").run({
      $id: params.targetId,
      $t: params.teamId,
    });
    return { message: "Deleted" };
  })

  .get("/api/teams", async ({ jwt, cookie: { auth_token }, set }: any) => {
    const payload = await jwt.verify(auth_token.value);
    if (!payload) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const teams = db
      .query(
        `
      SELECT t.id, t.name, tm.role 
      FROM teams t 
      JOIN team_members tm ON t.id = tm.team_id 
      WHERE tm.user_id = $userId
    `,
      )
      .all({ $userId: payload.id });

    return { teams };
  })

  .get("/api/teams/:teamId/targets/:targetId/history", ({ params }: any) => {
    const history = db
      .query(
        "SELECT * FROM ping_history WHERE target_id = $t ORDER BY checked_at ASC",
      )
      .all({ $t: params.targetId });
    return { history };
  })

  .get("/api/teams/:teamId/logs", ({ params }: any) => {
    const logs = db
      .query(
        `
      SELECT l.id, t.name as target_name, l.status, l.created_at 
      FROM incident_logs l 
      JOIN targets t ON l.target_id = t.id 
      WHERE t.team_id = $teamId 
      ORDER BY l.created_at DESC 
      LIMIT 100
    `,
      )
      .all({ $teamId: params.teamId });
    return { logs };
  })

  .delete("/api/teams/:teamId/logs", ({ params }: any) => {
    db.query(
      `
      DELETE FROM incident_logs 
      WHERE target_id IN (SELECT id FROM targets WHERE team_id = $teamId)
    `,
    ).run({ $teamId: params.teamId });
    return { message: "Seluruh log berhasil dibersihkan" };
  })

  .listen(3002);

startMonitoringWorker();
console.log(`🦊 Backend API berjalan di http://localhost:3002`);
