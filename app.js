var express = require("express"),
 	app = express(),
 	bodyParser = require("body-parser"),
 	mongoose = require("mongoose"),
 	Campground = require("./models/campground"),
 	seedDB = require("./seeds"),
 	Comment = require("./models/comment"),
 	passport = require("passport"),
 	LocalStrategy = require("passport-local"),
 	User = require("./models/user"),
 	methodOverride = require("method-override"),
 	flash = require("connect-flash")

// Router pages

var commentRoutes = require("./routes/comments"),
 	campgroundRoutes = require("./routes/campgrounds"),
 	indexRoutes = require("./routes/index"),
 	userRoutes = require("./routes/users")

// Mongo/Mongoose

// mongoose.connect("mongodb://localhost/yelp_camp")
mongoose.connect("mongodb://rossh.87:avogadro@ds243059.mlab.com:43059/yelp_camp");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// Passport config

app.use(require("express-session")({
	secret: "elves and deer",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MomentJS

app.locals.moment = require("moment");

// Views variables

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// Configure Router

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/users", userRoutes);

app.listen(3000, function(){
	console.log("listening on port 3000");
})