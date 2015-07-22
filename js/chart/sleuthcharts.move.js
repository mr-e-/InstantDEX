

var IDEX = (function(IDEX, $, undefined) 
{

	
	
	


	
	
	
	function tryZoom(chart, e)
	{
		//e.preventDefault();

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
		
		var mouseX = e.pageX
		var mouseY = e.pageY
		var offsetX = $(chart.node).offset().left;
		var offsetY = $(chart.node).offset().top;
		var insideX = mouseX - offsetX
		var insideY = mouseY - offsetY
		var height = chart.xAxis[0].pos['bottom'];
		var width = chart.yAxis[0].pos['left']; //+ priceAxis.width
				
		var topAxis = chart.yAxis[0]
		var bottomAxis = chart.yAxis[chart.yAxis.length - 1]
		
		var topPos = topAxis.pos.top;
		var bottomPos = bottomAxis.pos.bottom;
		var xAxis = chart.xAxis[0]
		
		if (insideY >= 0 && insideY <= height && insideX >= 0 && insideX <= width)
		{
			if (insideY >= topPos && insideY <= bottomPos
				&& insideX >= xAxis.pos.left && insideX <= xAxis.pos.right)
			{
				//var insidePriceY = insideY - priceAxis.padding.top;
				var isZoomOut = wheelDeltaY <= 0;
				//console.log(clientX)
				//console.log(clientY)
				//console.log(wheelDeltaY)

				zoomChart(isZoomOut, chart);
			}
		}
	}
	
	
	
	function zoomChart(isZoomOut, chart)
	{
		var xAxis = chart.xAxis[0]
		var curMax = xAxis.max;
		var curMin = xAxis.min;
		var dataMax = xAxis.dataMax;
		var dataMin = xAxis.dataMin;
		var diff = (curMax - curMin) / 10;
		   
		var newMax = curMax;
		
		if (isZoomOut)
			var newMin = (curMin-diff > dataMin) ? curMin-diff : dataMin;
		else
			var newMin = (curMin + diff < curMax) ? curMin + diff : curMin;
		
			
		var startIndex = findMinIndex(chart.phases, newMin)
		var endIndex = xAxis.maxIndex;
		var vis = chart.phases.slice(startIndex, endIndex + 1);
		
		updateAxisMinMax(vis, startIndex, endIndex, chart)
		
		chart.resizeAxis(chart)
		chart.updateAxisPos(chart)
		chart.redraw(chart)
	}
	
	
	function findMinIndex(data, newMin)
	{
		var startIndex = 0;
		
		for (startIndex = 0; startIndex < data.length; startIndex++)
		{
			var phase = data[startIndex];
			
			if (phase.startTime >= newMin)
			{
				if (startIndex != 0)
					startIndex--;
				
				break;
			}
		}
		
		return startIndex;
	}
	
	
	
	function shiftXAxis(chart, shifts, direction)
	{
		var xAxis = chart.xAxis[0]
		var vis = []
		
		if (direction == false)
		{
			if (xAxis.minIndex > 0)
			{
				var startIndex = xAxis.minIndex - shifts;
				var endIndex = xAxis.maxIndex - shifts;
				vis = chart.phases.slice(startIndex, endIndex+1);
			}
		}
		else
		{
			if (xAxis.maxIndex < chart.phases.length - 1)
			{
				var startIndex = xAxis.minIndex + shifts;
				var endIndex = xAxis.maxIndex + shifts;
				vis = chart.phases.slice(startIndex, endIndex+1);
			}
		}

		if (vis.length)
		{			
			updateAxisMinMax(vis, startIndex, endIndex, chart)
		}
	}
	
	
	function handleDrag(chart, xPos)
	{
		var xAxis = chart.xAxis[0];
		
		var insideTimeX = xPos - xAxis.pos.left;
		var diff = insideTimeX - chart.draggingPos;
		var direction = diff < 0
		diff = Math.abs(diff)
		
		if (diff != 0 && diff > xAxis.xStep)
		{	
			var shifts = Math.floor(diff / xAxis.xStep)
			
			chart.draggingPos = insideTimeX
			shiftXAxis(chart, shifts, direction)
			chart.resizeAxis(chart);
			chart.updateAxisPos(chart)
			chart.redraw(chart);
		}
	}
	
	
	
	function chartMousedown(e, chart)
    {
		if (!chart.xAxis.length)
			return
		
		var xAxis = chart.xAxis[0];
		var priceAxis = chart.yAxis[0];
		
		var hasVol = chart.yAxis.length > 1
		if (hasVol)
			var volAxis = chart.yAxis[1];
		
		var mouseX = e.pageX
		var mouseY = e.pageY
		var offsetX = $(chart.node).offset().left;
		var offsetY = $(chart.node).offset().top;
		var insideX = mouseX - offsetX
		var insideY = mouseY - offsetY

		var height = xAxis.pos['bottom'];
		var width = priceAxis.pos['left']; //+ priceAxis.width
		
		
		if (insideY >= 0 && insideY <= height 
			&& insideX >= 0 && insideX <= width)
	    {
			if (hasVol)
			{
				if (insideY >= priceAxis.pos.top && insideY <= volAxis.pos.bottom
					&& insideX >= xAxis.pos.left && insideX <= xAxis.pos.right)
				{
					$(chart.node).css("cursor", "move");
					chart.isDragging = true;
					chart.draggingPos = insideX - xAxis.pos.left;
				}
			}
			else
			{
				if (insideY >= priceAxis.pos.top && insideY <= priceAxis.pos.bottom
					&& insideX >= xAxis.pos.left && insideX <= xAxis.pos.right)
				{
					$(chart.node).css("cursor", "move");
					chart.isDragging = true;
					chart.draggingPos = insideX - xAxis.pos.left;
				}
			}
	    }
    }
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));