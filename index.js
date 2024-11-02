require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const {
  promises: { lookup },
} = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let originalUrls = [];

app.post("/api/shorturl", async (req, res) => {
  const originalUrl = req.body.url;

  try {
    await lookup(new URL(originalUrl).hostname);
    originalUrls.push(originalUrl);
    res.json({ short_url: originalUrls.length, original_url: originalUrl });
  } catch (error) {
    console.log(error);
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:shorturlindex", async (req, res) => {
  const shortUrlIndex = req.params.shorturlindex;

  const originalUrl = originalUrls[shortUrlIndex - 1];

  if (originalUrl == undefined) {
    res.json({ error: "No short URL found for the given input" });
    return;
  }

  res.redirect(originalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
