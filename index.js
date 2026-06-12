const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const { log } = require("node:console");
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
    // await client.connect();
    const database = client.db("hireloop-db");
    const jobsCollection = database.collection("jobs");
    const companyCollection = database.collection("companies");

    // job related api
    app.post('/api/jobs', async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job)
      res.send(result)
    })
    app.get('/api/jobs', async (req, res) => {
      let query = {};
      if (req.query.companyId) {
        query.companyId = req.query.companyId
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    // company related api 
    app.get('/api/my/company', async (req, res) => {
  try {
    let query = {};
    if (req.query.recruiterId) {
      query.recruiterId = req.query.recruiterId;
    }
    const result = await companyCollection.findOne(query);
    
    if (!result) {
      return res.status(200).json(null); 
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(null);
  }
});
    app.post('/api/companies' , async(req,res) =>{
      const company = req.body;
      const result  = await companyCollection.insertOne(company)
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