const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


// middleware 
app.use(cors());
app.use(express.json());


//db user
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svbs0rh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// 
async function run(){
    try{
        // collection
        const allProduct = client.db('bytecodeVelocity').collection('productCollection');
        const threeCategory = client.db('bytecodeVelocity').collection('threeCollection');
        // const usersCollection = client.db('doctorsPortal').collection('users')

       
        // jwt
        //    app.get('/jwt', async(req, res) => {
        //     const email = req.query.email;
        //     const query = {email: email}
        //     console.log(email);
        //     const user = await usersCollection.findOne(query);
        //     console.log(user)
        //     res.send({accessToken: 'token'});
        // })

        app.get('/productCollection', async(req, res) => {
            const query = {}
            const result = await allProduct.find(query).toArray();
            res.send(result);
        })


        app.get('/threeCollection', async(req, res) => {
            const query = {};
            const result = await threeCategory.find(query).toArray();
            res.send(result);
        })


        app.get('/categories/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const category = await threeCategory.findOne(filter);
            const query = {product_id: category.product_id};
            const result= await allProduct.find(query).toArray();
            res.send(result);
        })


        app.get('/productDetails/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await allProduct.findOne(query);
            res.send(result);
        })


        



    }finally{

    }
}
run().catch(console.dir)



app.get('/',async (req, res) => {
    res.send('byteCode velocity');
})


app.listen(port, () => console.log(`byteCode velocity is running ${port}`))



// "npm-start-dev": "nodemon index.js",
// require('crypto').randomBytes(64).toString('hex')
