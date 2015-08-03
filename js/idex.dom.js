

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $loadingOverlay = $(".loading-overlay")
	var $loadingPopup = $(".loading-screen")
	var $loadingText = $(".loading-text").find("span");

	
	
	IDEX.showLoading = function()
	{
		$loadingOverlay.addClass("active");
		$loadingPopup.addClass("active");
	}
	
	IDEX.hideLoading = function()
	{
		$loadingOverlay.removeClass("active");
		$loadingPopup.removeClass("active");
	}
	
	IDEX.editLoading = function(text)
	{
		$loadingText.text(text);
	}



	IDEX.makeSVG = function()
	{
		var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
		svg = d3.select($(svg).get()[0])
		
		svg
		.attr("height", "100%")
		.attr("width", "100%")
		.attr("class", "unselectable")
		//.style({"background":"black"});
		
		
		
		svg.append("text")
		.attr("class", "highestPrice");
		
		svg.append("text")
		.attr("class", "lowestPrice");
		
		
		var lines = svg.append("g")
		.attr("class", "drawingLines");
		
		svg.append("rect")
		.attr("class", "drawingFollow");
		
		
		var fib = svg.append("g")
		.attr("class", "fibLines");

		
		return svg
	}
	
	
	
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));
