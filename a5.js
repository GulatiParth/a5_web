const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;

const handlebars = require("express-handlebars");

app.engine(".hbs", handlebars.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");
const { exec } = require('child_process');

app.use(express.static("images"));
app.use(express.static("css"));


const db1 = mongoose.createConnection("mongodb+srv://Parth:Pgulati9@senecaweb.vxp7lzq.mongodb.net/db1?retryWrites=true&w=majority");

const users_schema = new mongoose.Schema({
    "first_name": String,
    "last_name": String,
    "email": {
        "type" : String,
        "unique": true
    },
    "username" : {
        "type" : String,
        "unique": true
    },
    "phone" : String,
    "password" : String,
    "street" : String,
    "addInfo" : String,
    "zip" : String,
    "place" : String,
    "country" : String,
    "UserType" : {
        "type" : String,
        "default": "C"                       // "C" --> Customer ,,, "A" --> Admin
    }
});

const article_schema = new mongoose.Schema({
    "Title" : String,
    "Created_date": String,
    "Content": String,
    "Image_Name" : String,
});

const users = db1.model("users", users_schema);
const article = db1.model("article", article_schema);


app.get("/Blog", function(req, res) {
    res.render("blog", {layout: false });
});

app.get('/', function(req, res) {
    res.render("blog", {layout: false });
});

app.get("/article", function(req, res) {
    article.findOne({article_id: "1A"}).exec()
    .then((data)=>{
        res.render("read_more", {data:data,layout: false });    
    });
});


app.get("/registration", function(req, res) {
    res.render("registration", {layout: false });
});
app.post("/registration", function(req, res) {
    var obj = {
        data:{
            firstname : req.body.firstName,
            lastname : req.body.lastName,
            email : req.body.email,
            username : req.body.username,
            password : req.body.password,
            confirmPassword : req.body.confirmPassword,
            phone : req.body.phone,
            street : req.body.street,
            addInfo : req.body.addInfo,
            zip : req.body.zip,
            place : req.body.place,
            country : req.body.country
        },
        errorMsg:{
            firstname : "",
            firstNameChar : "",
            lastName : "",
            lastnameChar : "",
            password : "",
            passwordLength : "",
            phone : "",
            confirmPassword : ""
        }
    };
    // valid input
    if(obj.data.firstname && obj.data.lastname && obj.data.password){
        let new_user = new users({
            "first_name": obj.data.firstname,
            "last_name": obj.data.lastname,
            "email": obj.data.email,
            "username" : obj.data.username,
            "phone" : obj.data.phone,
            "password" : obj.data.password,
            "street" : obj.data.street,
            "addInfo" : obj.data.addInfo,
            "zip" : obj.data.zip,
            "place" : obj.data.place,
            "country" : obj.data.country,
        });

        new_user.save();
        res.render("dashboard", {valid : obj ,layout: false });
    }
    else{  
        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

        if(!obj.data.firstname){  // invalid firstname
             obj.errorMsg.firstname ="Please enter a First name";
    
        }
        if(format.test(obj.data.firstname)){      // invalid username with special characters
            obj.errorMsg.firstNameChar = "Firstname cannot contain special characters"
    
        }
        if(!obj.data.lastname){  // invalid lastname
            obj.errorMsg.lastName="Please enter a Last name";
    
        }
        if(format.test(obj.data.lastname)){      // invalid username with special characters
            obj.errorMsg.lastnameChar = "Lastname cannot contain special characters"
    
        } 
        if(!obj.data.password){             // invalid password
            obj.errorMsg.password ="Please enter a Password";
    
        }        
        if(obj.data.password.length < 6 || obj.data.password.length > 12){ // invalid password 
            obj.errorMsg.passwordLength ="Please enter a password between 6 and 12 characters";
    
        }
        if (obj.data.phone.length != 10){
            obj.errorMsg.phone ="Phone number must be at least 10 characters long";
    
        }
        if (obj.data.password != obj.data.confirmPassword){
            obj.errorMsg.confirmPassword ="Password must match with confirmation";
    
        }
        res.render("registration", { sentData : obj, layout: "main" });
    }  
});

app.get("/login", function(req, res) {    
    res.render("login", {layout: false });       
});

app.post("/login", function(req, res) {
    var obj = {
        data:{
            username : req.body.username,
            password : req.body.password,
        },
        errorMsg:{
            Errorusername : "",
            ErrorusernameChar : "",
            Errorpassword :"" 
        }
    };

    if(obj.data.username && obj.data.password){
        users.find({username:obj.data.username, password:obj.data.password},["UserTypes"])
        .exec()
        .then((returnData) =>{
            if (returnData.UserType == "A"){
                console.log(returnData);
                res.render("admindashboard", {valid : obj , layout: false });
            }
            else if(returnData.UserType == "C"){
                console.log(returnData);
                res.render("dashboard", { valid : obj , layout: false });
            }
            else{
                var err = "Sorry, you entered the wrong username and/or password";
                res.render("login", { errMsg : err , layout: false });
            }
        });
    }
    else{  
        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

        if(!obj.data.username){  // invalid username
            obj.errorMsg.Errorusername ="Please enter a username";
        }
        else if(format.test(obj.data.username)){      // invalid username with special characters
            obj.errorMsg.ErrorusernameChar = "Username cannot contain special characters"
        } 
        else if(!obj.data.password){             // invalid password
            obj.errorMsg.Errorpassword ="Please enter a password";
        } 
        res.render("login", { sentData : obj, layout: "main" });       
    }  
});

function validation(req,res,next){
    if(req.sessionObj.users.UserType == "A")
        next();
    else
        res.redirect("/admindashboard");
}

app.get("/admindashboard", validation,function(req, res){
    users.find().exec().then((data)=>{
        res.render("/admindashboard",{data:data,layout:false});
    });
});
        
app.post('/admindashboard', validation, function(req, res){
    var obj = {
        data:{
            Title : req.body.Title,
            Created_date : req.body.Created_date,
            Content : req.body.Content,
            Image_Name : req.body.Image_Name
        }
    };
    
        let new_article = new article({
            "Title" : req.body.Title,
            "Created_date" : req.body.Created_date,
            "Content" : req.body.Content,
            "Image_Name" : req.body.Image_Name
        });

        new_user.save();
        res.render("admindashboard", {valid : obj ,layout: false });    
});

app.listen(port);