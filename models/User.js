const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  birthDate: {
    type: String
  },
  name: {
    type: String
  },
  messages: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: 'Message'
  },
  interactionStage: {
    type: String,
    enum: ["GREET_AND_NAME", "BIRTH_DATE_ASKED", "BIRTH_DATE_RECEIVED", "ENDED"],
    default: "INITIAL"
  }
})

const User = mongoose.model('User', userSchema)
exports.User = User;