const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MLAB_URI = 'mongodb://localhost:27017/urls';

mongoose.connect(MLAB_URI, { useMongoClient: true });

const urlSchema = mongoose.Schema({
  original: String,
  route: Number,
});
const Url = mongoose.model('Url', urlSchema);

const testDB = [
  {
    original: "https://www.google.com",
    route: 1,
  },
  {
    original: "https://www.reddit.com",
    route: 2,
  },
  {
    original: "https://www.freecodecamp.org",
    route: 3,
  },
];
let nextRoute = 4;

app.get("/", (req, res) => {
  res.send(MLAB_URI);
});

app.get("/https://:url", (req, res) => {
  console.log(req.params.url);
  if (req.params.url.match(/\w+\.\w+\.*\w*/)) {
    testDB.push({
      original: `https://${req.params.url}`,
      route: nextRoute,
    });
    nextRoute = nextRoute + 1;
    res.json({
      original: `https://${req.params.url}`,
      short: `localhost:8080/${(nextRoute - 1).toString(36)}`,
    });
  } else {
    res.json({
      error: true,
    });
  }
});

app.get("/http://:url", (req, res) => {
  console.log(req.params.url);
  if (req.params.url.match(/\w+\.\w+\.*\w*/)) {
    testDB.push({
      original: `http://${req.params.url}`,
      route: nextRoute,
    });
    nextRoute = nextRoute + 1;
    res.json({
      original: `http://${req.params.url}`,
      short: `localhost:8080/${(nextRoute - 1).toString(36)}`,
    });
  } else {
    res.json({
      error: true,
    });
  }
});

app.get("/mongoose/https://:url", (req, res) => {
  if (req.params.url.match(/\w+\.\w+\.*\w*/)) {
    Url.find({ original: `https://${req.params.url}` }, (err, found) => {
      if (found.length === 1) {
        const json = {
          original: found[0].original,
          route: `localhost:8080/${found[0].route.toString(36)}`,
        };
        res.json(json);
      } else {
        const newURL = {
          original: `https://${req.params.url}`,
        };
        Url.count({}, (err, count) => {
          if (err) {
            return console.log(err);
          }
          newURL.route = count + 1;
          Url.create(newURL, (err, url) => {
            if (err) {
              return console.log(err);
            }
            console.log(`${url.original} created`);
          });
          const json = {
            original: newURL.original,
            route: `localhost:8080/${newURL.route.toString(36)}`,
          };
          res.json(json);
        });
      }
    });
  } else {
    res.json({ error: true });
  }
});

app.get("/populate", (req, res) => {
  for (let i = 0; i < 100; i++) {
    testDB.push({
      original: `https://www.go${'o'.repeat(i)}gle.com`,
      route: nextRoute,
    });
    nextRoute++;
  }
  res.send(`testDB is ${testDB.length} entries long.`);
});

app.get("/:query", (req, res) => {
  console.log(req.params.query);
  const found = testDB.filter((obj) => {
    return obj.route === parseInt(req.params.query, 36);
  });
  if (found.length === 1) {
    console.log(`redirecting to ${found[0].original}`);
    res.redirect(found[0].original);
  } else {
    res.json({
      error: true,
    });
  }
});

app.listen(8080, () => console.log('Server open on 8080'));
