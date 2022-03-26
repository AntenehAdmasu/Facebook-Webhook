const { User } = require('../models/User');
const { Message } = require('../models/Message');

exports.getAllMessages = async (req, res) => {
    const messages = await Message.find({});
    return res.status(200).send(messages);
}

exports.getMessageById = async (req, res) => {
    const id = req.params.id;

    const message = await Message.find({ _id: id });
    if (!message) {
        return res.status(404).send(`Message with id ${id} not found`);
    }
    return res.status(200).send(message);
}

exports.getSummary = async (req, res) => {
    const userSummary = await User.find({}).populate("messages");
    return res.status(200).send(userSummary);
}