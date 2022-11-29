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
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
        // users
        const usersCollections = client.db('bytecodeVelocity').collection('users')
        // 
        const paymentCollections = client.db('bytecodeVelocity').collection('payment')

       
        // jwt
        //    app.get('/jwt', async(req, res) => {
        //     const email = req.query.email;
        //     const query = {email: email}
        //    
        //     const user = await usersCollection.findOne(query);
        //     
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
            const result = await bookingsCollection.findOne(query);
            res.send(result);
        })


        // booking products
        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const id = booking.productId;
            const filter = {_id: ObjectId(id)};
            const option = {upsert: true}
            const updateDoc = {
                $set: {
                    status: "booked"
                }

            }
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
            const bookingProductUpdate = await allProduct.updateOne(filter, updateDoc, option)
            res.send(result);

        })



        // get my bookings
        app.get('/myBookings', async (req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const result = await bookingsCollection.find(query).toArray();
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


        // advertise update
        app.get("/myProductAdvertise/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = {upsert: true}
            const updateDoc = {
              $set: {
                advertiseShow: true,
                
              },
            };
            const result = await allProduct.updateOne(filter, updateDoc, option);
            res.send(result);
          });


        //   advertise show
          app.get("/advertise-products", async (req, res) => {
            const result = await allProduct
              .find({
                advertiseShow: true,
              })
              .toArray();
            res.send(result);
          });
         



        // MYproduct
        app.get('/myproducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await allProduct.find(query).toArray();
            res.send(result);
        })




        // add product
        app.post('/addProduct', async (req,res) => {
            const productData = req.body;
            const product = await allProduct.insertOne(productData);
            res.send(product);
        })




        // add users
        app.post('/users', async (req,res) => {
            const productData = req.body;
            const product = await usersCollections.insertOne(productData);
            res.send(product);
        })


        // admin route
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollections.findOne(query);   
            res.send(user);
        })

   
        // admin get  users
        app.get('/allUsers', async (req, res) => {
            const query = {};
            const result = await usersCollections.find(query).toArray();
            res.send(result);
        })


        // admin get all buyer
        app.get('/allBuyers', async (req, res) => {
            const query = {accountType: 'buyer'};
            const result = await usersCollections.find(query).toArray();
            res.send(result);
        })


        // admin get all users
        app.get('/allSellers', async (req, res) => {
            const query = {accountType: 'seller'};
            const result = await usersCollections.find(query).toArray();
            res.send(result);
        })


        // admin delete users
        app.delete('/allUsers/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await usersCollections.deleteOne(query);
            res.send(result);
        })


        // reported product api
        app.put('/reportedProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const option = {upsert: true};
            const updateDoc = {
                $set: {
                    reported: true
                }
            }
            const result = await allProduct.updateOne(query, updateDoc, option)
            res.send(result);
        })



        // get to reported product
        app.get('/reportedProduct', async (req, res) => {
            const query = {reported: true}
            const result = await allProduct.find(query).toArray();
            res.send(result);
        })



        // deleted reported product form all product collection
        app.delete('/reportedProduct/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await allProduct.deleteOne(query);
            res.send(result);
        })
 





        
        // create a payment intent
        app.post('/create-payment-intent',async(req,res)=>{
            const price = req.body.seller_price;
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
            const id = payment.productId;
            const filter = {_id: ObjectId(id)}
            const option = {upsert: true}
            const result = await paymentCollections.insertOne(payment)  
            const updatedDoc = {
                $set:{
                    
                    status:"sold",
                    advertise: false,
                    paid: true,

                    
                }

                
            }
           
        const updatedProducts = await allProduct.updateOne(filter,updatedDoc, option)
     
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






// pi_3M94OqK3PnW9JuEr0WSMhpWF :myTransactionId