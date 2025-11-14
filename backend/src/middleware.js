import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

export default app;
