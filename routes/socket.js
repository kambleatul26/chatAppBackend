const router = require('express').Router();
const auth = require('./jwt');
const Room = require('../models/Room');
const User = require('../models/User');

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
    
    // console.log(rooms);
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
    const roomExists = await Room.findOne({ "members": { "$all": [req._id, req.body.receiverId]} });
    if(!roomExists || roomExists.length == 0) {
        const room = new Room({
            members: [req._id, req.body.receiverId],
            chatTranscript: []
        });

        try {
            const savedRoom = await room.save();
            // console.log(savedRoom);
            res.status(200).json({message:'Success! Room created', roomId: savedRoom._id})
        } catch (error) {
            res.status(400).send({message:error})
        }
    } else {
        res.status(200).json({message:'Room exists!', roomId: roomExists._id})
    }
});

module.exports = router;