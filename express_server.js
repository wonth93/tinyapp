const express = require("express");
const app = express();
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const PORT = 8080;
const bcrypt = require("bcryptjs");

const {
  getUserByEmail,
  generateRandomString,
  getID,
  findShortURL,
  urlsForUser,
  matchingUser
} = require('./helper');

// Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  maxAge: 10 * 60 * 1000 // 10 mins
}));


// Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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


// Root page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Home page for tiny app
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userEmail = users[userID];
  const filterList = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: filterList, userEmail};
  
  if (!userID) {
    return res.status(403).send("Please login!");
  }
  
  res.render('urls_index', templateVars);
});

// add new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const userEmail = users[userID];
  const templateVars = { userEmail };

  if (userEmail) {
    return res.render("urls_new", templateVars);
  }
  
  res.redirect("/login");
});

// Post back on the home page
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const id = generateRandomString();
  const URL = req.body.longURL;
  urlDatabase[id] = { longURL: URL, userID };

  if (user) {
    return res.redirect(`/urls/${id}`);
  }
  
  res.status(403).send("Please login before you create new tiny URLs!");
});

// URL info with short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const userEmail = users[userID];
  const filterList = urlsForUser(userID, urlDatabase);
  const templateVars = { id, longURL: filterList[id], userEmail };
  const matchingID = findShortURL(id, urlDatabase);
  const matchuser = matchingUser(userID, id, urlDatabase);

  if (!matchingID) {
    return res.status(400).send("Short URL ID does not exist!");
  } else if (!matchuser) {
    return res.status(403).send("This is not your short URL ID!");
  }
  
  res.render("urls_show", templateVars);
});

// Edit URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const URL = req.body.longURL;
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("Please login before you create new tiny URLs!");
  } else if (!id) {
    return res.status(400).send("The ID does not exist!");
  } else if (userID !== urlDatabase[id]["userID"]) {
    return res.status(403).send("Cannot edit ID that is not yours!");
  }

  urlDatabase[id]["longURL"] = URL;
  res.redirect(`/urls/${id}`);
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];
  
  if (!user) {
    return res.status(403).send("Please login before you delete!");
  } else if (!id) {
    return res.status(400).send("The ID does not exist!");
  } else if (userID !== urlDatabase[id]["userID"]) {
    return res.status(403).send("Cannot delete ID that is not yours!");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Direct to the URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]["longURL"];
  res.redirect(longURL);
});

// Register account
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const userEmail = users[userID];
  const templateVars = { userEmail };

  if (!userID) {
    return res.render("urls_registration", templateVars);
  }

  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Please enter your email or password!");
  }

  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("User email is already existed!");
  }
  
  users[userID] = {
    id: userID,
    email,
    password: hashedPassword
  };
  
  // res.cookie("user_id", userID);
  req.session.user_id = userID;
  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const userEmail = users[userID];
  const templateVars = { userEmail };

  if (!userID) {
    return res.render("urls_login", templateVars);
  }
  
  res.redirect("/urls");
});

// Login endpoint
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const userID = getID(email, users);
  
  if (!user) {
    return res.status(403).send("Account is not found!");
  } else if (email === user.email && !bcrypt.compareSync(password, users[userID]["password"])) {
    return res.status(403).send("Password is not correct!");
  }

  
  req.session.user_id = userID;
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("User is not logged in");
  }
  req.session = null;
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