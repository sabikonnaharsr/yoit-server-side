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
        // collection all product
        const allProduct = client.db('bytecodeVelocity').collection('productCollection');

        // three category collection
        const threeCategory = client.db('bytecodeVelocity').collection('threeCollection');

        // booking collection
        const bookingsCollection = client.db('bytecodeVelocity').collection('bookings')
    
        // wishlist collection
        const wishlistsCollections = client.db('bytecodeVelocity').collection('wishlists')

       
        // jwt
        //    app.get('/jwt', async(req, res) => {
        //     const email = req.query.email;
        //     const query = {email: email}
        //     console.log(email);
        //     const user = await usersCollection.findOne(query);
        //     console.log(user)
        //     res.send({accessToken: 'token'});
        // })


        // all product
        app.get('/productCollection', async(req, res) => {
            const query = {}
            const result = await allProduct.find(query).toArray();
            res.send(result);
        })


        // category home collection
        app.get('/threeCollection', async(req, res) => {
            const query = {};
            const result = await threeCategory.find(query).toArray();
            res.send(result);
        })

        
        // category id
        app.get('/categories/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const category = await threeCategory.findOne(filter);
            const query = {product_id: category.product_id};
            const result= await allProduct.find(query).toArray();
            res.send(result);
        })

 

                
        // product details
        app.get('/productDetails/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await allProduct.findOne(query);
            res.send(result);
        })


        // booking products
        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            console.log(booking)
            const query = {
                email: booking.email,
                productId: booking.productId
            }
            const alreadyWishlist = await bookingsCollection.find(query).toArray();
            if (alreadyWishlist.length) {
                const message = `Already booking This product ${booking.itemName}`;
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);

        })


        //wishlist products add
        app.post('/wishlist', async (req, res) => {
            const wishlist = req.body;
            const query = {
                email: wishlist.email,
                productId: wishlist.productId
            }
            const alreadyWishlist = await wishlistsCollections.find(query).toArray();
            if (alreadyWishlist.length) {
                const message = `Already wishlist This product ${wishlist.name}`;
                return res.send({ acknowledged: false, message })
            }

            const wishlistProduct = await wishlistsCollections.insertOne(wishlist);
            res.send(wishlistProduct)
        })


        // add to wishlist
        app.get('/get-wishlist', async(req, res) => {
            const query = {};
            const result = await wishlistsCollections.find(query).toArray();
            res.send(result);
        })

        //  addvertise
        app.get("/update", async (req, res) => {
            const filter = {};
            const option = { upsert: true };
            const updateDoc = {
              $set: {
                advertiseShow: false,
                status: "available",
                email: "sabion@gmail.com"
              },
            };
            const result = await allProduct.updateMany(
              filter,
              updateDoc,
              option
            );
      
            res.send(result);
          });


        //   adveritse get data
        app.get("/advertise-products/:email", async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const result = await allProduct
              .find({
                email: email,
                advertiseShow: true,
                status: "available",
              })
              .toArray();
            res.send(result);
          });


        // fkkf
        // app.get('/myproducts', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email };
        //     const result = await allProduct.find(query).toArray();
        //     res.send(result);
        // })




        // add product
        app.post('/addProduct', async (req,res) => {
            const productData = req.body;
            const product = await allProduct.insertOne(productData);
            res.send(product);
        })


        
        // create a payment intent
        app.post('/create-payment-intent',async(req,res)=>{
            const price = req.body.price.resalePrice
            const amount = price * 100
            const paymentIntent = await stripe.paymentIntents.create({ 
            currency: "usd",
            amount: amount,
            "payment_method_types": [
                "card"
        
            ]
            
            });
            res.send({
            clientSecret: paymentIntent.client_secret,
            });
        })
        
        // payment data stored in database 
        app.post('/payments',async(req,res)=>{
            const payment = req.body
        
            // inject data in payment collectioon
            const id = payment.product_id
            const filter = {_id: ObjectId(id)}
            const result = await paymentsCollection.insertOne(payment)  
            const updatedDoc = {
                $set:{
                    
                    sellStatus:"sold",
                    
                }
                
            }
            const orders = {
                productName : payment.name,
                paymentStatus : true,
                transactionId: payment.transactionId,
                email: payment.email,
                productId : id,
                sellStatus:"sold",
                price : payment.price 
            }
            const updatedProducts = await productsCollection.updateOne(filter,updatedDoc)
        const updatedResult = await ordersCollection.insertOne(orders)      
            res.send(result)
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

