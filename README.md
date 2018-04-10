Basic functionality in-place, more features coming soon.

Note that in order for geolocation to work correctly, you will have to add your own API key to 
the scripted URL at the bottom of views/campgrounds/show.ejs, and add a second key
as environment variable GEOCODER_API_KEY (c.f. routes/campgrounds.js:11) Create and register a key
@ https://developers.google.com/maps/documentation/javascript/get-api-key.