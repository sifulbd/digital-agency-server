const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eobd6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });

const app = express();
const port = 7000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('admins'));
app.use(fileUpload());


client.connect ( err => {

    const servicesCollection = client.db("digitalAgency").collection("services");
    const reviewsCollection = client.db("digitalAgency").collection("reviews");
    const adminsCollection = client.db("digitalAgency").collection("admins");
    const ordersCollection = client.db("digitalAgency").collection("orders");

    app.post("/addNewService", (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const img = file.name;
        
        serviceCollection.insertOne({title, description, img})
        .then(result => {
            res.send(result.insertedCount > 0);
        });

        file.mv(`${__dirname}/admins/${file.name}`, err => {
            if(err){
                return res.status(500).send({msg: "failed to Upload"})
            }
            return res.send({name: file.name, path: `/${file.name}`})
        })
    });

    app.get('/services', (req, res) => {
        serviceCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    });

    app.get('/serviceList', (req, res) => {
        ordersCollection.find({email: req.query.email})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    });

    app.post("/addReview", (req, res) => {
        const review = req.body;
        reviewsCollection.insertOne(review)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    });

    app.get('/allReviews', (req, res) => {
        reviewsCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    });

    app.post("/addOrder", (req, res) => {
        const register = req.body;
        ordersCollection.insertOne(register)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    });

    app.get('/allOrders', (req, res) => {
        ordersCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    });

    app.get('/orders/:key', (req, res) => {
        serviceCollection.find({_id: ObjectId(req.params.key)})
        .toArray( (err, documents) => {
            res.send(documents[0]);
        })
    });

    app.post("/newAdmin", (req, res) => {
        const admins = req.body;
        adminsCollection.insertOne(admins)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
        .toArray((err, doctors) => {
            res.send(doctors.length > 0);
        })
    });

    app.patch("/update/:id", (req, res) => {
        ordersCollection.updateOne({_id : ObjectId(req.params.id)},
        {
            $set: {status: req.body.status}
        })
        .then(result => {
            res.send(result.modifiedCount > 0);
        })
    })
});

app.get('/', (req, res) => {
    res.send('Hello World..')
})

app.listen(process.env.PORT || port)