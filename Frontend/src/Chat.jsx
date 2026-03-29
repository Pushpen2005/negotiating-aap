import { useState, useEffect, useRef } from "react";
import "./index.css";

export default function Chat() {
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
  const fakeLimit = useRef(0);
  const currentAsk = useRef(0);
  const lastUserPrice = useRef(null);
  const playerType = useRef("normal");

  const MAX_ROUNDS = 5;

  useEffect(() => {
    startNewGame();
  }, []);

  function startNewGame() {
    const OP = Math.floor(Math.random() * 9000) + 1000;
    const MP = Math.floor(OP * (0.5 + Math.random() * 0.05));
    const MEAN = Math.floor(OP * (0.6 + Math.random() * 0.1));

    originalPrice.current = OP;
    minPrice.current = MP;
    meanPrice.current = MEAN;

    fakeLimit.current = MP + Math.floor(Math.random() * 1500 + 500);
    currentAsk.current = OP;
    playerType.current = "normal";
    lastUserPrice.current = null;

    setRoundCount(0);
    setGameOver(false);
    setResult(null);

    setMessages([
      { text: "🎮 New Game Started!", type: "ai" },
      { text: `Price is ₹${OP}. Negotiate!`, type: "ai" },
    ]);
  }

  function getTitle(final, min, mean) {
    if (final <= min + 200) return "🧠 Master Negotiator";
    if (final <= mean) return "💼 Smart Buyer";
    if (final <= mean + 1000) return "🙂 Average";
    return "😏 AI Outplayed You";
  }

  function getBluffMessage() {
    const bluffs = [
      "I already have another buyer 😏",
      "This is my final range.",
      "Someone else is close to buying 👀",
    ];
    return bluffs[Math.floor(Math.random() * bluffs.length)];
  }

  function getBehaviorLabel(current, previous) {
    if (previous === null) return "";
    const diff = current - previous;

    if (diff === 0) return "repeat";
    if (diff > 0 && diff < 500) return "small_improve";
    if (diff >= 2000) return "big_jump";

    return "";
  }

  function getPersonality(round) {
    if (round <= 2) return "friendly";
    if (round <= 4) return "strategic";
    return "aggressive";
  }

  function saveScore(final, min) {
    const score = final - min;
    const prev = localStorage.getItem("bestScore");

    if (!prev || score < Number(prev)) {
      localStorage.setItem("bestScore", score);
    }
  }

  function sendMessage() {
    if (!input.trim() || gameOver) return;

    const userPrice = Number(input);
    const nextRound = roundcount + 1;
    const roundsLeft = MAX_ROUNDS - nextRound;

    setRoundCount(nextRound);
    setInput("");
    setIsThinking(true);

    setMessages((prev) => [
      ...prev,
      { text: input, type: "user" },
      { text: "AI is typing...", type: "ai", thinking: true },
    ]);

    setTimeout(async () => {
      let reply = "";
      const personality = getPersonality(nextRound);

      // 🧠 Player type detection
      if (userPrice < meanPrice.current * 0.7) {
        playerType.current = "aggressive";
      } else if (userPrice > currentAsk.current * 0.9) {
        playerType.current = "desperate";
      } else {
        playerType.current = "normal";
      }

      // 📉 Dynamic pricing
      let drop = Math.floor(Math.random() * 400 + 200);

      if (playerType.current === "aggressive") drop *= 0.5;
      if (playerType.current === "desperate") drop *= 1.2;

      currentAsk.current -= Math.floor(drop);
      if (currentAsk.current < minPrice.current) {
        currentAsk.current = minPrice.current;
      }

      // 🎯 Signals
      const distance = currentAsk.current - userPrice;
      let distanceLabel = "close";
      if (distance > 3000) distanceLabel = "far";
      else if (distance > 1000) distanceLabel = "medium";

      const behaviorLabel = getBehaviorLabel(
        userPrice,
        lastUserPrice.current
      );

      const fakeLimitTriggered =
        userPrice < fakeLimit.current && nextRound >= 3;

      let bluffTriggered = false;
      if (nextRound >= 3 && userPrice >= meanPrice.current) {
        bluffTriggered = Math.random() < 0.3;
      }

      let decision = "";
      if (userPrice < minPrice.current) decision = "REJECT";
      else if (userPrice >= currentAsk.current) decision = "ACCEPT";
      else decision = "NEGOTIATE";

      // 🎯 Deal state updates
      if (decision === "ACCEPT") {

        setResult({
          final: userPrice,
          original: originalPrice.current,
          min: minPrice.current,
        });

        saveScore(userPrice, minPrice.current);
        setGameOver(true);
      }

      // 🤖 AI reply generation
      try {
        const endpoints = [
          "https://negotiating-aap.onrender.com/api/ai-reply",
        ];

        let aiReply = "";

        for (const endpoint of endpoints) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              decision,
              personality,
              round: nextRound,
              distance: distanceLabel,
              behavior: behaviorLabel,
              playerType: playerType.current,
              fakeLimit: fakeLimitTriggered,
              isBluff: bluffTriggered,
            }),
          });

          if (!res.ok) continue;

          const data = await res.json();
          if (data?.reply) {
            aiReply = data.reply;
            break;
          }
        }

        reply = aiReply || "Hmm… something went wrong, try again.";
      } catch (err) {
        reply = "Hmm… something went wrong, try again.";
      }

      // 🏁 Game over
      if (nextRound >= MAX_ROUNDS && !gameOver) {
        setResult({
          final: lastUserPrice.current || currentAsk.current,
          original: originalPrice.current,
          min: minPrice.current,
        });
        saveScore(
          lastUserPrice.current || currentAsk.current,
          minPrice.current
        );

        setGameOver(true);
      }

      lastUserPrice.current = userPrice;

      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.thinking);
        return [...filtered, { text: reply, type: "ai" }];
      });

      setIsThinking(false);
    }, 1200);
  }

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

        <div className="status-bar">
          Rounds Left: {MAX_ROUNDS - roundcount}
        </div>

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
            <p>
              🏆 Best Score:{" "}
              {localStorage.getItem("bestScore") || "-"}
            </p>

            <button onClick={startNewGame}>
              Play Again 🔁
            </button>
          </div>
        )}

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