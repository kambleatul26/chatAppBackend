const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
//IMPORT ROUTES
const authRoute = require('./routes/auth');
const socketRoute = require('./routes/socket');
const data = require("./data");

app.use(cors())

const CONNECTION_URL = data.cloudDBurl;

// CONN DB
mongoose.connect(
    CONNECTION_URL,
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useCreateIndex: true 
    }, () => {
        console.log('CONNECTED TO DB');
    }
);

// MIDDLEWARE
app.use(express.json());

// ROUTE MIDDLEWARE
app.use('/api/auth', authRoute);
app.use('/api/chat', socketRoute);

app.get('/',(req,res) =>
{
    res.status(200).send({ message: "Server Connected" });
});

app.listen(3000, () => console.log('Server Running'));



// ONE SOCKET ID FOR EVERY CONNECTION & ROOM ONLY FOR DATABASE BACKUPS