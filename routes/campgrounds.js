var express = require("express"),
	router = express.Router(),
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	middleware = require("../middleware"), 
	NodeGeocoder = require("node-geocoder")

var options = {
	provider: "google",
	httpAdapter: "https",
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

var geocoder = NodeGeocoder(options);


// Index/all campgrounds
router.get("/", function(req, res){
	if (req.query.search){
		const escapedStr = escapeStr(req.query.search);
		const searchExp = new RegExp(escapedStr, "gi");
		Campground.find( { $or : [ {name: searchExp}, {description: searchExp} ] }, function(err, matchCampgrounds){
			if (err){
				console.log(err)
			} else {
				res.render("campgrounds/index", {campgrounds: matchCampgrounds, currentUser: req.user, page: 'campgrounds'})
			}
		});
	} else {
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err)
			}else{
				res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user, page: 'campgrounds'})
			}
		});
	}
});

// New Campground route
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new")
});

// Create CG
router.post("/", middleware.isLoggedIn, middleware.isValidPrice, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	geocoder.geocode(req.body.location, function(err, data) {
		if (err || !data.length){
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newCampground = {name: name, price: price, image: image, description: description, author: author, lat: lat, lng: lng, location: location};
		Campground.create(newCampground, function(err, newlyCreated){
			if(err){
				console.log(err);
				req.flash("error", "An error occurred while processing your campground.");
				res.redirect("back");
			} else {
				req.flash("success", "Campground added");
				res.redirect("/campgrounds");
			}
		});
	});
});

// Show CG
router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, returnedCampground){
		if(err || !returnedCampground){
				req.flash("error", "Campground not found");
				return res.redirect("back");
			} else {
			res.render("campgrounds/show", {campground: returnedCampground, user: req.user});
		}
	});
});

// Edit CG
router.get("/:id/edit", middleware.checkCampgroundOwner, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


// Update -- PUT

router.put("/:id", middleware.checkCampgroundOwner, function(req, res){
	geocoder.geocode(req.body.location, function (err, data){
		if (err || !data.length){
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}
		req.body.campground.lat = data[0].latitude; 
		req.body.campground.lng = data[0].longitude; 
		req.body.campground.location = data[0].formattedAddress;
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
			if(err) {
				req.flash("error", err.message);
				res.redirect("back");
			} else {
				req.flash("success", "Successfully Updated")
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
	});
});

//Delete
router.delete("/:id", middleware.checkCampgroundOwner, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.error(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	})
});

function escapeStr(str){
	return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}



module.exports = router;