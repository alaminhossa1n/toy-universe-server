const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsalsjk.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }

    const toysCollections = client.db('toysDB').collection('toys')

    // add toy
    app.post('/add-toy', async (req, res) => {
        const newToy = req.body;
        const result = await toysCollections.insertOne(newToy);
        res.send(result);
    })

    // get toys by category

    app.get('/toys', async (req, res) => {
        let query = {};
        const limit = (req.query.limit);

        if (req.query?.category) {
            query = { category: req.query.category }
        }

        if (req.query?.email) {
            query = { sellerEmail: req.query.email }
        }

        const result = await toysCollections.find(query).toArray();
        const limitedData = result.slice(0, limit);

        if (limitedData) {
            res.send(limitedData);
        } else {
            res.send(result);
        }
    })

    // delete toy by id
    app.delete('/toys/:id', async (req, res) => {
        id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await toysCollections.deleteOne(query)
        res.send(result)
    })

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})