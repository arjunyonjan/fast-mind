export async function GET() {
  return Response.json({ 
    hasUri: !!process.env.MONGODB_URI,
    dbName: process.env.DB_NAME,
    allKeys: Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB'))
  });
}
