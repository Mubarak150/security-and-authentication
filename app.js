//jshint esversion:6

// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const encrypt = require('mongoose-encryption');

const app = express();
const mongoose = require("mongoose");
const port = 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Use body-parser middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/usersDB');

const userSchema = new mongoose.Schema ({
    username: {
        type: String, 
        required: true
    },
    password: {
        type: String, 
        required: true
    }
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

// routes
app.get('/', (req, res) => {
    res.render('home');
});

app.route('/login') 
    .get((req, res) => {
        res.render('login');
    })

    .post(async (req, res)=> {
        try{

            const email = req.body.username; 
            const userKey = req.body.password; 


            const foundUser = await User.findOne({
                username: email
            });
            
            if(foundUser.matchedCount === 0 || foundUser.matchedCount == ""){
                console.log('no match found, better register');
                res.redirect('/login');
            } else {
                if(foundUser.password === userKey){ // replaceOne.modifiedCount === 0
                    res.render('secrets');
                }
            }
            
            
        } catch(err) {
            console.log(err);
            res.redirect("/login");
        }
    })


app.route('/register') 
    .get((req, res) => {
        res.render('register');
    })

    .post(async (req, res)=> {
        try{
            const newUser = new User({
                username: req.body.username,
                password: req.body.password
            });
            await newUser.save(); 
            res.render('secrets');
        } catch(err) {
            console.log(err);
            res.redirect("/register");
        }
    })

app.listen(port, () => {
    console.log(`Server is running on A SECRET port ${port}`);
});

