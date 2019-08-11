//Server setup
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const { checkEmail } = require("./helpers");

//URL Database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//User Database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

//UserID generator
let generateRandomString = function() {
  let result = "";
  let alphaNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let alphaNumLength = alphaNum.length;
  for (let i = 0; i < 6; i++) {
    result += alphaNum.charAt(Math.floor(Math.random() * alphaNumLength));
  }
  return result;
};

//URLs for specific logged in user
const urlsForUser = function(id, objectToCheckIn) {
  const filteredURLs = {};
  for (let url in objectToCheckIn) {
    if (id === objectToCheckIn[url].userID) {
      filteredURLs[url] = objectToCheckIn[url];
    }
  }
  return filteredURLs;
};

app.use((req, res, next) => {
  req.user_id = req.session.user_id;
  req.user = users[req.user_id];
  next();
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.user };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.send("400 Bad Request");
  }
  if (checkEmail(req.body["email"], users)) {
    res.status(400);
    return res.send("E-mail address has already been registered");
  };

  let newUserID = generateRandomString();
  users[newUserID] = {
  id : newUserID,
  email : req.body["email"],
  password : bcrypt.hashSync(req.body["password"], 10)
  };
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (req.user) {
    let templateVars = { user: req.user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body["email"];
  let userPassword = req.body["password"];
  let existingUser = checkEmail(userEmail, users);
  if (!userEmail || !userPassword) {
    res.status(403).send("Error: Missing field");
  } else if (!existingUser) {
    res.status(403).send("Error: This email address hasn't been registered");
  } else if (!bcrypt.compareSync(userPassword, users[existingUser].password)) {
    res.status(403).send("Error: Incorrect password, please try again");
  } else {
    req.session.user_id = existingUser;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.user_id, urlDatabase), user: req.user
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  } else {
    res.redirect("/urls/");
  }
});

app.post("/urls", (req, res) => {
  let generatedShortID = generateRandomString();
  urlDatabase[generatedShortID] = { longURL: req.body["longURL"], userID: req.session.user_id };
  res.redirect("/urls/" + generatedShortID);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});