import express from 'express';
import { getAllTrainers, getTaskByUserId, login, logout, register, resetPassword, sendEmailForPasswordReset } from '../controller/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get("/logout", logout);
userRouter.post('/reset-password-request', sendEmailForPasswordReset);
userRouter.post('/reset-password', resetPassword);

// secured routes
userRouter.get('/getAllTrainers', verifyJWT, getAllTrainers);
userRouter.get('/getTaskById/:userId', verifyJWT, getTaskByUserId);

export default userRouter;