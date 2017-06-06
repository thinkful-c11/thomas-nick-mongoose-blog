const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');


const app = express();
app.use(bodyParser.json());



app.get('/posts', (req, res) => {
  BlogPost
  .find()
  .exec()
  .then (posts => {
    res.json({
      blogPosts: posts.map(
        (post) => post.apiRepr())
    });
  })
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'internal server error'});
    });
});

app.get('/posts/:id', (req, res) => {
  BlogPost
  .findById(req.params.id)
  .exec()
  .then(post => res.json(post.apiRepr()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'})
  });
});

app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
  .create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author})
    .then(
      post => res.status(201).json(post.apiRepr()))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: `Internal server error`});
      });
});


















// Server Stuff
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
