
$("#search-toggle").on("click", function(e){
	e.stopPropagation();
	$("#search-form").toggle("swing");
	if ($(this).text() === "Search"){
		$(this).text("Clear Search Results");
	} else {
		$("#search-form").attr("value", null);
		$("#search-form").submit();
		$(this).text("Search");
	}
});

