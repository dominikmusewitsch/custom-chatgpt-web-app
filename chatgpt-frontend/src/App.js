import React, { useEffect, useState, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Fetch full history on page load
  useEffect(() => {
    fetch("http://localhost:3001/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentInput = input; // sichern
    setInput(""); // 🔥 sofort leeren

    // Add user message immediately
    const newUserMessage = { role: "user", content: currentInput };
    setMessages((prev) => [...prev, newUserMessage]);

    const res = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: currentInput }),
    });

    const data = await res.json();

    const newAssistantMessage = {
      role: "assistant",
      content: data.reply,
    };
    setMessages((prev) => [...prev, newAssistantMessage]);
  };

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>My ChatGPT App</div>

      <div ref={chatRef} style={styles.chatWindow}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              ...(msg.role === "user"
                ? styles.userMessage
                : styles.assistantMessage),
            }}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    overflow: "hidden", // ❗ verhindert ganzseitiges Scrollen
  },

  header: {
    padding: "20px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "bold",
    borderBottom: "1px solid #ddd",
    background: "white",
  },

  chatWindow: {
    flex: 1, // ❗ nimmt den ganzen übrigbleibenden Platz ein
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#f5f5f5",
  },

  inputContainer: {
    display: "flex",
    gap: "10px",
    padding: "12px",
    background: "white",
    borderTop: "1px solid #ddd",
  },

  input: {
    flex: 1,
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
  },

  button: {
    padding: "12px 20px",
    fontSize: "16px",
    background: "#007aff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  message: {
    padding: "12px 16px",
    borderRadius: "12px",
    maxWidth: "80%", // mehr Breite!
    lineHeight: "1.4",
    fontSize: "16px",
  },

  userMessage: {
    background: "#007aff",
    color: "white",
    alignSelf: "flex-end",
  },

  assistantMessage: {
    background: "white",
    color: "#333",
    border: "1px solid #ddd",
    alignSelf: "flex-start",
  },
};

export default App;
