import { NextResponse } from "next/server";
import { spawn } from "child_process";

let psProcess: any = null;
let psOutput = "";

function getOrCreateShell() {
  if (!psProcess || psProcess.killed) {
    psOutput = "";
    psProcess = spawn("powershell.exe", ["-NoExit", "-Command", "-"], {
      cwd: "C:\\work\\next-fastmind",
      stdio: ["pipe", "pipe", "pipe"],
    });
    psProcess.stdout.on("data", (data: Buffer) => { psOutput += data.toString(); });
    psProcess.stderr.on("data", (data: Buffer) => { psOutput += data.toString(); });
  }
  return psProcess;
}

export async function POST(req: Request): Promise<NextResponse> {
  const { command } = await req.json();
  const shell = getOrCreateShell();
  psOutput = "";
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(NextResponse.json({ output: psOutput || "(no output)" }));
    }, 5000);
    
    const onData = () => {
      clearTimeout(timeout);
      resolve(NextResponse.json({ output: psOutput }));
      shell.stdout.removeListener("data", onData);
    };
    
    shell.stdout.once("data", onData);
    shell.stdin.write(command + "\n");
  });
}