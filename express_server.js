const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080;

// Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Database
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

// Generate a random shrt URL ID
const generateRandomString = function () {
  let result = '';
  const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwayz0123456789';
  for (let i = 0; i < 6; i++) {
    result += alph.charAt(Math.floor(Math.random() * alph.length));
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
};

// Find short URL ID
const findShortURL = function (id) {
  for (const key in urlDatabase) {
    if (key === id) {
      return true;
    }
  }
  return null;
}

// Find user's URL
const urlsForUser = function (id) {
  const listOfURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      listOfURLs[key] = urlDatabase[key]["longURL"];
    }
  }
  return listOfURLs;
}

// Find matching user
const matchingUser = function (user, id) {
  if (urlDatabase[id]["userID"] === user) {
    return true;
  }
  return false;
}


// Root page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Home page for tiny app
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const filterList = urlsForUser(userID);
  const templateVars = { urls: filterList, userEmail};
  
  if (!userID) {
    return res.status(403).send("Please login!")
  }
  
  res.render('urls_index', templateVars);
});

// add new URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const templateVars = { userEmail };

  if(userEmail) {
    return res.render("urls_new", templateVars);
  }
  
  res.redirect("/login");
});

// Post back on the home page
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
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
  const id = req.params.id
  const userID = req.cookies["user_id"];
  const userEmail = users[userID];
  const filterList = urlsForUser(userID);
  const templateVars = { id, longURL: filterList[id], userEmail };
  const matchingID = findShortURL(id);
  const matchuser = matchingUser (userID, id);

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
  const userID = req.cookies["user_id"];
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
  const userID = req.cookies["user_id"];
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
  const userID = req.cookies["user_id"];
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