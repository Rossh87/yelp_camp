var express = require("express"),
	router = express.Router(), 
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	passport = require("passport"),
	User = require("../models/user")

// Index--show all users

router.get("/", function(req, res){
	User.find({}, function(err, allUsers){
		if(err){
			console.error(err);
			req.flash("error", "Database unavailable, or invalid selection");
			return res.redirect("/campgrounds");
		}
		res.render("users/index", {allUsers: allUsers});
	});
});

// New & create handled by register.js

// Show: router.get("root/user._id")

router.get("/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err || !foundUser){
			req.flash("error", "Database unavailable or invalid selection");
			return res.redirect("/campgrounds");
		} 
		Campground.find().where("author.id").equals(foundUser._id).exec(function(err, foundCampgrounds){
			if(err){
			req.flash("error", "Database unavailable or invalid selection");
			return res.redirect("/campgrounds");
			}
			res.render("users/show", {user: foundUser, campgrounds: foundCampgrounds});
		})
	});
});

// Update router.put("root/user._id")

//Destroy router.delete("root/user._id")





module.exports = router;