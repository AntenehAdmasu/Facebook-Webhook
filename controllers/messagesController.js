const request = require('request');

const { User } = require('../models/User');
const { Message } = require('../models/Message');
const responses = require('../utils/constants');

exports.handleMessage = async (senderPsid, receivedEvent) => {
    let messageType = receivedEvent.message ? "TEXT" : "POSTBACK";
    const message = {
        senderId: senderPsid,
        timestamp: receivedEvent.timestamp,
        messageId: messageType == "TEXT" ? receivedEvent.message.mid : receivedEvent.postback.mid,
        message: messageType == "TEXT" ? receivedEvent.message.text : receivedEvent.postback.payload,
        messageType: messageType
    }
    let response = await saveMessageAndGetResponse(receivedEvent, senderPsid, message);

    // Send response to the sender
    callSendAPI(senderPsid, response);
}

async function saveMessageAndGetResponse(receivedMessage, senderPsid, message) {

    const savedMessage = await Message.create(message);
    const user = await User.findOne({ userId: senderPsid });
    let response;

    if (!user) {
        await User.create({ userId: senderPsid, interactionStage: "GREET_AND_NAME" });
        await User.updateOne({ userId: senderPsid }, { $push: { messages: savedMessage._id } });
        // Greet the user and ask first name
        response = {
            "text": responses.GREET_AND_ASK_NAME
        };
    } else if (user.interactionStage == "GREET_AND_NAME") {
        const name = receivedMessage.message.text;
        await User.updateOne({ userId: senderPsid }, { $push: { messages: savedMessage._id }, $set: { interactionStage: "BIRTH_DATE_ASKED", name: name } });
        // ASK THE BIRTH DATE OF THE USER
        response = {
            "text": responses.ASK_BIRTH_DATE
        };
    } else if (user.interactionStage == "BIRTH_DATE_ASKED") {
        const birthDate = receivedMessage.message.text;
        await User.updateOne({ userId: senderPsid }, { $push: { messages: savedMessage._id }, $set: { interactionStage: "BIRTH_DATE_RECEIVED", birthDate: birthDate } });
        // ASK IF THE USER WANTS TO KNOW HOW MANY DAYS REMAIN BEFORE THE NEXT BIRTHDAY (with a postback)
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": responses.ASK_NEXT_BIRTHDAY,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "YES",
                            "payload": "YES"
                        },
                        {
                            "type": "postback",
                            "title": "NO",
                            "payload": "NO"
                        },
                    ]
                }
            }
        };
    } else if (user.interactionStage == "BIRTH_DATE_RECEIVED") {
        // Send good bye or calculate the number of remaining days
        if (receivedMessage.postback.payload == "YES") {
            const remainingDays = calculateRemainingDays(user.birthDate);
            response = {
                "text": remainingDays + responses.TELL_REMAINING_DAYS
            };

        } else {
            response = {
                "text": responses.GOOD_BYE + user.name
            };
        }
        await User.updateOne({ userId: senderPsid }, { $push: { messages: savedMessage._id }, $set: { interactionStage: "ENDED" } });
    } else if (user.interactionStage == "ENDED") {
        await User.updateOne({ userId: senderPsid }, { $push: { messages: savedMessage._id }, $set: { interactionStage: "GREET_AND_NAME" } });
        // Greet the user and ask first name
        response = {
            "text": responses.GREET_AND_ASK_NAME
        };
    }
    return response;

}

// Sends response messages
function callSendAPI(senderPsid, response) {

    // The page access token we have generated in your app settings
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    // Construct the message body
    let requestBody = {
        'recipient': {
            'id': senderPsid
        },
        'message': response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        'uri': `https://graph.facebook.com/v2.6/${process.env.PAGE_ID}/messages`,
        'qs': { 'access_token': PAGE_ACCESS_TOKEN },
        'method': 'POST',
        'json': requestBody
    }, (err, _res, _body) => {
        if (!err) {
            console.log('Message sent!');
        } else {
            console.error('Unable to send message:' + err);
        }
    });
}

function calculateRemainingDays(birthDate) {
    const birthdate = new Date(birthDate);
    const today = new Date();
    const birthDayThisYear = new Date(today.getFullYear() + birthdate.toString().slice(4));
    const birthDayNextYear = new Date((today.getFullYear() + 1) + birthdate.toString().slice(4));

    // Calculate from the next year's birthday if birthday passed already or from the coming birthday this year
    const calculateFrom = birthDayThisYear.getTime() > today.getTime() ? birthDayThisYear : birthDayNextYear;
    const remainingDays = Math.floor((calculateFrom.getTime() - today.getTime()) / (1000 * 3600 * 24));

    return remainingDays;
}
