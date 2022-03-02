require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login", {
    errorMessage: "",
  });
});

app.get("/register", function(req, res) {
  res.render("register");
});

// For BRAND NEW users
app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(e){
    if(!e){
      res.render("secrets");
    }else{
      console.log(e);
    }
  });
});

// For EXISTING user login
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(e, foundUser){
    if(e){
      console.log(e);
    }else{
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        }else{
          res.render("login", {errorMessage: "Email or password is incorrect"})
        }
      }else{
        res.render("login", {errorMessage: "Username is not valid"})
      }
    }

  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
})
