import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.routes.js";

const app = express();

// ✅ Fix CORS properly
const corsOptions = {
  origin: "https://negotiating-aap.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

app.use(cors(corsOptions));

// ✅ THIS LINE IS THE REAL FIX 🔥
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api", aiRouter);

export default app;