import { connectToDatabase } from "@/lib/mongodb";

async function insert() {
  const db = await connectToDatabase();
  await db.collection("pendingTasks").insertOne({
    sessionId: "test-session",
    type: "task",
    data: { title: "Test snooze", description: "Testing", priority: "medium" },
    createdAt: new Date()
  });
  console.log("✅ Pending task created");
}

insert();
