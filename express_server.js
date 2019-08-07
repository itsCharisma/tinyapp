const express = require("express"); // requiring the express modules
const app = express();
const PORT = 8080; // broadcasting on port 8080

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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});