import express from "express";
import { verifyJWT } from '../middleware/auth.middleware.js';
import { createSession, getSessionById, getSessions, updateSessionById } from "../controller/session.controller.js";

const sessionRouter = express.Router();

sessionRouter.post('/createSession', verifyJWT, createSession);
sessionRouter.post('/updateSession/:sessionId', verifyJWT, updateSessionById);
sessionRouter.get('/getAllSessions', verifyJWT, getSessions);
sessionRouter.get('/getSessionById/:taskId', verifyJWT, getSessionById);

export default sessionRouter;