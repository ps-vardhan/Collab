const { createToken } = require('./livekit-token.js');

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const WebSocket = require("ws");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");

const { setupWSConnection } = require("./utils");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

mongoose
  .connect(
    process.env.Mongo_URI || "mongodb://localhost:27017/collaborative-editor"
  )
  .then(() => console.log("MongoDb Connected"))
  .catch((err) => console.error("MongoDb Connection Error:", err));

app.get("/api/token", async (req, res) => {
  const room = req.query.room;
  const userName = req.query.username || "Guest";
  try {
    const token = await createToken(room, userName);
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req, { gc: true });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
