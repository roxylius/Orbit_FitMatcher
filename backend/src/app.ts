require('dotenv').config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';

const app = express();

//set up middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:7501'], credentials: true, methods: ['GET', 'POST', 'DELETE','PUT'] }));
app.use(bodyParser.urlencoded({ extended: true })); // read req body
app.use(bodyParser.json()); // parse JSON bodies

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Mount API routes
app.use('/api', routes);

export default app;