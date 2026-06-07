const WebSocket = require('ws');
const { spawn } = require('child_process');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const BLOCKED = ["rm -rf", "del /f", "format", "shutdown", "taskkill", "rd /s", "deltree"];

wss.on('connection', (ws) => {
  console.log('Terminal client connected');
  
  ws.on('message', (message) => {
    const { command, cwd } = JSON.parse(message);
    
    // Safety check
    for (const bad of BLOCKED) {
      if (command.toLowerCase().includes(bad)) {
        ws.send(JSON.stringify({ type: 'error', data: '⛔ BLOCKED: Dangerous command not allowed' }));
        return;
      }
    }
    
    console.log('Executing:', command);
    const ps = spawn('powershell.exe', ['-Command', command], { cwd: cwd || 'C:\\work\\next-fastmind' });
    
    let heartbeat = setInterval(() => {
      ws.send(JSON.stringify({ type: 'heartbeat', data: 'running...' }));
    }, 2000);
    
    ps.stdout.on('data', (data) => ws.send(JSON.stringify({ type: 'output', data: data.toString() })));
    ps.stderr.on('data', (data) => ws.send(JSON.stringify({ type: 'error', data: data.toString() })));
    ps.on('close', (code) => {
      clearInterval(heartbeat);
      ws.send(JSON.stringify({ type: 'done', data: `Exit code: ${code}` }));
      ws.close();
    });
  });
});

server.listen(3001, () => console.log('Terminal WebSocket server on ws://localhost:3001'));