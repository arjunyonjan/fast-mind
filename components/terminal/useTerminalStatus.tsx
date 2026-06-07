import { useEffect, useState } from "react";
export function useTerminalStatus() {
  const [status, setStatus] = useState<"online"|"offline"|"checking">("checking");
  useEffect(() => {
    let ws: WebSocket | null = null;
    const connect = () => {
      try {
        ws = new WebSocket("ws://localhost:3001");
        ws.onopen = () => { setStatus("online"); };
        ws.onerror = () => { setStatus("offline"); };
        ws.onclose = () => { setStatus("offline"); setTimeout(connect, 5000); };
        setTimeout(() => { if (ws?.readyState !== WebSocket.OPEN) setStatus("offline"); }, 1000);
      } catch { setStatus("offline"); setTimeout(connect, 5000); }
    };
    connect();
    return () => { if (ws) ws.close(); };
  }, []);
  return status;
}