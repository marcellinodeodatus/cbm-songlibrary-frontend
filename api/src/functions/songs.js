const { app } = require("@azure/functions");
const sql = require("mssql");

// Configure your MSSQL connection (use environment variables for security)
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // e.g., "localhost"
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // for Azure SQL
    trustServerCertificate: true, // change to false for production
  },
};

app.http("worship-leaders", {
  route: "songs/worship-leaders",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    if (request.method === "GET") {
      try {
        await sql.connect(config);
        const result =
          await sql.query`SELECT leader_id, name FROM WorshipLeaders`;
        return { jsonBody: result.recordset };
      } catch (err) {
        context.log.error("DB error:", err);
        return { status: 500, jsonBody: { error: "Database error" } };
      }
    }
    if (request.method === "POST") {
      try {
        const body = await request.json();
        await sql.connect(config);
        const insertResult = await sql.query`
          INSERT INTO WorshipLeaders (name) 
          OUTPUT INSERTED.leader_id, INSERTED.name
          VALUES (${body.name})
        `;
        return { jsonBody: insertResult.recordset[0] };
      } catch (err) {
        context.log.error("DB error:", err);
        return { status: 500, jsonBody: { error: "Database error" } };
      }
    }
    return { status: 405 };
  },
});
