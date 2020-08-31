const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
let shown=null;


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("Listed at Port 3000");
});
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true},{ useUnifiedTopology: true });

const userSchema= new mongoose.Schema({
    email: String,
    password: String
})

encKey="thislifeitstought";
userSchema.plugin(encrypt, { secret: encKey, encryptedFields: ['password'] });
const User=new mongoose.model("User", userSchema)


app.get("/", function(req,res){
    res.render("home")
})

app.get("/login", function(req,res){
    res.render("login")
})

app.get("/register", function(req,res){
    res.render("register")
})

app.post("/register", function(req,res){
    const newUser=new User({
        email:req.body.username,
        password:req.body.password
    })
    newUser.save(function(error){
        if(!error){
            res.render("secrets", {passsh:shown});
        }else{
            res.render(error);
        }
    })
})

app.post("/login", function(req,res){
    const user=req.body.username;
    const pass=req.body.password;
    User.findOne({email:user}, function(error, usersfounds){
        if(!error){
            if(usersfounds.password===pass){
                shown=pass;
                res.render("secrets", {passsh:shown})
            }shown=null;
        }else{
            console.log(error);
        }
    })
})