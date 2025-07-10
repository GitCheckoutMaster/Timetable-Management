import express from 'express';
import { createTask, deleteTask, getAllTasks, sendEmail, updateTask } from '../controller/tasks.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const tasksRouter = express.Router();

// secure routes
tasksRouter.get('/getAllTasks', verifyJWT, getAllTasks);
tasksRouter.post('/createTask', verifyJWT, createTask);
tasksRouter.post('/updateTask/:taskId', verifyJWT, updateTask);
tasksRouter.delete('/deleteTask/:taskId', deleteTask);
tasksRouter.post('/sendEmail', verifyJWT, sendEmail);

export default tasksRouter;