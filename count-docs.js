const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://arjunyonzan_db_user:AQkDITHGKUSSewPD@cluster0.i8xxbiu.mongodb.net/fastmind?retryWrites=true&w=majority';
async function count() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('fastmind');
  const count = await db.collection('documents').countDocuments();
  console.log('Total documents:', count);
  await client.close();
}
count().catch(console.error);
