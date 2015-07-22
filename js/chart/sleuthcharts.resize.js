

var IDEX = (function(IDEX, $, undefined) 
{   



	$(window).resize(function(e)
	{
		for (key in IDEX.allcharts)
		{
			var chart = IDEX.allcharts[key].sleuthchart

			if (!chart || !chart.xAxis.length)
			{
				continue;
			}
			else
			{
				doSetTimeout(chart);
			}
		}
	})
	
	
	function doSetTimeout(chart)
	{
		setTimeout(function()
		{
			var $el = $(chart.node);
			var isVisible = $el.is(":visible")

			if (!isVisible)
			{

			}
			else
			{
				resizeHandler(chart);
			}
			
		}, 200)
	}
	
	
	function resizeHandler(chart)
	{
		var xAxis = chart.xAxis[0];
		resizeAxis(chart)
		updateAxisPos(chart)
		
		updateAxisMinMax(chart.visiblePhases, xAxis.minIndex, xAxis.maxIndex, chart)


		redraw(chart)
	}
	
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));