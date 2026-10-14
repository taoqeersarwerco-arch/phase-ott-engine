# PHASE — Serverless Magnet-to-Native OTT Streaming & Download Engine

A complete **JioHotstar / Netflix-inspired OTT web application** engineered for **Vercel deployment**. It combines a **Sequential Magnet/Torrent Piece-Assembler HUD**, **WebRTC P2P + HTTP 206 WebSeeds (`archive.org`)**, and a **Direct Disk Download Manager** inside a 100% custom native HTML5 `<video>` UI.

---

## 🚀 Deploy to GitHub & Vercel in 3 Steps

### 1. Push to GitHub
```bash
unzip phase-ott-engine.zip
cd phase-ott-engine
git init
git add .
git commit -m "feat: initial commit of PHASE Magnet-to-Native OTT Engine"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Framework Preset will automatically detect **Next.js**.
3. Click **Deploy** (No environment variables are required for immediate playback—the app ships with a pre-indexed Open-Source & Public Domain Magnet + WebSeed catalog and live Internet Archive resolver!).

### 3. Run Locally (Optional)
```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🧠 Why This Works on Vercel (Serverless Architecture)

Vercel Serverless Functions disallow persistent raw UDP/TCP sockets and enforce execution timeouts. To ensure **100% working playback and downloads on Vercel**, PHASE implements a **Dual-Mode Hybrid Engine**:

1. **Client-Side Sequential Piece Assembler + WebSeeds (`ws=`):**
   - Every Magnet URI in the catalog embeds both **WebRTC P2P Trackers (`wss://`)** and **HTTP 206 Byte-Range WebSeeds (`ws=https://archive.org/...`)**.
   - Prioritizes **Tier-0 (`moov` atom header at Piece `#0` & `#63`)** and **Tier-1 (Sliding Window around the playback cursor)** inside your custom React `<video>` OSD.
2. **Live Internet Archive Magnet Resolver (`/api/resolve`):**
   - Use the top search bar and click **Deep Find** to query `archive.org`'s catalog in real time, extract the movie's real SHA-1 BitTorrent InfoHash (`btih`) and `.mp4` WebSeed, and stream it natively.
3. **Serverless HTTP 206 Byte-Range & Download Relay (`/api/stream`):**
   - Relays `Range: bytes=...` headers for instant timeline scrubbing and sets `Content-Disposition: attachment` for one-click `.mp4` downloads.
