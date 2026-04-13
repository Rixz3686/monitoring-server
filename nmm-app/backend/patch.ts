import db from "./db";
db.run("DROP TABLE IF EXISTS targets;");
console.log("💥 Tabel targets lama berhasil dihancurkan!");
