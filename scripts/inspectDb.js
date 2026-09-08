const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aditya_chatbot';

async function inspectDatabase() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('=====================================================');
    console.log('🍃 ADITYA CHATBOT - MONGODB DATABASE INSPECTION TOOL');
    console.log('=====================================================');
    console.log(`Connected to: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}\n`);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('⚠️ No collections found in database yet.');
      process.exit(0);
    }

    for (const col of collections) {
      const collectionName = col.name;
      const count = await db.collection(collectionName).countDocuments();
      console.log(`📌 Collection: "${collectionName}" (${count} total records)`);

      if (count > 0) {
        const sampleDocs = await db.collection(collectionName).find().limit(2).toArray();
        console.log('   Sample Data Preview:');
        sampleDocs.forEach((doc, idx) => {
          console.log(`   [Record ${idx + 1}]:`, JSON.stringify(doc, null, 2).split('\n').map(l => '     ' + l).join('\n'));
        });
      }
      console.log('-----------------------------------------------------\n');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  }
}

inspectDatabase();
