
var IDEX = (function(IDEX, $, undefined) 
{   



	
	IDEX.getMinMax = function(phases, type)
	{
		var min = 0;
		var max = 0;
		
		for (var i = 0; i < phases.length; ++i)
		{
			var phase = phases[i];
			
			if (i == 0)
			{
				if (type)
				{
					min = phases[i].low;
					max = phases[i].high;
				}
				else
				{
					//min = phases[i].vol;
					max = phase.vol;
				}
			}
			else
			{
				if (type)
				{
					min = phase.low < min ? phase.low : min;
					max = phase.high > max ? phase.high : max;
				}
				else
				{
					//min = phases[i].vol < min ? phases[i].vol : min;
					max = phases[i].vol > max ? phases[i].vol : max;
				}
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