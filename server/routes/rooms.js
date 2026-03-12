const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ msg: "No token provided. Access denied." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token." });
  }
};

const generateId = (length) =>
  crypto.randomBytes(6).toString("hex").toUpperCase();

router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;

  try {
    let roomId = generateId(6);
    while (await Room.findOne({ roomId })) {
      roomId = generateId(6);
    }

    const passwordKey = generateId(3);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordKey, salt);

    const newRoom = new Room({ roomId, name: name || "Untitled", password: hashedPassword, owner });
    await newRoom.save();

    res.json({ msg: "Room Created", roomId, passwordKey });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/join", requireAuth, async (req, res) => {
  const { roomId, password } = req.body;
  try {
    const room = await Room.findOne({ roomId });

    if (!room) return res.status(404).json({ msg: "Room not found" });

    const isMatch = await bcrypt.compare(password, room.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid Password" });

    res.json({ msg: "Acess Granted", roomId: room.roomId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ msg: "Room not found" });
    res.json({ roomId: room.roomId, name: room.name });
  } catch (err) {
    res.status(500).json({ error: err.mesage });
  }
});

module.exports = router;
