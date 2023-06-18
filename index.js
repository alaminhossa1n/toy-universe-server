require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsalsjk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const dbConnect = async () => {
    try {
        client.connect();
        console.log(" Database Connected Successfully✅ ");

    } catch (error) {
        console.log(error.name, error.message);
    }
}
dbConnect();

const toysCollections = client.db('toysDB').collection('toys');
// run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
});

// add toy
app.post('/add-toy', async (req, res) => {
    const newToy = req.body;
    const result = await toysCollections.insertOne(newToy);
    res.send(result);
})

// get toys by category, sort, limit, email, search

app.get('/toys', async (req, res) => {

    const { category, sort, limit, email, search } = req.query;

    let query = toysCollections.find();

    if (category) {
        query = query.filter({ category });
    }

    if (email) {
        query = query.filter({ sellerEmail: email });
    }

    if (search) {
        query = query.filter({ name: search });
    }

    if (sort === 'asc') {
        query = query.sort({ price: 1 });
    } else if (sort === 'desc') {
        query = query.sort({ price: -1 });
    }

    if (limit) {
        const limitValue = parseInt(limit);
        query = query.limit(limitValue);
    }

    try {
        const products = await query.toArray();
        res.send(products);
    } catch (err) {
        console.error('Failed to fetch products:', err);
        res.status(500).send('Internal Server Error');
    }
})

// get toys by id

app.get('/toys/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await toysCollections.findOne(query)
    res.send(result);
})

// delete toy by id
app.delete('/toys/:id', async (req, res) => {
    id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await toysCollections.deleteOne(query)
    res.send(result)
})

// update toy
app.put('/toys/:id', async (req, res) => {
    const id = req.params.id
    const newToy = req.body
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true }

    const updatedToy = {
        $set: {
            price: newToy.price,
            description: newToy.description,
            quantity: newToy.quantity
        }
    }

    const result = await toysCollections.updateOne(filter, updatedToy, options)
    res.send(result)
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})