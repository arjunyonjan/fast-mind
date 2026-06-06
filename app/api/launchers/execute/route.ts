import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const launcher = await db.collection("launchers").findOne({ 
      _id: new ObjectId(id) 
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: "Launcher not found" }, { status: 404 });
    }

    const options = launcher.cwd ? { cwd: launcher.cwd } : {};
    const { stdout, stderr } = await execAsync(launcher.command, options);

    return NextResponse.json({ 
      success: true, 
      output: stdout || stderr || "Command executed successfully" 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      output: err.stdout || err.stderr || null
    }, { status: 500 });
  }
}