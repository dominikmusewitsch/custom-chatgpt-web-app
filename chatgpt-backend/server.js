import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

dotenv.config();
const app = express();
const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-5-mini", // oder gpt-5-nano, je nach Aufgabe
  temperature: 0.7,
  disableStreaming: true, // wie im Handout erwähnt
});

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant. Remember the context of the conversation.",
  ],
  ["human", "{input}"],
]);

const chain = chatPrompt.pipe(chatModel);

app.use(cors());
app.use(express.json());

// Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 1) User message in DB speichern
    db.run(`INSERT INTO messages (role, content) VALUES (?, ?)`, [
      "user",
      message,
    ]);

    // 2) Alle bisherigen Nachrichten aus DB holen
    const history = await new Promise((resolve, reject) => {
      db.all(
        `SELECT role, content FROM messages ORDER BY created_at ASC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // 3) Verlauf als Text zusammenbauen (einfach & prüfungssicher)
    const conversation = history
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // 4) LangChain Chain ausführen
    const response = await chain.invoke({
      input: `${conversation}\nuser: ${message}`,
    });

    const reply = response.content;

    // 5) Assistant-Response speichern
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

app.get("/api/messages", (req, res) => {
  db.all(`SELECT * FROM messages ORDER BY created_at ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
