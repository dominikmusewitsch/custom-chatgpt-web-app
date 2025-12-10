import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import OpenAI from "openai";

dotenv.config();
const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// 1) Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // User message speichern
    db.run(`INSERT INTO messages (role, content) VALUES (?, ?)`, [
      "user",
      message,
    ]);

    // ChatGPT API call
    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;

    // Assistant Response speichern
    db.run(`INSERT INTO messages (role, content) VALUES (?, ?)`, [
      "assistant",
      reply,
    ]);

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});

// 2) Conversation History Endpoint
app.get("/api/messages", (req, res) => {
  db.all(`SELECT * FROM messages ORDER BY created_at ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(rows);
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
