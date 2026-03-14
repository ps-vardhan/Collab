# Collaborative Development Suite

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Chakra UI](https://img.shields.io/badge/Chakra--UI-2.10-319795?style=for-the-badge&logo=chakra-ui)](https://v2.chakra-ui.com/)
[![License-MIT](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

A high-performance, unified engineering workspace that integrates **real-time code editing**, **infinite whiteboarding**, and **spatial voice chat** into a single, immersive "Obsidian" glassmorphic interface.

---

## Project Showcase

> [!TIP]
> This platform is designed for teams who need more than just a code editor. It's a complete ecosystem for technical brainstorming, live pairing, and architectural planning.

<!-- VIDEO SPACE START -->

![Project Demo Placeholder](https://via.placeholder.com/1280x720.png?text=Demonstration+Video+Placement)
_Video demonstration can be found in `/public/assets/videos/demo.mp4`_

<!-- VIDEO SPACE END -->

---

## Core Capabilities

### Peer-to-Peer Code Workspace

- **Monaco Engine**: Industrial-strength editing with syntax support for 100+ languages and intelligent autocomplete.
- **Live Propagation**: Sub-millisecond state synchronization across any number of peers using **Yjs CRDTs**.
- **Persistent Terminal**: An always-on execution console in a resizable right-sidebar, providing immediate runtime feedback.

### Infinite Collaborative Board

- **Edge-to-Edge Workspace**: A vast 2500x1800 canvas optimized for complex architectural diagrams and freehand sketches.
- **Smart Canvas**: Integrated shape tools (Circle/Rect), custom brush textures, and advanced zoom logic (0.5x to 3x).
- **Session Continuity**: High-fidelity canvas state preservation ensures your drawings are exactly where you left them.

### Spatial Voice Conferencing

- **LiveLink Audio**: Low-latency, peer-to-peer WebRTC voice rooms for drop-in technical discussions.
- **Glassmorphic Controls**: A floating pill-style footer provides rapid mic toggling and presence monitoring.
- **Network Intelligence**: Real-time collaborative avatars showing who’s active, who's muted, and who just joined.

---

## Architectural Blueprint

### High-Level Tech Stack

- **Frontend**: React 19 (Hooks/Context), Vite (Build), Chakra UI (Design System), Framer Motion (Animations).
- **Real-time Logic**: Yjs (CRDT synchronization), Socket.IO (Signaling), simple-peer (WebRTC).
- **Persistence**: Node.js, Express, MongoDB (Aggregated session history and account security).

### Design Philosophy: "The Obsidian System"

Built the suite with a focus on **visual excellence** and **interaction density**:

- **Glassmorphism**: 25px blur levels on all high-level control panels.
- **Pill UI**: Detached, rounded floating elements that provide a sense of "layered" depth.
- **Micro-interactions**: Subtle hover scales and glow keyframes for intuitive feedback.

---

## ⚠️ Robustness & Known Edge Cases

To ensure a smooth experience, take note of the following architectural constraints and potential failure points:

### 1. Networking & WebRTC

> [!WARNING]
> **Firewalls & NAT**: In some restricted network environments, direct peer-to-peer WebRTC connections may fail. This implementation uses public STUN servers. For guaranteed production reliability, integrating a **TURN server** is recommended.

### 2. Synchronization (Yjs)

- **High Latency Recovery**: Yjs is highly resilient, but extreme network instability may cause temporary "ghost" cursors until the peer re-syncs. The system is designed to converge automatically without data loss.

### 3. Environment Dependencies

- **JWT Integrity**: The server performs a strict check for `JWT_SECRET` on startup. If missing, the process will terminate to prevent insecure sessions.
- **Persistence**: While collaboration is real-time, room discovery and authentication require an active **MongoDB** connection.

### 4. Browser Compatibility

- This suite utilizes modern Node.js polyfills. Best performance is achieved on the latest versions of Chrome, Edge, or Firefox.

---

## 🛠️ Execution Guide

### 1. Prerequisites

- **Node.js**: v18 or later
- **MongoDB**: Active instance (Local or Atlas)
- **Environment**: A `.env` file in `/server` containing `Mongo_URI`, `PORT`, and a secure `JWT_SECRET`.

### 2. Deploy Backend

```bash
cd server
npm install
npm start
```

### 3. Deploy Frontend

```bash
# From the root directory
npm install
npm run dev
```
