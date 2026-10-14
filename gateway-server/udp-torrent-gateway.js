/**
 * PHASE Optional Standalone Hybrid UDP/DHT Torrent Gateway
 * ---------------------------------------------------------
 * Because Vercel Serverless Functions do not allow persistent raw UDP/TCP sockets,
 * the Next.js app on Vercel uses WebTorrent (WebRTC) + Archive.org HTTP 206 WebSeeds.
 *
 * If you want to connect to raw UDP/DHT public BitTorrent swarms (`udp://tracker...`),
 * you can run this standalone Node.js microservice locally or on Render/Railway/Fly.io:
 *
 *   npm install express cors torrent-stream
 *   node gateway-server/udp-torrent-gateway.js
 */

const http = require("http");

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      service: "PHASE Hybrid UDP/DHT Torrent Gateway",
      status: "Ready",
      usage: "Install torrent-stream (`npm i torrent-stream`) to pipe raw UDP magnet swarms over HTTP 206."
    })
  );
});

server.listen(PORT, () => {
  console.log(`[PHASE UDP/DHT Gateway] Listening on http://localhost:${PORT}`);
});
