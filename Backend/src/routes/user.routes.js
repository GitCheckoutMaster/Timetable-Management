import express from 'express';
import { getAllTrainers, getTaskByUserId, login, logout, register } from '../controller/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get("/logout", logout);

// secured routes
userRouter.get('/getAllTrainers', verifyJWT, getAllTrainers);
userRouter.get('/getTaskById/:userId', verifyJWT, getTaskByUserId);

export default userRouter;