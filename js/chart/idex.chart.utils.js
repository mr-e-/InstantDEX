
var IDEX = (function(IDEX, $, undefined) {


	IDEX.isInsidePlot = function (event, chart2)
	{
		var chart =	 $('#chartArea').highcharts()
		if (typeof chart2 !== "undefined")
		{
			chart = chart2
		}
		var container = $(chart.container);
		var offset = container.offset();
		var x = event.clientX - chart.plotLeft - offset.left;
		var y = event.clientY - chart.plotTop - offset.top;
		
		return chart.isInsidePlot(x, y);
	}

	$("#chartArea, .mini-chart-area-4").on('mousewheel DOMMouseScroll', function(event) 
	{
		event.preventDefault()
		var chart =	 $('#chartArea').highcharts()
		chart = $(this).highcharts()
		if (!chart)
			return
		
		if ("type" in event && event.type == "DOMMouseScroll")
		{
			event = event['originalEvent']
			event['originalEvent'] = {}
			if (event['detail'] > 0 )
			{
				event['originalEvent']['wheelDeltaY'] = -1
			}
			else
			{
				event['originalEvent']['wheelDeltaY'] = 1
			}
		}
		
		if (IDEX.isInsidePlot(event, chart))
		{
			var curMax = chart.xAxis[0]['max']
			var curMin = chart.xAxis[0]['min']
			var dataMax = chart.xAxis[0]['dataMax']
			var dataMin = chart.xAxis[0]['dataMin']
			var diff = curMax - curMin
			diff /= 10				   
			if (event.originalEvent.wheelDeltaY < 0)
			{
				chart.xAxis[0].setExtremes((curMin-diff > dataMin) ? curMin-diff : dataMin, curMax, true, false);
			}
			else if (event.originalEvent.wheelDeltaY > 0)
			{
				chart.xAxis[0].setExtremes((curMin+diff < curMax) ? curMin+diff : curMin, curMax, true, false);
			}
		}
	});
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
