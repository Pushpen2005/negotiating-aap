import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.routes.js";

const app = express();
app.use(cors({
  origin: ["https://negotiating-aap.vercel.app"]
}));
app.use(express.json());
app.use("/api", aiRouter);

export default app;