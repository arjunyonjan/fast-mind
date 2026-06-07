import { useState } from "react";
export function useTerminalExecutor() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const run = (command: string) => {
    if (!command.trim()) return;
    setRunning(true);
    setOutput("");
    const ws = new WebSocket("ws://localhost:3001");
    ws.onopen = () => {
      ws.send(JSON.stringify({ command, cwd: "C:\\work\\next-fastmind" }));
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "output") {
          setOutput(prev => prev + data.data);
        } else if (data.type === "heartbeat") {
          setOutput(prev => prev + "[⏳] " + data.data + "\n");
        } else if (data.type === "done") {
          setOutput(prev => prev + "\n✅ " + data.data);
          setRunning(false);
          ws.close();
        }
      } catch {
        setOutput(prev => prev + "[⚠️ Parse error]\n");
      }
    };
    ws.onerror = () => {
      setOutput("❌ Server offline. Run: node terminal-server.js");
      setRunning(false);
    };
    ws.onclose = () => {
      setRunning(false);
    };
  };
  return { running, output, run, setOutput };
}