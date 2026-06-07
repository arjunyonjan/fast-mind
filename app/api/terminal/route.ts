import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(req: Request): Promise<NextResponse> {
  const { command } = await req.json();
  try {
    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(command, { shell: "powershell.exe", timeout: 30000 }, (error, stdout, stderr) => {
        if (error) reject(stderr || error.message);
        else resolve({ stdout, stderr });
      });
    });
    return NextResponse.json({ output: result.stdout || result.stderr });
  } catch (err: any) {
    return NextResponse.json({ error: typeof err === "string" ? err : err.message || "Unknown error" });
  }
}