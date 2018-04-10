var express = require("express"),
	router = express.Router({mergeParams: true}), 
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	middlewareObj = require("../middleware")


// New comment
router.get("/new", middlewareObj.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else res.render("comments/new", {campground: foundCampground});
	});
});

//create comment--POST to/campgrounds/:id

router.post("/", middlewareObj.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.error(err);
			res.redirect("/campgrounds")
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.error(err);
				} else {
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					foundCampground.comments.push(comment);
					foundCampground.save();
					req.flash("success", "New comment added");
					res.redirect("/campgrounds/" + foundCampground._id);
				}
			})
		}
	})
});

// EDIT comment

router.get("/:comment_id/edit", middlewareObj.checkCommentOwner, function(req, res){
	var campground_id = req.params.id,
		comment_id = req.params.comment_id

	Campground.findById(campground_id, function(err, foundCampground){
		if (err || !foundCampground){
			req.flash("error", "Unable to find host campground for comment");
			res.redirect("back");
		} else {
			Comment.findById(comment_id, function(err, foundComment){
				res.render("comments/edit", {campground_id: campground_id, comment: foundComment});
			});
		}
	});
});

// Update Comment

router.put("/:comment_id", middlewareObj.checkCommentOwner, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if (err || !updatedComment){
			req.flash("error", "Unable to update, comment not found");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// destroy comment

router.delete("/:comment_id", middlewareObj.checkCommentOwner, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		res.redirect("/campgrounds/" + req.params.id);
	});
});

module.exports = router;