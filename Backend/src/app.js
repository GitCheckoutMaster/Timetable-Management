import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import multer from "multer";
import tasksRouter from "./routes/tasks.routes.js";
import sessionRouter from "./routes/session.routes.js";

const upload = multer();
const app = express();

// app.use((req, res, next) => {
//   console.log(`Incoming: ${req.method} ${req.originalUrl}`);
//   console.log("Cookies:", req.cookies);
//   next();
// });

app.use(cors({
    origin: 'http://localhost:5173',  // or wherever your frontend is
    credentials: true
}));
app.use(upload.none()); 
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/session", sessionRouter);

export default app;
