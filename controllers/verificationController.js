const handleMessage = require('./messagesController').handleMessage;

exports.verifyToken = async (req, res) => {

    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    let hubMode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let hubChallenge = req.query['hub.challenge'];

    // Checks if a token and mode exist in the query string
    if (hubMode && token) {

        if (hubMode === 'subscribe' && token === VERIFY_TOKEN) {
            // Respond with challenge sent
            return res.status(200).send(hubChallenge);
        } else {
            // Return forbidden if verify token failes
            return res.sendStatus(403);
        }
    }
    res.status(400).send("unknown error")
}

exports.processRequest = async (req, res) => {

    let { body } = req;

    // Checks if the event is from a page subscription
    if (body.object === 'page') {

        body.entry.forEach(function (entry) {

            const webhookEvent = entry.messaging[0];
            let senderPsid = webhookEvent.sender.id;
            handleMessage(senderPsid, webhookEvent);
        });
        res.status(200).send('Message received');
    } else {
        res.status(400).send("Bad request");
    }
}