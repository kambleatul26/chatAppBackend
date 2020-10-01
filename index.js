const express = require('express');
const app = express();
const mongoose = require('mongoose');
//IMPORT ROUTES
const authRoute = require('./routes/auth');
const socketRoute = require('./routes/socket');
const data = require("./data");

const server = app.listen(3000, () => console.log('Server Running'));
const io = require('socket.io').listen(server);
// const http = require('http').createServer(app);
// const io = require('socket.io')(http);

const Room = require('./models/Room');

const cors = require('cors')
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


io.on('connection', (socket) => {
    console.log('New Socket Connection!');  
    socket.on('sendMessage', sendMessage)
});


/*
    SEND MESSAGE FROM FRONTEND AS {message, roomId, sender, receiver}
*/
async function sendMessage(Msg) {
    Msg = JSON.parse(Msg);
    // console.log(Msg);
    io.emit(Msg.receiver, JSON.stringify(Msg));

    const messageObject = {
        timeStamp: Msg.timeStamp,
        message: Msg.message,
        sender: Msg.sender
    }

    try {
        await Room.updateOne({_id: Msg.roomId}, { $push: { chatTranscripts: messageObject }})
    } catch (error) {
        console.log(error);
    }
    // await Room.updateOne({_id: Msg.roomId}, { $push: { chatTranscripts: messageObject }}, (err, any) => {
    //     if(err) console.log(err);
    // });
}


// ONE SOCKET ID FOR EVERY CONNECTION & ROOM ONLY FOR DATABASE BACKUPS