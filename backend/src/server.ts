require('dotenv').config();

import express from 'express';
import app from './app';

const server = express();
const port = process.env.PORT || 3001;

// Mount the app
server.use(app);

// Start the server
server.listen(port, () => console.log("The server is listening on port: ", port, '....'));
