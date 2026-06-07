const { MongoClient } = require('mongodb');

async function insert() {
  const uri = 'mongodb+srv://arjunyonzan_db_user:AQkDITHGKUSSewPD@cluster0.i8xxbiu.mongodb.net/fastmind?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('fastmind');
  
  await db.collection('pendingTasks').insertOne({
    sessionId: 'test-session',
    type: 'task',
    data: { title: 'Test snooze feature', description: 'Testing reminder', priority: 'medium' },
    createdAt: new Date()
  });
  
  console.log('✅ Pending task created');
  await client.close();
}

insert().catch(console.error);
