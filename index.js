const dns = require("node:dns");

// Force Node to use public DNS servers
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("hireloop-db");
    const jobCollection = database.collection("jobs");


     app.post('/api/jobs',async (req, res) => {
        const job = req.body
        console.log(job);
        
        const result =await jobCollection.insertOne(job)
        res.send(result)
        
    })
 
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})