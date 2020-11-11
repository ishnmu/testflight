const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const puppeteer = require('puppeteer');

const GooglePlay = require('./googlePlay');

const app = express();

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
})();

const playConsole = GooglePlay({
    username: process.env["BETA_SERVICE_ADMIN_EMAIL"],
    password: process.env["BETA_SERVICE_ADMIN_PASSWORD"],
});
(async () => {
    await playConsole.login();
})();


app.get("cug/users/ios", (req, response) => {
    const privateKey = process.env["BETA_SERVICE_IOS_PRIVATE_KEY"];
const apiKeyId = process.env["BETA_SERVICE_IOS_API_KEY"];
const issuerId = process.env["BETA_SERVICE_IOS_ISSUER_ID"];
let now = Math.round(new Date().getTime() / 1000);
let nowPlus1minute = now + 60; // 1 minute

let payload = {
  iss: issuerId,
  exp: nowPlus1minute,
  aud: "appstoreconnect-v1",
};

let signOptions = {
  algorithm: "ES256",
  header: {
    alg: "ES256",
    kid: apiKeyId,
    typ: "JWT",
  },
};

    let token = jwt.sign(payload, privateKey, signOptions);
    
  axios.get(
    "https://api.appstoreconnect.apple.com/v1/betaTesters?filter[betaGroups]=ab00d148-7b06-4ecb-a73c-30189b8a3807&fields[betaTesters]=email",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ).then((res) =>  {
    const userEmails = res.data.data.map((entry) => entry.attributes.email);
    fs.writeFileSync('entries-ios.txt', JSON.stringify(userEmails, null, 2));
    response.send("users writtern to file");
  });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
