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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
      return true;
    }
  }
  return false;
};

app.get("/urls", (req, res) => { 
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars); //get request
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"]
  res.redirect("/urls/" + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
   const shortURL = req.params.shortURL;
   const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body["username"]);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body["username"]);
  res.redirect("/urls")
});

app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"]};
  res.render("urls_register", templateVars)
});

//Passing the user Object to the _header

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.send('400 Bad Request');
  }
  if (checkEmail(req.body.email, users)) {
    res.status(400);
    return res.send('Email already registered');
  }
  let newUserID = generateRandomString();
  users[newUserID] = {};
  users[newUserID].id = newUserID;
  users[newUserID].email = req.body["email"];
  users[newUserID].password = req.body["password"];
  res.cookie('user_id', newUserID);
  // console.log(users);
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
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});