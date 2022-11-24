const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
require('dotenv').config();

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
        const appointmentOptionCollection = client.db('bytecodeVelocity').collection('appointmentOption');
        const bookingsCollection = client.db('bytecodeVelocity').collection('bookings')
        const usersCollection = client.db('doctorsPortal').collection('users')


        // read all data
        app.get('/appointmentOption', async(req, res) => {
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();
            const bookingQuery = {appointmentDate: date}
            const alreadyBooked =  await bookingsCollection.find(bookingQuery).toArray();
           options.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookedSlots = optionBooked.map(book => book.slot);
                const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
                option.slots= remainingSlots;
                console.log(date, option.name, remainingSlots.length)
            });
            res.send(options);
           })


       
        // jwt
           app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email}
            console.log(email);
            const user = await usersCollection.findOne(query);
            console.log(user)
            res.send({accessToken: 'token'});
        })


    
        // create new data
        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            console.log(booking)
            const result = bookingsCollection.insertOne(booking);
            res.send(result);
        })


        app.get('/bookings', async(req, res) => {
            const query = {}
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })




        
         // get data 
       app.post('/bookings', async (req, res) => {
        const booking = req.body;
        console.log(booking)
        const query = {
            appointmentDate: booking.appointmentDate,
            treatment: booking.treatment
        }
        const alreadyBooked = await bookingsCollection.find(query).toArray();
        if(alreadyBooked.length){
            const message = `you already booked${booking.appointmentDate}`
            return res.send({acknowledged: false, message})
        }
        const result = await bookingsCollection.insertOne(booking);
        res.send(result)
       })


       //get data form users
       app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
       })


    }finally{

    }
}
run().catch(console.log)



app.get('/',async (req, res) => {
    res.send('byteCode velocity');
})


app.listen(port, () => console.log(`byteCode velocity is running ${port}`))



// "npm-start-dev": "nodemon index.js",
// require('crypto').randomBytes(64).toString('hex')