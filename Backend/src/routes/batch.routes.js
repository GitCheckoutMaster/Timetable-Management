import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { addBatch, deleteBatch, getAllBatches } from '../controller/batch.controller.js';

const batchRouter = express.Router();

// secured routes
batchRouter.delete('/deleteBatch/:batchCode', verifyJWT, deleteBatch);
batchRouter.post('/addBatch', verifyJWT, addBatch);
batchRouter.get('/getAllBatches', verifyJWT, getAllBatches);

export default batchRouter;