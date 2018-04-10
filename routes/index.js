var express = require("express"),
	router = express.Router(), 
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	passport = require("passport"),
	User = require("../models/user")


// Root route
router.get("/", function(req, res){
	res.render("landing");
});

// Signup logic
router.get("/register", function(req, res){
	res.render("register", {page: 'register'});
});

router.post("/register", function(req, res) {
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		avatar: req.body.avatar,
		email: req.body.email,
		adminCode: req.body.adminCode
	});
	if (req.body.adminCode === "test123"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("register");
		}
		passport.authenticate("local")(req, res, function() {
			if (user.isAdmin){
				req.flash("success", `Take the helm, oh Captain my Captain!`)
			} else {
				req.flash("success", `Welcome to YelpCamp, ${user.username}!`);
			}
			res.redirect("/campgrounds");
		});
	});
});

// Login
router.get("/login", function(req, res){
	res.render("login", {page: 'login'});
})

router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
});

// logout route

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Successfully logged you out");
	res.redirect("/campgrounds");
})

module.exports = router;