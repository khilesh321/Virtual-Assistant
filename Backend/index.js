import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
import userRouter from "./routes/user.routes.js";
import geminiResponse from "./gemini.js";

const app = express();

const port = process.env.PORT || 8000;

app.use(cors({
  origin: 'https://virtual-assistant-frontend-7rsy.onrender.com',
  credentials: true
}))
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth/', authRouter);
app.use('/api/user/', userRouter);

app.listen(port, () => {
  connectDb();
  console.log(`Server Started! on port : ${port}`);
})
