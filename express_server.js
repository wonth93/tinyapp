const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080;

// Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Generate a random shrt URL ID
function generateRandomString() {
  let result = '';
  const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwayz0123456789'
  for (let i = 0; i < 6; i++) {
    result += alph.charAt(Math.floor(Math.random() * alph.length))
  }
  return result;
};

// Find email
const getUserByEmail = function (email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
}


// Root page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Home page for tiny app
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const templateVars = { urls: urlDatabase, userEmail};
  res.render('urls_index', templateVars);
});

// add new URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const templateVars = { userEmail };
  res.render("urls_new", templateVars);
});

// Post back on the home page
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const URL = req.body.longURL;
  urlDatabase[id] = URL;
  res.redirect(`/urls/${id}`);
});

// URL info with short URL
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], userEmail };
  res.render("urls_show", templateVars);
});

// Edit URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const URL = req.body.longURL;
  urlDatabase[id] = URL;
  res.redirect(`/urls/${id}`);
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Direct to the URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

// Register account
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], userEmail };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter your email or password!");
  }

  const user = getUserByEmail(email);
  if (user) {
    return res.status(400).send("User email is already existed!");
  } 
  
  users[userID] = {
    id: userID,
    email,
    password
  };
  
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], userEmail };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  if (!user) {
    return res.status(403).send("Account is not found!");
  } else if (email === user.email && password !== user.password) {
    return res.status(403).send("Password is not correct!");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


// listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Practice
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});