import express from "express";
import axios from "axios";

const app = express();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Set your verify token

app.use(express.json());

app.get("/webhooks", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge); // ✅ Send back hub.challenge
  } else {
    res.status(403).send("Forbidden");
  }
});

// Webhook для Instagram
app.post("/webhook", async (req, res) => {
  if (req.body.entry) {
    const message =
      req.body.entry[0].messaging[0]?.message?.text ||
      "Новое сообщение в Instagram!";

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

app.listen(3000, () => console.log("Server is running"));
