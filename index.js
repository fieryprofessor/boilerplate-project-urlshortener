require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory database for URLs
const urlDatabase = {};
let counter = 1;

// API to shorten URLs
app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  // Validate URL format using the URL constructor
  try {
    let urlObject = new URL(originalUrl);

    // Ensure the protocol is either HTTP or HTTPS
    if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(urlObject.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      let shortUrl = counter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({ original_url: originalUrl, short_url: shortUrl });
    });

  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// API to redirect short URLs
app.get('/api/shorturl/:shortid', (req, res) => {
  let shortUrl = req.params.shortid;
  let originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
