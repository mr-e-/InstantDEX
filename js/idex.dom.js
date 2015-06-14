

var IDEX = (function(IDEX, $, undefined) 
{
	
	
	IDEX.buildMainChartDom = function()
	{
		var svg = IDEX.makeSVG()
		var $svgEl = $(svg.node())
		var id = "main_menu_chart"
		$svgEl.attr("id", id)
		$(".browse-chart-wrap").append($svgEl)		
		
		var svg = IDEX.makeSVG()
		var $svgEl = $(svg.node())
		var id = "ex_chart"
		$svgEl.attr("id", id)
		$svgEl.css("background", "#0A0A0A")
		$("#chartArea").append($svgEl)	
	}
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));
