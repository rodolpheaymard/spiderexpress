import express, { Router } from 'express';
import serverless from 'serverless-http';
const router = require('./router');


const app = express();


app.use('/.netlify/functions/api', router);


export const handler = serverless(app);
