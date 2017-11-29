const express = require('express');
const app = express();

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
  res.send('feed me');
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
    })
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
    })
  }
});

app.get("/populate", (req, res) => {
  for (let i = 0; i < 100; i++) {
    testDB.push({
      original: "https://www.google.com",
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
    res.redirect(found[0].original);
  } else {
    res.json({
      error: true,
    });
  }
});

app.listen(8080, () => console.log('Server open on 8080'));
