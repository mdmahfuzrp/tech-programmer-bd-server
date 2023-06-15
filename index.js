const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();

// MiddleWare
app.use(cors());
app.use(express.json());


//--------------------------------------------
// -------------------MONGODB CODE------------
//--------------------------------------------

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATA_USER}:${process.env.DATA_PASS}@cluster0.jlpngjm.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // ----------------MY CODE START---------------

        const usersCollection = client.db("techProgrammerBD").collection("users");

        // When signup a new user: store user data in database (usersCollection)
        app.post('/users', async (req, res)=>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // Get all users data from database (usersCollection)
        app.get('/users', async(req, res)=>{
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        app.get('/users/active/:email', async (req, res)=>{
            const email = req.params.email;
            const query = { userEmail: email};
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        // -----------------MY CODE END----------------



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

//------------------------------------------
// -----------------------------------------
app.get('/', (req, res) => {
    res.send('TPBD -server on the work')
})
app.listen(port, () => {
    console.log('TPBD Running on port: ', port);
})