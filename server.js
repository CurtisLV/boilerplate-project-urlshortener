require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const shortid = require('shortid');
const validUrl = require('valid-url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Mongoose stuff

const Schema = mongoose.Schema;

const urlSchema = new Schema({
    urlFull: { type: String, required: true },
    urlShort: String,
});

const Url = mongoose.model('URL', urlSchema);

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
    let reqUrl = req.body.url;
    let shortUrl = shortid.generate();

    if (!validUrl.isWebUri(reqUrl)) {
        res.json({ error: 'invalid url' });
    } else {
        let random = new Url({
            urlFull: reqUrl,
            urlShort: shortUrl,
        });
        random.save();
        res.json({ original_url: reqUrl, short_url: shortUrl });
    }
});

app.get('/api/shorturl/:urlID?', (req, res) => {
    let urlID = req.params.urlID;
    Url.findOne({ urlShort: urlID }, (err, urlFound) => {
        if (!urlFound) {
            res.json({ error: 'invalid url' });
        }
        res.redirect(urlFound.urlFull);
    });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
