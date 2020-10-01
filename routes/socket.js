const router = require('express').Router();
const auth = require('./jwt');
const Room = require('../models/Room');
const User = require('../models/User');

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


function findRoom(rooms, personId, myId){
    for (var i=0; i < rooms.length; i++) {
        if (rooms[i].members.includes(personId) && rooms[i].members.includes(myId)) {
            return rooms[i].chatTranscripts;
        }
    }
    return [];
}

router.get('/syncMessages', auth.verifyToken, async (req, res) => {
    let users = await User.find();
    let rooms = await Room.find({ "members": { "$all": [req._id]} });
    
    let usersToReturn = [];
    users.forEach(u => {
        let tmp = {};
        tmp._id = u._id;
        tmp.name = u.name;
        tmp.isManager = u.isManager;
        tmp.messages = findRoom(rooms, u.id, req._id);
        if(tmp._id != req._id) {
            usersToReturn.push(tmp);
        }
    });
    // console.log(usersToReturn);

    res.status(200).send({users: usersToReturn});
});


router.post('/createRoom', auth.verifyToken, async (req, res) => {
    const roomExists = await Room.find({ "members": { "$all": [req._id, req.body.receiverId]} });
    console.log(roomExists)
    console.log(roomExists.length)
    if(!roomExists || roomExists.length == 0) {
        const room = new Room({
            members: [req._id, req.body.receiverId],
            chatTranscript: []
        });

        try {
            const savedRoom = await room.save();
            console.log(savedRoom);
            res.status(200).send({message:'Success! Room created'})
        } catch (error) {
            res.status(400).send({message:error})
        }
    } else {
        res.status(200).send({message:'Room exists!'})
    }
});


io.on('connection', (socket) => {
    console.log('New Socket Connection!');
  
  //   io.use(middleWares.verifyToken());
  
    socket.on('startChat', createRoom);
  
    // DO THIS ON FRONT END
  //   socket.join(roomId);
  //   socket.on('chatMessage', () => {
  //     console.log(Msg);
  //   });
  
    socket.on('sendMessage', sendMessage)
});


/*
    SEND MESSAGE FROM FRONTEND AS {message, roomId, sender, receiver}
*/
async function sendMessage(Msg) {
    console.log(Msg);
    io.to(Msg.sender).emit(Msg);

    const messageObject = {
        timeStamp: new Date(),
        message: Msg.message,
        sender: Msg.sender
    }

    await Room.updateOne({_id: roomId}, { $push: { chatTranscripts: messageObject }}, (err, any) => {
        if(err) console.log(err);
    });
}

module.exports = router;