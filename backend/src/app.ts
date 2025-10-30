require('dotenv').config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import passport from 'passport';
import getLogger from './utils/logger';

const MongoDBStore = connectMongoDBSession(session);

const app = express();

const logger = getLogger('app.ts');

//set up middleware
app.use(cors({ origin: ['http://localhost:5173', 'https://xbox-song-clerk-gloves.trycloudflare.com'], credentials: true, methods: ['GET', 'POST', 'DELETE','PUT'] }));
app.use(bodyParser.urlencoded({
   extended: true })); // read req body
app.use(bodyParser.json()); // parse JSON bodies
var store = new MongoDBStore( //setup to store the session in DB
    {
        uri: process.env.MONGODB_ATLAS as string,
        collection: process.env.MONGODB_SESSION as string
    }
);


//event listner to catch the error 
store.on('error', function (error) {
    // Also get an error here
    logger.error("There is err storing session: ", error);
});

app.set('trust proxy', 1); //allows express.js behind a reverse proxy to trust proxy server  
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'none', //to allow cross-site cookies
        secure: true, // secures the cookie
        maxAge: 1000 * 60 * 60 * 24 * 180 //180 days
    },
    store: store
}));

app.use(passport.initialize());
app.use(passport.session());

import User from './models/user';

// Configure Passport Local Strategy (provided by passport-local-mongoose)
passport.use(User.createStrategy());

// used to serialize the user for the session
passport.serializeUser(User.serializeUser() as any);

// used to deserialize the user
passport.deserializeUser(User.deserializeUser() as any);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Mount API routes
app.use('/api', routes);

export default app;