
const express = require("express");
const bp = require("body-parser");
const ejs = require("ejs");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const mongoose=require("mongoose");
const fs=require("fs")
const app = express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bp.urlencoded({extended:true}));
app.use(session({
    secret:"halamadrid",
    resave:false,
    saveUninitialized:false
}));



app.use(passport.initialize());
app.use(passport.session());

const alluvial=fs.readFileSync('public/text/alluvial.txt', "utf8",function(err,data){
  return data;
})
const alkaline=fs.readFileSync('public/text/alkaline.txt', "utf8",function(err,data){
  return data;
})
const red=fs.readFileSync('public/text/red.txt', "utf8",function(err,data){
  return data;
})
const black=fs.readFileSync('public/text/black.txt', "utf8",function(err,data){
  return data;
})
mongoose.connect("mongodb+srv://admin-prasanna:Test123@cluster0-k4uc4.mongodb.net/finaldb",{useNewUrlParser:true});
mongoose.set("useCreateIndex",true);
const Dataschema=new mongoose.Schema({
  state:String,
  district:String,
  land:String,
  cuktivation:String,
  profit:String,
  mobile:String,
  problem:String
});
const userschema=new mongoose.Schema({
  name:String,
    username:String,
    password:String,
    data:
    {
      type: Dataschema,
      ref: "Record"
    }
});

userschema.plugin(passportLocalMongoose);
const User=mongoose.model("User",userschema);
const Record=mongoose.model("Record",Dataschema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("login");
  });
// app.get("/",function(req,res){
//     if(req.isAuthenticated()){
//         res.render("submit")
//     }
//     else{
//         res.redirect("/login");
//     }
// })
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/signup",function(req,res){
    res.render("signup");
});
app.get("/home",function(req,res){
    if(req.isAuthenticated()){
        res.render("home")
    }
    else{
        res.redirect("/login");
    }
})
app.get("/help",function(req,res){
  if(req.isAuthenticated()){
      res.render("help")
  }
  else{
      res.redirect("/login");
  }
})
app.get("/contact",function(req,res){
  if(req.isAuthenticated()){
      res.render("contact")
  }
  else{
      res.redirect("/login");
  }
})
app.get("/soil",function(req,res){
  if(req.isAuthenticated()){
      res.render("soil")
  }
  else{
      res.redirect("/login");
  }
})
app.post("/soil",function(req,res){
  let type=req.body.soil
  console.log(type)
  if(type=="alluvial"){
res.render("soildata",{content:alluvial})
  }
  else if(type=="red"){
    res.render("soildata",{content:red})
  }
  else if(type=="black"){
res.render("soildata",{content:black})
  }
  else if(type=="alkaline"){
    res.render("soildata",{content:alkaline})

  }
});
app.post("/login",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err)
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/home");
            });
        }

    });
});
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/")
})
app.post("/signup",function(req,res){
  User.register({username:req.body.username,name:req.body.name},req.body.password,function(err,user){
      if(err){
          console.log(err)
          res.redirect("/signup")
      }
      else{
          passport.authenticate("local")(req,res,function(){
              res.redirect("/home");
          });
      }
  });
});









  app.get("/add",function(req,res){
    if(req.isAuthenticated()){
      res.render("add",{username:req.user.name})
  }
  else{
      res.redirect("/login");
  }
  });
  app.get("/view",function(req,res){
    if(req.isAuthenticated()){
      res.render("view",{username:req.user.name,dist:req.user.data.state,state:req.user.data.district,cultivation:req.user.data.cuktivation,
        land:req.user.data.land,income:req.user.data.profit,problems:req.user.data.problem,mno:req.user.data.mobile});
  }
  else{
      res.redirect("/login");
  }
  });
  app.get("/search",function(req,res){
    if(req.isAuthenticated()){
      res.render("search")
  }
  else{
      res.redirect("/login");
  }
  });

  app.post("/search",function(req,res){
    let uname=req.body.uname;
    User.find({name:uname},function(err,uname){
      if(err){
          console.log(err);
      }
      else{
          if(uname.length==0){
            res.render("searchn",{text:"NOT FOUND ENTER DIFFERENT NAME"})
          
          }
          else{
            console.log(uname.length)
            res.render("searchr",{uname:uname})
          }
      }
        
  });
});

  app.post("/add",function(req,res){
      let state=req.body.state;
      let dist=req.body.dist;
      let land=req.body.land;
      let cultiv=req.body.culti;
      let profit=req.body.profit;
      let mno=req.body.pno;
      let prob=req.body.problem;
      const rec=new Record({state:state,
        district:dist,
        land:land,
        cuktivation:cultiv,
        profit:profit,
        mobile:mno,
        problem:prob});

User.updateOne({_id:req.user._id},{data:rec},function(err){
     if(err){
        console.log(err);
     }
   else{
        res.redirect("/home");
  }
});

  })



  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
