require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
let shown = null;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("Listed at Port 3000");
});

app.use(
  session({
    secret: process.env.ENCKEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.set("useUnifiedTopology", true);
mongoose.set("useCreateIndex", true);
mongoose.connect(
  "mongodb://localhost:27017/userDB",
  { useNewUrlParser: true },
  { useUnifiedTopology: true }
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets", { passsh: shown });
  } else {
    res.redirect("/login");
  }
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
    shown = req.body.password;
  User.register({ username: req.body.username }, req.body.password, function (err,user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.render("secrets", { passsh: shown });
      });
    }
    shown = null;
  });
});

app.post("/login", function (req, res) {

    const user= new User({
        username:req.body.username,
        password:req.body.password
    })

    req.login(user, function(error){
        if(error){
            console.log(error);
        }else{
            passport.authenticate("local")(req, res, function () {
                res.render("secrets", { passsh: shown });
              });
        }
    })

});
