const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Using MongoDB Atlas connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://ashutosh979424_db_user:Student%231709@cluster0.syeneax.mongodb.net/realty-ai?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // Test database access
    const db = client.db("realty-ai");
    const collections = await db.listCollections().toArray();
    console.log("📊 Collections in database:", collections.map(c => c.name));
    
  } catch (error) {
    console.error("❌ Connection error:", error.message);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);

