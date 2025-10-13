// Minimal HTTP server
import http from "http";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("OK");
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<main style="font-family: system-ui; padding: 2rem; line-height: 1.5">
    <h1>Coolify works! 🚀</h1>
    <p>Deployed from Git → built by Coolify → powered by Gozunga 🚀.</p>
    <p><strong>PORT:</strong> ${PORT}</p>
  </main>`);
});

server.listen(PORT, () => console.log("Server listening on port " + PORT));
