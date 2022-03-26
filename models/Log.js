const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
  requestType: {
    type: String,
  },
  requestBody: {
    type: String,
  }
})

const Log = mongoose.model('Log', LogSchema)

exports.Log = Log