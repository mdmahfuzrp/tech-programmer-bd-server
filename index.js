const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

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
        const classCollection = client.db("techProgrammerBD").collection("classes");
        const selectedClassCollection = client.db("techProgrammerBD").collection("selectedClasses");
        const paymentCollection = client.db("techProgrammerBD").collection("payments");


        // When signup a new user: store user data in database (usersCollection)
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // Get all users data from database (usersCollection)
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // Find logged active user in website
        app.get('/users/active/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        // Update User Role to Admin
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const update = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(query, update);
            res.send(result);
        })

        // Update User Role to Instructor
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const update = {
                $set: { role: 'instructor' },
            };
            const result = await usersCollection.updateOne(query, update);
            res.send(result);
        })

        // Delete User From the Database
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        // Add A New Class
        app.post('/classes', async (req, res) => {
            const newClass = req.body;
            console.log(newClass);
            const result = await classCollection.insertOne(newClass);
            res.send(result);
        })

        // Get all classes from database
        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result);
        })

        // Update Class Status by Admin
        app.patch('/classes/approve/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const update = {
                $set: { status: 'Approve' },
            };
            const result = await classCollection.updateOne(query, update);
            res.send(result);
        })

        // Update Class Status by Admin
        app.patch('/classes/deny/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const update = {
                $set: { status: 'Deny' },
            };
            const result = await classCollection.updateOne(query, update);
            res.send(result);
        })

        // Update with Insert Feedback by Admin
        app.patch('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const feedback = req.body;
            console.log(id, feedback);
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: { feedback: feedback },
            };
            const result = await classCollection.updateOne(query, update);
            res.send(result);
        })

        app.get('/instructors', async (req, res) => {
            const query = { role: 'instructor' };
            const result = await usersCollection.find(query).sort({ student: -1 }).toArray();
            res.send(result);
        })

        app.get('/student', async (req, res) => {
            const query = { role: 'student' };
            const result = await usersCollection.find(query).sort({ student: -1 }).toArray();
            res.send(result);
        })


        app.get('/classes/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { instructorEmail: email };
            const result = await classCollection.find(query).toArray();
            res.send(result);
        });

        // Get All Approved Classes
        app.get('/classes/approve', async (req, res) => {
            const query = { status: 'Approve' };
            const result = await classCollection.find(query);
            res.send(result);
        });

        app.post('/selectedClass', async (req, res) => {
            const selectedClass = req.body;
            console.log(selectedClass);
            const result = await selectedClassCollection.insertOne(selectedClass);
            res.send(result);
        })

        app.get('/selectedClass', async (req, res) => {
            const result = await selectedClassCollection.find().toArray();
            res.send(result);
        })

        app.delete('/selectedClass/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await selectedClassCollection.deleteOne(query);
            res.send(result);
        })

        app.delete('/selectedClass', async (req, res) => {
            try {
                const result = await selectedClassCollection.deleteMany({});
                res.send({ deletedCount: result.deletedCount });
            } catch (error) {
                res.status(500).send({ error: 'Failed to delete data from selectedClassCollection' });
            }
        });

        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            console.log(payment);
            const result = await paymentCollection.insertOne(payment);
            res.send(result)
        })

        app.get('/payments', async (req, res) => {
            const result = await paymentCollection.find().toArray();
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