import { useState, useEffect, useRef } from "react";
import "./index.css";

export default function Chat() {
  const [currprice, setCurrPrice] = useState(1000);
  const [roundcount, setRoundCount] = useState(0);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);

  const chatRef = useRef(null);
  const originalPrice = useRef(0);
  const minPrice = useRef(0);
  const meanPrice = useRef(0);

  const MAX_ROUNDS = 5;

  // 🎮 INIT GAME
  useEffect(() => {
    startNewGame();
  }, []);
function getBluffMessage() {
  const bluffs = [
    "I already have another buyer at a similar price 😏",
    "Honestly, I'm going below my comfort zone here...",
    "This is almost my final offer.",
    "Someone else is interested at this range 👀",
  ];

  return bluffs[Math.floor(Math.random() * bluffs.length)];
}
  function startNewGame() {
    const OP = Math.floor(Math.random() * 9000) + 1000;
    const MP = Math.floor(OP * (0.5 + Math.random() * 0.05));
    const MEAN = Math.floor(OP * (0.6 + Math.random() * 0.1));

    originalPrice.current = OP;
    minPrice.current = MP;
    meanPrice.current = MEAN;

    setCurrPrice(OP);
    setRoundCount(0);
    setGameOver(false);
    setResult(null);

    setMessages([
      { text: "🎮 New Game Started!", type: "ai" },
      { text: `Price is ₹${OP}. Negotiate!`, type: "ai" },
    ]);
  }

  // 🧠 PERFORMANCE TITLE
  function getTitle(final, min, mean) {
    if (final <= min + 200) return "🧠 Master Negotiator";
    if (final <= mean) return "💼 Smart Buyer";
    if (final <= mean + 1000) return "🙂 Average";
    return "😏 AI Outplayed You";
  }

  // 📩 SEND MESSAGE
  function sendMessage() {
    if (!input.trim() || gameOver) return;

    const userInput = input;
    const userPrice = Number(userInput);

    const nextRound = roundcount + 1;
    const roundsLeft = MAX_ROUNDS - nextRound;

    setRoundCount(nextRound);
    setInput("");
    setIsThinking(true);

    setMessages((prev) => [
      ...prev,
      { text: userInput, type: "user" },
      { text: "AI is typing...", type: "ai", thinking: true },
    ]);

    setTimeout(() => {
      let reply = "";
// 🎭 BLUFF SYSTEM (STEP C.1)
const isLateRound = nextRound >= 3;
const isClose = userPrice >= meanPrice.current;

if (isLateRound && isClose) {
  const bluffChance = Math.random();

  if (bluffChance < 0.3) {
    reply += "\n" + getBluffMessage();
  }
}
      // 🎯 DEAL LOGIC
      if (userPrice < minPrice.current) {
        reply = "Way too low ❌ Not even close.";
      } else if (userPrice >= currprice) {
        reply = "Deal! 🤝";

        setResult({
          final: userPrice,
          original: originalPrice.current,
          min: minPrice.current,
        });

        setGameOver(true);
      } else {
        const distance = currprice - userPrice;

        if (distance > 3000) {
          reply = "Still far… try better 🟡";
        } else if (distance > 1000) {
          reply = "Hmm… getting closer 🤔";
        } else {
          reply = "Now we’re talking… very close 🟢";
        }
      }

      // ⚠️ PRESSURE
      if (!gameOver) {
        if (roundsLeft === 2) {
          reply += "\n⚠️ Only 2 rounds remaining…";
        } else if (roundsLeft === 1) {
          reply += "\n🚨 Final round. Make it count!";
        }
      }

      // 🏁 GAME OVER (LOSE)
      if (nextRound >= MAX_ROUNDS && !gameOver) {
        reply += "\n💀 Game Over!";

        setResult({
          final: currprice,
          original: originalPrice.current,
          min: minPrice.current,
        });

        setGameOver(true);
      }

      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.thinking);
        return [...filtered, { text: reply, type: "ai" }];
      });

      setIsThinking(false);
    }, 1200);
  }

  // 📜 AUTO SCROLL
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="wrapper">
      <div className="chat-container">
        <div className="header">AI Negotiation Game</div>

        {/* 🔥 STATUS */}
        <div className="status-bar">
          Rounds Left: {MAX_ROUNDS - roundcount}
        </div>

        {/* 💬 CHAT */}
        <div className="chat" ref={chatRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.type === "user" ? "user" : "ai"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* 🎉 RESULT */}
        {gameOver && result && (
          <div className="result-screen">
            <h2>🎉 Deal Complete</h2>
            <h3>
              {getTitle(
                result.final,
                result.min,
                meanPrice.current
              )}
            </h3>
            <p>Original Price: ₹{result.original}</p>
            <p>Your Deal: ₹{result.final}</p>
            <p>Minimum Possible: ₹{result.min}</p>
            <p>You overpaid by ₹{result.final - result.min}</p>

            <button onClick={startNewGame}>
              Play Again 🔁
            </button>
          </div>
        )}

        {/* ⌨️ INPUT */}
        <div className="input-area">
          <input
            type="text"
            placeholder="Enter your price"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking || gameOver}
          />
          <button onClick={sendMessage} disabled={isThinking || gameOver}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}