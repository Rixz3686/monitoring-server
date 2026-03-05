import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { staticPlugin } from "@elysiajs/static";
import db from "./db";
import { startMonitoringWorker } from "./worker";

const app = new Elysia()
  .use(staticPlugin({ assets: "public", prefix: "/" }))
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "RAHASIA_SUPER_AMAN" }))
  .use(cookie())
  
  // --- TEST ROUTE (Untuk memastikan backend hidup) ---
  .get("/api/health", () => ({ status: "OK" }))

  // --- GRUP AUTH (WAJIB DI LUAR MIDDLEWARE) ---
  .group("/api/auth", (auth) =>
    auth
      .post("/register", async ({ body, set }) => {
        try {
          const hash = await Bun.password.hash(body.password);
          const userId = crypto.randomUUID();
          db.query("INSERT INTO users (id, email, password_hash) VALUES ($id, $email, $hash)")
            .run({ $id: userId, $email: body.email, $hash: hash });
          set.status = 201;
          return { message: "Registrasi berhasil", userId };
        } catch (e) {
          set.status = 400;
          return { error: "Email sudah terdaftar." };
        }
      }, { body: t.Object({ email: t.String(), password: t.String() }) })
      
      .post("/login", async ({ body, jwt, cookie: { auth_token }, set }) => {
        const user = db.query("SELECT * FROM users WHERE email = $email").get({ $email: body.email }) as any;
        if (!user || !(await Bun.password.verify(body.password, user.password_hash))) {
          set.status = 401; return { error: "Invalid credentials" };
        }
        auth_token.set({
          value: await jwt.sign({ id: user.id, email: user.email }),
          httpOnly: true, secure: true, path: "/", maxAge: 604800
        });
        return { message: "Login berhasil", userId: user.id };
      }, { body: t.Object({ email: t.String(), password: t.String() }) })
  )

  // --- GRUP PROTECTED API ---
  .group("/api", (api) =>
    api
      .derive(async ({ jwt, cookie: { auth_token }, set }) => {
        const payload = await jwt.verify(auth_token.value);
        if (!payload) { set.status = 401; throw new Error("Unauthorized"); }
        return { user: payload };
      })
      .post("/teams", async ({ body, user, set }) => {
        const teamId = crypto.randomUUID();
        db.run("BEGIN TRANSACTION;");
        try {
          db.query("INSERT INTO teams (id, name) VALUES ($id, $name)").run({ $id: teamId, $name: body.name });
          db.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($t, $u, 'ADMIN')").run({ $t: teamId, $u: user.id });
          db.run("COMMIT;"); set.status = 201; return { teamId };
        } catch { db.run("ROLLBACK;"); set.status = 500; return { error: "Gagal" }; }
      }, { body: t.Object({ name: t.String() }) })
      // ... tambahkan rute targets di sini jika sudah jalan
  )
  .listen(3002);

// PRINT SEMUA RUTE SAAT STARTUP (Penting untuk diagnosa)
console.log("\n--- DAFTAR RUTE TERDAFTAR ---");
app.routes.forEach(r => console.log(`${r.method} ${r.path}`));
console.log("-----------------------------\n");

startMonitoringWorker();
console.log(`🦊 Backend API berjalan di http://localhost:3002`);