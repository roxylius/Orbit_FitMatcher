import 'dotenv/config';

import express from 'express';
import app from './app';
import mongoose from 'mongoose';

const server = express();
const port = process.env.PORT || 3001;
const DB: any = process.env.MONGODB_ATLAS;  //Auth database link

//connect to mongo database
mongoose.connect(DB)
    .then(async () => {
        console.log("Successfully connected to database!!");
    })
    .catch((err) => { console.log(err) });

// Mount the app
server.use(app);

// Start the server
server.listen(port, () => console.log("The server is listening on port: ", port, '....'));
