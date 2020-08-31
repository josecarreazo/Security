require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
let shown = null;
const saltRounds = 10;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("Listed at Port 3000");
});
mongoose.set("useUnifiedTopology", true);
mongoose.connect(
  "mongodb://localhost:27017/userDB",
  { useNewUrlParser: true },
  { useUnifiedTopology: true }
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
    }
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    newUser.save(function (error) {
      if (!error) {
        res.render("secrets", { passsh: shown });
      } else {
        res.render(error);
      }
    });
  });
});

app.post("/login", function (req, res) {
  const user = req.body.username;
  const pass = req.body.password;
  User.findOne({ email: user }, function (error, usersfounds) {
    if (!error) {
      if (usersfounds) {
        bcrypt.compare(pass, usersfounds.password, function (err, result) {
          if (result === true) {
            shown = pass;
            res.render("secrets", { passsh: shown });
          }
        });
      }
      shown = null;
    } else {
      console.log(error);
    }
  });
});
