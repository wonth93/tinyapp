// Find email
const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return undefined;
};

// Generate a random shrt URL ID
const generateRandomString = function() {
  let result = '';
  const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwayz0123456789';
  for (let i = 0; i < 6; i++) {
    result += alph.charAt(Math.floor(Math.random() * alph.length));
  }
  return result;
};

// Find ID
const getID = function(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return null;
};

// Find short URL ID
const findShortURL = function(id, database) {
  for (const key in database) {
    if (key === id) {
      return true;
    }
  }
  return null;
};

// Find user's URL
const urlsForUser = function(id, database) {
  const listOfURLs = {};
  for (const key in database) {
    if (database[key]["userID"] === id) {
      listOfURLs[key] = database[key]["longURL"];
    }
  }
  return listOfURLs;
};

// Find matching user
const matchingUser = function(user, id, database) {
  if (database[id]["userID"] === user) {
    return true;
  }
  return false;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  getID,
  findShortURL,
  urlsForUser,
  matchingUser
};