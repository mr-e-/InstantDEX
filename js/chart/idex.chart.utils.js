
var IDEX = (function(IDEX, $, undefined)
{

	IDEX.isInsidePlot = function (eX, eY, chart)
	{
		var container = $(chart.container);
		var offset = container.offset();
		var x = eX - chart.plotLeft - offset.left;
		var y = eY - chart.plotTop - offset.top;
		
		return chart.isInsidePlot(x, y);
	}

	
	function zoomChart(chart, isZoomOut)
	{
		var curMax = chart.xAxis[0]['max'];
		var curMin = chart.xAxis[0]['min'];
		var dataMax = chart.xAxis[0]['dataMax'];
		var dataMin = chart.xAxis[0]['dataMin'];
		var diff = (curMax - curMin) / 10;
		   
		if (isZoomOut)
			chart.xAxis[0].setExtremes((curMin-diff > dataMin) ? curMin-diff : dataMin, curMax, true, false);
		else
			chart.xAxis[0].setExtremes((curMin+diff < curMax) ? curMin+diff : curMin, curMax, true, false);
	}
	
	
	$("#chartArea, .mini-chart-area-4").on('mousewheel DOMMouseScroll', function(e)
	{
		e.preventDefault();
	
		var chart = $(this).highcharts();
		
		if ("type" in e && e.type == "DOMMouseScroll")
		{
			var wheelDeltaY = e['originalEvent']['detail'] > 0 ? -1 : 1;
			var clientX = e['originalEvent']['clientX'];
			var clientY = e['originalEvent']['clientY'];
		}
		else
		{
			var wheelDeltaY = e.originalEvent.wheelDeltaY;
			var clientX = e['clientX'];
			var clientY = e['clientY'];
		}
		
		if (chart && IDEX.isInsidePlot(clientX, clientY, chart))
		{
			var isZoomOut = wheelDeltaY < 0;
			
			zoomChart(chart, isZoomOut);
		}
	})
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
