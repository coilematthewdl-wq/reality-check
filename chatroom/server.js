const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const ROOM_NAME = 'Reality Check Room';
const STATIC_DIRS = [
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'frontend')
];

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };
  return map[ext] || 'application/octet-stream';
}

function resolveStaticFile(requestPath) {
  const decodedPath = decodeURIComponent((requestPath || '/').split('?')[0]);
  const normalizedPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const relativePath = normalizedPath.replace(/^\/+/, '');

  const candidates = [];
  if (normalizedPath === '/index.html' || normalizedPath === '/') {
    candidates.push(path.join(STATIC_DIRS[0], 'index.html'));
    candidates.push(path.join(STATIC_DIRS[1], 'index.html'));
  }

  if (normalizedPath.startsWith('/public/')) {
    candidates.push(path.join(STATIC_DIRS[0], normalizedPath.slice('/public/'.length)));
  } else if (normalizedPath.startsWith('/frontend/')) {
    candidates.push(path.join(STATIC_DIRS[1], normalizedPath.slice('/frontend/'.length)));
  }

  candidates.push(path.join(STATIC_DIRS[0], relativePath));
  candidates.push(path.join(STATIC_DIRS[1], relativePath));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
    return;
  }

  const filePath = resolveStaticFile(req.url);
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading file');
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }
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

    if (msg.type === 'submission' && ws.username) {
      broadcast({
        type: 'submission',
        contentType: msg.contentType,
        pollId: msg.pollId,
        headline: msg.headline,
        imageUrl: msg.imageUrl,
        linkUrl: msg.linkUrl,
        linkTitle: msg.linkTitle,
        source: msg.source,
        description: msg.description,
        correctAnswer: msg.correctAnswer,
        username: ws.username,
        ts: Date.now()
      });
    }

    if (msg.type === 'confidence_vote' && ws.username) {
      broadcast({
        type: 'confidence_vote',
        pollId: msg.pollId,
        username: ws.username,
        confidence: msg.confidence,
        vote: msg.vote,
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
