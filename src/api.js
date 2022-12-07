import express, { Router } from 'express';
import serverless from 'serverless-http';


const app = express();

const router = Router();

router.get('/', (req, res) => {
  
 // res.json( {
 //   statusCode: 200,
 //   body: { "hello" : "de lu" } 
 // }); 
  
  res.json(  { "hello" : "de lu" } );
  
});

app.use('/.netlify/functions/api', router);


export const handler = serverless(app);
