//jshint esversion:6

// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const _ = require('lodash');

const app = express();
const mongoose = require("mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const port = 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Use body-parser middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));
  
// Set up Passport
app.use(passport.initialize());
app.use(passport.session());

  
mongoose.connect('mongodb://localhost:27017/usersDB');

const userSchema = new mongoose.Schema ({
    username: String,
    password: String,  
    googleId: String, 
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
// Serialization: Store user information in the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Assuming user has an 'id' property
});

// Deserialization: Retrieve user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        // Retrieve the user from the database using the 'id'
        const user = await User.findOne({ _id: id });

        // If user is found, pass the user object to the next middleware
        if (user) {
            done(null, user);
        } else {
            done(new Error('User not found'), null);
        }
    } catch (error) {
        done(error, null);
    }
});


////////////////////////// GOOGLE STRATEGY I.E. SIGN IN VIA GOOGLE DETAILS
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// routes
////////////////////////// HOME ROUTE
app.get('/', (req, res) => {
    res.render('home');
});

////////////////////////// PATH FOR SIGN IN WITH GOOGLE
app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile'] })
    // (req, res, function(){
    //     res.redirect('/secrets'); 
    // })
);

////////////////////////// LANDING PAGE AFTER SING IN WITH GOOGLE
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


////////////////////////// SECRETS PAGE
app.get('/secrets', async (req, res) => {
    try{
        if(req.isAuthenticated()){
                const usersWithSecrets = await User.find({secret: {$ne: null}}); 
                if(usersWithSecrets) {
                    console.log(usersWithSecrets)
                    res.render('secrets', {usersWithSecrets: usersWithSecrets});
                } else {
                    res.render('secrets');
                }
            } else {
                res.redirect('/register');
            }
            
    } catch (err) {
        console.log(err);
    }
    
});

//////////////////////////  NEW REGISTRATION 
app.route('/register') 
    .get((req, res) => {
        res.render('register');
    })

    .post(async (req, res)=> {
        User.register({username: req.body.username}, req.body.password, function(err, user) {
            if (err) {
                 console.log(err);
                 res.redirect('/register');
            } else {
                passport.authenticate('local')(req, res, function(){
                    res.redirect('/secrets'); 
                })
            }
        });
    })
    
////////////////////////// LOG IN 
app.route('/login') 
    .get((req, res) => {
        res.render('login');
    })

    .post(async (req, res)=> {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function(err){
            if(err){
                console.log(err)
                res.redirect('/login');
            } else {
                passport.authenticate('local', {
                    failureRedirect: '/login' // Redirect to /login on authentication failure
                })(req, res, function(){
                    res.redirect('/secrets'); 
                })
            }
        })
    })

////////////////////////// LOG OUT 
app.get('/logout', (req, res) => {
    req.logout((err) => { // logout() in passport now takes call-back
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

////////////////////////// SUBMIT [ A SECRET ]
app.route('/submit')
    .get(function(req, res){
        if(req.isAuthenticated()){
            res.render('submit');
        } else {
            res.redirect('/login');
        }
    })

    .post(async (req, res)=>{
        try{
            const   SECRET = req.body.secret; 
            const foundUser = await User.findById(req.user.id);
            if(foundUser){
                foundUser.secret = SECRET;
                await foundUser.save(); 
                res.redirect('/secrets')
            } else {
                res.redirect('/login')
            }
            
        } catch (err) {
            console.log(err);
        }
    })


////////////////////////// PORT LISTENING
app.listen(port, () => {
    console.log(`Server is running on A SECRET port ${port}`);
});

