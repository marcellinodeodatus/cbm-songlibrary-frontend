const { app } = require("@azure/functions");

// Dummy data for demonstration
let leaders = [
  { leader_id: 1, name: "Alice" },
  { leader_id: 2, name: "Bob" },
];

app.http("worship-leaders", {
  route: "songs/worship-leaders",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    if (request.method === "GET") {
      return { jsonBody: leaders };
    }
    if (request.method === "POST") {
      const body = await request.json();
      const newLeader = {
        leader_id: leaders.length + 1,
        name: body.name,
      };
      leaders.push(newLeader);
      return { jsonBody: newLeader };
    }
    return { status: 405 };
  },
});
