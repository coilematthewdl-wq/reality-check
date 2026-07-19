const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PUBLIC_DIR = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const ROOM_NAME = 'Reality Check Room';

const server = http.createServer((req, res) => {
  const requestPath = req.url === '/' ? '/Chatproto.html' : req.url;
  const safePath = requestPath.split('?')[0];
  const filePath = path.join(PUBLIC_DIR, decodeURIComponent(safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

function getConnectedClients() {
  return Array.from(wss.clients).filter((client) => client.readyState === WebSocket.OPEN);
}

function broadcast(obj, except) {
  const payload = JSON.stringify(obj);
  getConnectedClients().forEach((client) => {
    if (client !== except) {
      client.send(payload);
    }
  });
}

function sendPresence() {
  const users = getConnectedClients().map((client) => client.username || 'Anonymous');
  const payload = { type: 'presence', room: ROOM_NAME, users, count: users.length };
  const message = JSON.stringify(payload);
  getConnectedClients().forEach((client) => client.send(message));
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.username = 'Anonymous';
  ws.room = ROOM_NAME;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (error) {
      return;
    }

    if (msg.type === 'join') {
      ws.username = String(msg.username || 'Anonymous').slice(0, 32);
      broadcast({ type: 'notice', text: `${ws.username} joined the room` });
      sendPresence();
      ws.send(JSON.stringify({ type: 'joined', username: ws.username, room: ROOM_NAME }));
      return;
    }

    if (msg.type === 'message' && ws.username) {
      const text = String(msg.text || '').slice(0, 1000).trim();
      if (!text) return;

      broadcast({
        type: 'message',
        username: ws.username,
        text,
        ts: Date.now()
      });
    }
  });

  ws.on('close', () => {
    if (ws.username && ws.username !== 'Anonymous') {
      broadcast({ type: 'notice', text: `${ws.username} left the room` });
    }
    sendPresence();
  });

  ws.on('error', () => {
    sendPresence();
  });

  sendPresence();
});

setInterval(() => {
  getConnectedClients().forEach((ws) => {
    if (!ws.isAlive) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
