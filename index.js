/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
require("dotenv").config();

const bodyParser = require("body-parser");
const express = require("express");
const { default: axios } = require("axios");
const expressXHub = require("express-x-hub");

const app = express();
app.set("port", process.env.PORT || 5000);
app.listen(app.get("port"));

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(expressXHub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

const token = process.env.VERIFY_TOKEN || "token"; // Set your verify token

const received_updates = [];

app.get("/webhooks", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});
// https://webhook-seven-chi.vercel.app/webhooks/instagram?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=almale198WrNT$-RTHY
app.get(
  ["/webhooks/facebook", "/webhooks/instagram", "/webhooks/threads"],
  function (req, res) {
    if (
      req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === token
    ) {
      res.send(req.query["hub.challenge"]);
    } else {
      res.sendStatus(400);
    }
  }
);

app.post("/webhooks/facebook", function (req, res) {
  if (!req.headers["x-hub-signature-256"]) {
    console.log("❌ Missing X-Hub-Signature-256 header");
    return res.sendStatus(401);
  }

  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post("/webhooks/instagram", async function (req, res) {
  if (req.body.entry) {
    const message =
      req.body.entry[0].messaging[0]?.message?.text ||
      "Новое сообщение в Instagram!";

    req.body.entry.forEach((entry) => {
      entry.changes.forEach(async (change) => {
        if (change.field === "comments") {
          console.log("📝 Новый комментарий:", change.value);
          await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              chat_id: TELEGRAM_CHAT_ID,
              text: `📩 Новое сообщение в Instagram: ${change.value}`,
            }
          );
        }
      });
    });

    // Отправка в Telegram
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: `📩 Новое сообщение в Instagram: ${message}`,
      }
    );
  }

  res.sendStatus(200);
});

app.post("/webhooks/threads", function (req, res) {
  console.log("Threads request body:");
  console.log(req.body);
  // Process the Threads updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen();
