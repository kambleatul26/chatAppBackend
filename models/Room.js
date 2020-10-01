const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    timeStamp: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const roomSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            min: 3,
            max: 255,
        }
    ],
    chatTranscripts: {
        type: [messageSchema],
        required: true
    }
});

module.exports = mongoose.model('Room', roomSchema);