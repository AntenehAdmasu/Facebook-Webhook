require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const verificationRoutes = require('./routes/verificationRoutes');
const userDataRoutes = require('./routes/userDataRoutes');
// Database connection
mongoose.connect(process.env.APP_DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: false })
    .then(() => console.log('Connected to MongoDB'))

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 3000));

app.get('/', (req, res) => {
    res.status(200).send({ success: "true", message: "Welcome to the messenger hook" })
});

app.use(verificationRoutes);
app.use(userDataRoutes);

// listen for requests :)
app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + app.get('port'));
});
