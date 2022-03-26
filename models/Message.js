const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
    },
    message: {
        type: String
    },
    timeStamp: {
        type: String
    },
    messageId: {
        type: String
    },
    messageType: {
        type: String,
        enum: ["TEXT", "POSTBACK"]
    }
})

const Message = mongoose.model('Message', messageSchema)
exports.Message = Message;