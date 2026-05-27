const fs = require("fs");
const readline = require("readline");
const envPath = ".env";
let apiKey = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/^DEEPSEEK_API_KEY=(.+)$/m);
  if (match) apiKey = match[1].trim();
}
if (!apiKey) { console.error("Missing DEEPSEEK_API_KEY in .env"); process.exit(1); }
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("DeepSeek TUI (type \"exit\" to quit)\n");
const ask = () => {
  rl.question("> ", async (input) => {
    if (input === "exit") { rl.close(); return; }
    try {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: input }] })
      });
      const data = await res.json();
      if (data.error) console.error("API Error:", data.error);
      else if (data.choices) console.log(data.choices[0].message.content);
      else console.log("Unexpected response:", JSON.stringify(data, null, 2));
    } catch (err) { console.error("Request failed:", err.message); }
    console.log();
    ask();
  });
};
ask();
