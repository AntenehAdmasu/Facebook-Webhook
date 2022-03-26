const handleMessage = require('./messagesController').handleMessage;

exports.verifyToken = async (req, res) => {

    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode exist in the query string
    if (mode && token) {

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with challenge sent
            return res.status(200).send(challenge);
        } else {
            // Return forbidden if verify token 
            return res.sendStatus(403);
        }
    }
    res.status(400).send("unknown error")
}

exports.processRequest = async (req, res) => {

    const saveReq = new Log({ requestType: "post", requestBody: JSON.stringify(req.body) });
    await saveReq.save();
    let body = req.body;

    // Checks if the event is from a page subscription
    if (body.object === 'page') {

        body.entry.forEach(function (entry) {

            const webhookEvent = entry.messaging[0];
            let senderPsid = webhookEvent.sender.id;
            handleMessage(senderPsid, webhookEvent);
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.status(400).send("Bad request");
    }
}