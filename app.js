const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MLAB_URI = process.env.MLAB_URI;

mongoose.connect(MLAB_URI, { useMongoClient: true });

const urlSchema = mongoose.Schema({
  original: String,
  route: Number,
});
const Url = mongoose.model('Url', urlSchema);

app.get('/', (req, res) => {
  res.send('Feed me');
});

app.get('/https://:url', (req, res) => {
  if (req.params.url.match(/\w+\.\w+\.*\w*/)) {
    Url.findOne({ original: `https://${req.params.url}` }, (err, found) => {
      if (err) {
        res.redirect('/error');
        return console.log(err);
      }
      if (found) {
        const json = {
          original: found.original,
          route: `https://colin-fcc-url.herokuapp.com/${found.route.toString(36)}`,
        };
        res.json(json);
      }
      else {
        const newURL = {
          original: `https://${req.params.url}`,
        };
        Url.count({}, (err, count) => {
          if (err) {
            res.redirect('/error');
            return console.log(err);
          }
          newURL.route = count + 1;
          Url.create(newURL, (err, url) => {
            if (err) {
              res.redirect('/error');
              return console.log(err);
            }
            console.log(`${url.original} created`);
          });
          const json = {
            original: newURL.original,
            route: `https://colin-fcc-url.herokuapp.com/${newURL.route.toString(36)}`,
          };
          res.json(json);
        });
      }
    });
  }
  else {
    res.json({ error: true });
  }
});

app.get('/http://:url', (req, res) => {
  res.redirect(`/https://${req.params.url}`);
});

app.get('/error', (req, res) => {
  res.json({ error: true });
});

app.get("/:query", (req, res) => {
  console.log(`query is ${req.params.query}`);
  Url.findOne({ route: parseInt(req.params.query, 36) }, (err, url) => {
    if (err) {
      res.redirect('/error');
      return console.log(err);
    }
    if (url) {
      console.log(`redirecting to ${url.original}`);
      res.redirect(url.original);
    }
    else {
      console.log('could not find query');
      res.redirect('/error');
    }
  });
});

app.listen(process.env.PORT || 8080, () => console.log('Server open on 8080'));
