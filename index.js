require('dotenv').config();
const { pg_enqueue, pool } = require('./models/pgconnection');

const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const mongoose = require('mongoose');
const Bin = require('./models/bin_mongoose');
const Request = require('./models/request_mongoose');
const { v4: uuidv4 } = require('uuid');
const { validUrl } = require('./utils/valid_url');
const PORT = process.env.PORT;

// Server initialization
const http = require("http");
const { Server } = require("socket.io");
const httpServer = http.createServer(app); 
const io = new Server(httpServer, {cors: { origin: "*"}});
app.io = io;

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
});

// Connect to MongoDB database
const url = process.env.MONGODB_URI;
console.log('connecting to', url);
mongoose.connect(url)
  .then(() => console.log('connected to MongoDB'))
  .catch((error) => console.log('error connecting to MongoDB:', error.message));

// Middleware
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post('/new', async (req, res) => {
  let newURL = uuidv4();

  try {
    // save to Postgres
    await pool.query(
      `INSERT INTO bin (bin_url) VALUES ($1)`, [newURL]
    );
    
    // save to MongoDB
    const bin = new Bin({ binURL: newURL });
    await bin.save();
    res.send(newURL);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'DB action failed' });
  }
});

app.all('/w/*', async (req, res) => {
  const pathKey = req.path.slice(3); // remove '/w/' from path
  if (!validUrl(req.path)) {
    res.status(200).send({message: 'invalid url'})
    return;
  }

  const request = new Request({
    requestType: req.method,
    path: pathKey,
    params: req.params,
    query: req.query,
    headers: req.rawHeaders,
    body: req.body
  });

  try {
    
    let bin = await Bin.findOne({ binURL: pathKey });

    if (bin === null) {
      res.status(404).send({ error: 'Bin URL not found' });
      return;
    } else {
      const savedRequest = await request.save();
      bin.requests = bin.requests.concat(savedRequest.id);
      await bin.save();
  
      console.log("Current bin:", bin);
      console.log("Saved request:", savedRequest);
      console.log("request", request)
      console.log("request body", request.body)
      let last25Requests = await Request.find().sort({ _id: -1 }).limit(25)
      req.app.io.emit('newRequest', last25Requests);
    }
  } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'MongoDB action failed' });
  }
  //INSERT DATA INTO POSTGRES

  try {
    // enqueue the request
    const headersObj = req.headers;
    request.headers = headersObj;
    pg_enqueue(pathKey, request);
  } catch (error) {
    console.error('Error enqueuing pg query ', error);
  }

  res.status(200).send({ message: "success" })
});

// Fetch last 25 requests regardless of bin URL
app.get('/requests', async (req, res) => {
  try {
    let requests = await Request.find().sort({ _id: -1 }).limit(25)
    res.status(200).send(requests);
  } catch (error){
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'MongoDB action failed' });
  }
});

// Fetch request data by bin for last 10 requests
app.get('/bins/:binURL', async (req, res) => {
  const binURL = req.params.binURL;


  // Fetch requests from MongoDB
  let bin = await Bin.findOne({ binURL: binURL }).populate('requests');
  if (bin == null) {
    res.status(404).send({ error: 'bin URL not found'})
  } else {
    const request_data = bin.requests.slice(Math.max(bin.requests.length - 10, 0));
    res.send(request_data);
  }
});
  

httpServer.listen(PORT, () => console.log(`running on port: ${PORT}`));