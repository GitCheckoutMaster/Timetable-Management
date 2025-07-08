import express from 'express';
import { createTask, getAllTasks } from '../controller/tasks.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const tasksRouter = express.Router();

// secure routes
tasksRouter.get('/getAllTasks', verifyJWT, getAllTasks);
tasksRouter.post('/createTask', verifyJWT, createTask);

export default tasksRouter;