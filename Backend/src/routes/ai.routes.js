import { getAIReply } from "../controllers/ai.controller.js";
import { Router } from "express";

const aiRouter = Router();

aiRouter.post("/ai-reply", getAIReply);



export default aiRouter;