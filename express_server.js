const express = require("express"); // requiring the express modules
const app = express();
const PORT = 8080; // broadcasting on port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs"); //templating engine


const generateRandomString = function() {
  const alphaNumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	const stringLength = 6;
	let randomString = '';
	for (let i = 0; i < stringLength; i++) {
		let randomNum = Math.floor(Math.random() * alphaNumeric.length);
		randomString += alphaNumeric.substring(randomNum, randomNum + 1);
  }
  return randomString;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


const users = { 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
};

const checkEmail = function (emailCheck, objCheck) {
  for (let userID in objCheck) {
    if (emailCheck === objCheck[userID]["email"]) {
      return objCheck[userID];
    }
  }
  return false;
};

const urlsForUser = function (id, objectToCheckIn) {
  const filteredURLs = {};
  for (let url in objectToCheckIn) {
    if (id === objectToCheckIn[url].userID) {
      filteredURLs[url] = objectToCheckIn[url];
    }
  }
  return filteredURLs;
};

app.use((req, res, next) => {
  req.user_id = req.cookies["user_id"]
  req.user = users[req.user_id]
  next()
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.user_id, urlDatabase), user: req.user
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let generatedShortID = generateRandomString();
  urlDatabase[generatedShortID] = { longURL: req.body["longURL"], userID: req.cookies["user_id"] };
  res.redirect('/urls/' + generatedShortID);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.user_id) {
    delete urlDatabase[req.params.shortURL]
    res.redirect('/urls/');
  }
  else {
    res.redirect('/urls/');
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.send('400 Bad Request');
  }
  let user = checkEmail(req.body["email"], users)
  if (user && bcrypt.compareSync(req.body["password"], user.password)) {
    //console.log("password")
    //console.log(user.password)
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  } else {
    let templateVars = { user: undefined };
    res.render("urls_login", templateVars);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.user };
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.send('400 Bad Request');
  }
  if (checkEmail(req.body["email"], users)) {
    return res.status(400).send('email address has already been registered');
  }
  let newUserID = generateRandomString();
  users[newUserID] = {};
  users[newUserID].id = newUserID;
  users[newUserID].email = req.body["email"];
  users[newUserID].password = bcrypt.hashSync(req.body["password"], 10);
  res.cookie('user_id', newUserID);
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { user: req.user };
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.user
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});











