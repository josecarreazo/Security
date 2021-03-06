require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate= require("mongoose-findorcreate");
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
    secret: process.env.CLIENT_SECRET,
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
  googleId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

  app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });

app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets", { passsh: shown });
  } else {
    res.render("login");
  }

});

app.get("/logout", function (req, res) {
  req.logout()
  res.redirect("/");
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
