var express = require("express"),
	router = express.Router(),
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	middleware = require("../middleware"), 
	NodeGeocoder = require("node-geocoder"),
	multer = require("multer")

// Multer config

var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});

var imageFilter = function (req, file, cb) {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error("Only image files are allowed!"), false);
	}
	cb(null, true)
};

var upload = multer({storage: storage, fileFilter: imageFilter});

// Cloudinary config

var cloudinary = require("cloudinary");
cloudinary.config({
	cloud_name: "denaqgoiy",
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// Geocoder config

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
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){
	req.body.campground.author = {
		id: req.user._id,
		username: req.user.username
	};
	geocoder.geocode(req.body.campground.location, function(err, data) {
		if (err || !data.length){
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}
		// inject data returned from geocode 
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		cloudinary.uploader.upload(req.file.path, function(result){
			req.body.campground.image = result.secure_url;
			Campground.create(req.body.campground, function(err, newlyCreated){
				if(err){
					console.log(err);
					req.flash("error", "An error occurred while processing your campground.");
					res.redirect("back");
				} else {
					req.flash("success", "Campground added");
					res.redirect("/campgrounds/" + newlyCreated.id);
				}
			});
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