var Campground = require("../models/campground");
var Comment = require("../models/comment");
	
var middlewareObj = {};

middlewareObj.checkCampgroundOwner = function (req, res, next) {
	if (req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Campground not found");
				res.redirect("back"); 
			} else {
				if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "Permission denied, please log in as campground submitter");
					res.redirect("/login"); 
				}
			}
		});
	} else {
		req.flash("error", "Please Log In to Continue");
		res.redirect("/login");
	}
}

middlewareObj.checkCommentOwner = function (req, res, next) {
	if (req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back");
				} else {
				if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else {
					req.flash("error", "Permission denied, please log in as comment author");
					res.redirect("/login");
				}
			}
		});
	} else {
		res.send("permission denied");
	}
}

middlewareObj.isLoggedIn = function (req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "Please Log In to Continue");
	res.redirect("/login");
}

middlewareObj.isValidPrice = function (req, res, next){
	let price = req.body.price;
	const valid = /^\d{1,4}$/;
	if (valid.test(price)){
		return next();
	} 
	req.flash("error", "Invalid Price");
	return res.redirect("/campgrounds/new");
}




module.exports = middlewareObj;