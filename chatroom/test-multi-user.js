const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createClient(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
}

(async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await wait(1000);

    const clientA = await createClient('ws://127.0.0.1:3000');
    const clientB = await createClient('ws://127.0.0.1:3000');

    const messagesA = [];
    const messagesB = [];

    clientA.on('message', (data) => messagesA.push(JSON.parse(data.toString())));
    clientB.on('message', (data) => messagesB.push(JSON.parse(data.toString())));

    clientA.send(JSON.stringify({ type: 'join', username: 'Alice' }));
    clientB.send(JSON.stringify({ type: 'join', username: 'Bob' }));

    await wait(500);

    const sawPresenceA = messagesA.some((msg) => msg.type === 'presence' && Array.isArray(msg.users));
    const sawPresenceB = messagesB.some((msg) => msg.type === 'presence' && Array.isArray(msg.users));

    assert.strictEqual(sawPresenceA, true, 'Alice should receive a presence update');
    assert.strictEqual(sawPresenceB, true, 'Bob should receive a presence update');

    console.log('Multi-user chat test passed');
  } catch (error) {
    console.error('Multi-user chat test failed');
    console.error(error.stack || error.message);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
})();
