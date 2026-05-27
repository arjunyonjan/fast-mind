import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME!;

if (!uri) throw new Error('MONGODB_URI is missing');
if (!dbName) throw new Error('DB_NAME is missing');

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    console.log('⚡ Using cached database connection');
    return cachedDb;
  }

  console.log('🔄 Creating new database connection...');
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  console.log('✅ Database connected and cached');

  return db;
}
