const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const companiesCollection = database.collection("companies");
    const usersCollection = database.collection("user");
    const applicationsCollection = database.collection('applications')

    // user api
    app.get('/api/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)

    })

    // job related api
    app.get('/api/jobs/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id: new ObjectId(id)
      }
      const result = await jobsCollection.findOne(query)
      res.send(result)
    })
    app.get('/api/jobs', async (req, res) => {

      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.post('/api/jobs', async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job)
      res.send(result)
    })
    app.get('/api/my/jobs', async (req, res) => {
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

    // application related api
    app.post('/api/application', async (req, res) => {
      const application = req.body;
      const result = await applicationsCollection.insertOne(application)
      res.send(result)
    })
    app.get('/api/application',async(req,res) =>{
      const query = {}
      if(req.query.candidateId){
        query.candidateId =  req.query.candidateId
      }
      if(req.query.jobId){
        query.jobId = req.query.jobId
      }
      const cursor = applicationsCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    // company related api 
    app.get('/api/company/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      }
      const result = await companiesCollection.findOne(query)
      res.send(result)
    })
    app.get('/api/companies', async (req, res) => {
      const result = await companiesCollection.find().toArray();
      res.send(result)
    })
    app.get('/api/my/company', async (req, res) => {
      try {
        let query = {};
        if (req.query.recruiterId) {
          query.recruiterId = req.query.recruiterId;
        }
        const result = await companiesCollection.findOne(query);

        if (!result) {
          return res.status(200).json(null);
        }

        return res.status(200).json(result);
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json(null);
      }
    });
    app.post('/api/companies', async (req, res) => {
      const company = req.body;
      const result = await companiesCollection.insertOne(company)
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