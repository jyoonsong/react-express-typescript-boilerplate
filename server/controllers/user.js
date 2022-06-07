const User = require("../models/User");

// create a new OAuth client used to verify google sign-in
require('dotenv').config();

const colors = [
  "#e9ecef", // gray 
  "#eebefa", // grape 
  "#d0bfff", // violet 
  "#bac8ff", // indigo
  "#d0ebff", // sky 
  "#ffd8a8", // orange
]

// gets user from DB, or makes a new account if it doesn't exist yet
const getUser = async (user_id) => {
  // the "sub" field means "subject", which is a unique identifier for each user
  const existingUser =  await User.findOne({ id: user_id });
  return existingUser;
}

const login = async (req, res) => {
  try {
    const user = await getUser(req.body.id);

    if (user) {
      req.session.user = user;
      user.active = true;
      await user.save();
      res.status(200).send(user);
    }
    else {
      res.status(404).send({err: "No such user"});
    }

  } catch (err) {
    console.log(`Failed to log in: ${err}`);
    res.status(401).send({ err });
  };
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

module.exports = {
  login,
  populateCurrentUser,
};
