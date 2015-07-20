
var IDEX = (function(IDEX, $, undefined) 
{   


	IDEX.getPointPositions = function(chart)
	{
		var xAxis = chart.xAxis[0];
		var priceAxis = chart.yAxis[0]
		
		var xStart = xAxis.pos.left;
		var xPos = xStart;
		var phases = chart.visiblePhases;
		var phasesLength = phases.length;
		
		var pointWidth = xAxis.pointWidth;

		var allPoints = []
		
		//var a = Date.now()
	    for (var i = 0; i < phasesLength; i++)
		{
			var phase = phases[i];
			var closedHigher = phase.close > phase.open;
			
			var top = closedHigher ? phase.close : phase.open;
			var bottom = closedHigher ? phase.open : phase.close;
			
		    var bottomBody = priceAxis.getPos(bottom);
		    var bottomLeg = priceAxis.getPos(phase.low);
		    var topBody = priceAxis.getPos(top);
		    var topLeg = priceAxis.getPos(phase.high);
			
			var left = xPos + 0.5;
			var right = (left + pointWidth) - 1;
			var middle = ((left) + (right)) / 2;
			
			left += 0.5
			right += 0.5
			middle += 0.5
			topLeg += 0.5
			topBody += 0.5
			bottomBody += 0.5
			bottomLeg += 0.5
			
			//console.log(String(left) + " " + String(right) + " " + String(middle))
			
			var positions = {}
			positions['left'] = left;
			positions['right'] = right;
			positions['middle'] = middle;
			positions['topLeg'] = topLeg;
			positions['topBody'] = topBody;
			positions['bottomBody'] = bottomBody;
			positions['bottomLeg'] = bottomLeg;

			allPoints.push({"phase":phase, "pos":positions})
			
		    xPos += xAxis.xStep;
		}
		chart.pointData = allPoints;
	}
	

	IDEX.getMinMax = function(phases)
	{
		var high = 0;
		var low = 0;
		for (var i = 0; i < phases.length; ++i)
		{
			if (i == 0)
			{
				low = phases[i].low;
				high = phases[i].high;
			}
			else
			{
				low = phases[i].low < low ? phases[i].low : low;
				high = phases[i].high > high ? phases[i].high : high;
			}
		}
		return [low, high];
	}
	
	IDEX.getMinMaxVol = function(phases)
	{
		var max = 0;
		var min = 0;
		
		for (var i = 0; i < phases.length; ++i)
		{
			if (i == 0)
			{
				//min = phases[i].vol;
				max = phases[i].vol;
			}
			else
			{
				//min = phases[i].vol < min ? phases[i].vol : min;
				max = phases[i].vol > max ? phases[i].vol : max;
			}
		}
		return [min, max];
	}
	
	IDEX.theMinMax = function(phases)
	{
		var min = 0;
		var max = 0;
		for (var i = 0; i < phases.length; ++i)
		{
			if (i == 0)
			{
				min = phases[i].close;
				max = phases[i].close;
			}
			else
			{
				min = phases[i].close < min ? phases[i].close : min;
				max = phases[i].close > max ? phases[i].close : max;
			}
		}
		return [min, max];
	}

	
	
	IDEX.getPoint = function(points, value) 
	{
		var val = null;
		//var points = curChart.pointData;

		if (value >= points[points.length-1].pos.left)
		{
			val = points[points.length-1]
		}
		else if (value <= points[0].pos.left)
		{
			val = points[0]
		}
		else
		{
			for (var i = 0; i < points.length; i++) 
			{
				point = points[i]
				if ( point.pos.left >= value) 
				{
					val = points[i-1]
					break;
				}
			}
		}
		
		//console.log(value)
		//console.log(val)
		//console.log(points)
		return val;
	}
	
	
	IDEX.getXPoint = function(points, value)
	{
		var val = null;
		//var points = curChart.pointData;

		if (value >= points[points.length-1].phase.startTime)
		{
			val = points[points.length-1]
		}
		else if (value <= points[0].phase.startTime)
		{
			val = points[0]
		}
		else
		{
			for (var i = 0; i < points.length; i++) 
			{
				point = points[i]
				if ( point.phase.startTime >= value) 
				{
					val = points[i-1]
					break;
				}
			}
		}
		
		//console.log(value)
		//console.log(val)
		//console.log(points)
		return val;
	}
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));