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
  res.redirect(testDB[0].original);
});

app.get("/https://:site", (req, res) => {
  res.send(req.params.site);
});

app.get("/:query", (req, res) => {
  console.log(req.params.query);
  if (req.params.query.match(/https?:\/\/\w+\.\w+\.*\w*/)) {
    testDB.push({
      original: req.params.query,
      route: nextRoute,
    });
    nextRoute = nextRoute + 1;
    res.json({
      original: req.params.query,
      short: `localhost:8080/${nextRoute - 1}`,
    });
  } else {
    let found = testDB.filter((obj) => {
      return obj.route === Number(req.params.query);
    });
    if (found.length === 1) {
      res.redirect(found[0].original);
    } else {
      res.json({
        error: true,
      });
    }
  }
});

app.listen(8080, () => console.log('Server open on 8080'));
