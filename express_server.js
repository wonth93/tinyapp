const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Set ejs as the view engine
app.set("view engine", "ejs");
// Getting ready for POST requests
app.use(express.urlencoded({ extended: true }));

// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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





// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Send data to ejs template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});

// URL submission form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Add a second route to display a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Access to the longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});





// POST longURL and id back to the /urls page
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const URL = req.body.longURL;
  urlDatabase[id] = URL;
  res.redirect(`/urls/${id}`);
});

// Delete URLs
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});









// listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});