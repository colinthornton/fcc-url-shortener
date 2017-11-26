const express = require('express');
const app = express();

const testDB = [
  {
    original: "https://www.google.com",
    route: 0,
  },
  {
    original: "https://www.reddit.com",
    route: 1,
  },
  {
    original: "https://www.freecodecamp.org",
    route: 2,
  },
];
let nextRoute = 3;

app.get("/", (req, res) => {
  res.send("Feed me");
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
    res.json({
      error: true,
    });
  }
});

app.listen(8080, () => console.log('Server open on 8080'));
