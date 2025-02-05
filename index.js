import express from "express";
import axios from "axios";

const app = express();
const TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

app.use(express.json());

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
