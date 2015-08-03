


Sleuthcharts = (function(Sleuthcharts) 
{
	
	Sleuthcharts.seriesTypes = {};
	
	var Series = Sleuthcharts.Series = function()
	{
		//this.init.apply(this, arguments)
	}
	
	Series.prototype = 
	{

		//defaultOptions: Sleuthcharts.defaultOptions.series
		
		
		init: function(chart, userOptions)
		{
			var series = this;
			series.chart = chart;
			
			
			series.seriesType = userOptions.seriesType;
			series.index = userOptions.index;

			series.xAxis = [];
			series.yAxis = [];
			series.yAxis = chart.yAxis[series.index];
			series.xAxis = chart.xAxis[0];
			
			series.isResizingSeries = false;
			series.height = 0;
			series.width = 0;
			
			
			series.positions = new Sleuthcharts.Positions();
			series.padding = new Sleuthcharts.Padding();
			series.padding = Sleuthcharts.extend(series.padding, userOptions.padding);
			
		},
		
		initAxis: function()
		{
			var series = this;
			var chart = series.chart;
			//axis.height = this.height * options.heightPerc;
			//axis.width = this.width * options.widthPerc;
		},
		
		drawYAxisFollowLine: function(yPos)
		{
			var axis = this;
			var chart = axis.chart;
			
			if (!chart.isCrosshair)
				return
			
			var width = axis.pos.left;
			var $cursor_follow_x = chart.node.find(".cursor_follow_x");

			$cursor_follow_x
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", yPos + 0.5)
			.attr("y2", yPos + 0.5)
			.attr("stroke-width", 1)
			.attr("stroke", "#a5a5a5")
			.attr("pointer-events", "none");
		},
		
		drawXAxisFollowLine: function(closestPoint)
		{
			if (!chart.isCrosshair)
				return
			
			var xAxis = chart.xAxis[0];
			var height = xAxis.pos['bottom'];
			var $cursor_follow_y = $(chart.node).find(".cursor_follow_y");
		
			$cursor_follow_y
			.attr("x1", closestPoint.pos.middle)
			.attr("x2", closestPoint.pos.middle)
			.attr("y1", 0)
			.attr("y2", height)
			.attr("stroke-width", 1)
			.attr("stroke", "#a5a5a5")
			.attr("pointer-events", "none");
		},
		
		
		setDefaultMarketDataRange: function()
		{
			var series = this;
			var chart = series.chart;
			var xAxis = chart.xAxis[0];
			var marketHandler = chart.marketHandler;
			var allPhases = marketHandler.marketData.ohlc;
			var allPhasesLength = allPhases.length;
			
			

			var startIndex = 0;
			var endIndex = allPhases.length - 1;
			
			var range = xAxis.range;
			//range = 500;
			var minRange = xAxis.minRange
			
			if (allPhasesLength > range)
			{
				startIndex = allPhasesLength - range;
			}
			
			
			var visiblePhases = allPhases.slice(startIndex);
			
			if (series.calcPointWidth(visiblePhases))
			{
				chart.visiblePhases = visiblePhases;
				series.updateAxisMinMax(startIndex, endIndex);
			}
		},
		
		
		updateAxisMinMax: function(startIndex, endIndex)
		{
			var series = this;
			var chart = series.chart;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].updateMinMax(startIndex, endIndex);
			}				
		},
		
		
		calcPointWidth: function(visiblePhases)
		{
			var series = this;
			var chart = series.chart;
			var xAxis = chart.xAxis[0];
			var xAxisWidth = xAxis.width;
			
			var ret = false;
			
			var minPointWidth = 1;
			var pointPadding = 1;
			
			var fullPointWidth = xAxisWidth / visiblePhases.length;
			
			if (fullPointWidth >= 3) pointPadding = 2;
			if (fullPointWidth >= 5) pointPadding = 3.5;
			if (fullPointWidth >= 10) pointPadding = 5;
			if (fullPointWidth >= 20) pointPadding = 10;
			if (fullPointWidth >= 100) pointPadding = 20;

			var pointWidth = fullPointWidth - pointPadding
			
			if (pointWidth < minPointWidth)
			{
				ret = false;
			}
			else
			{				
				xAxis.fullPointWidth = fullPointWidth;
				xAxis.pointWidth = pointWidth;
				xAxis.pointPadding = pointPadding;
				xAxis.numPoints = Math.ceil(xAxisWidth / fullPointWidth);
				
				ret = true;
			}
			
			return ret
		},
		
		
		getPointPositions: function()
		{
			var series = this;
			var chart = series.chart;
			var xAxis = chart.xAxis[0];
			var priceAxis = chart.yAxis[0];
			
			var xPos = xAxis.pos.left;

			var phases = chart.visiblePhases;
			var phasesLength = phases.length;
			
			var fullPointWidth = xAxis.fullPointWidth;
			var pointWidth = xAxis.pointWidth;

			var allPoints = []
			
			//var marketHandler = chart.marketHandler;
			//var phases = marketHandler.marketData.ohlc;
			//var phasesLength = phases.length;
			
			for (var i = 0; i < phasesLength; i++)
			{
				var phase = phases[i];
				var closedHigher = phase.close > phase.open;
				
				var top = closedHigher ? phase.close : phase.open;
				var bottom = closedHigher ? phase.open : phase.close;
				
				var bottomBody = priceAxis.getPositionFromValue(bottom);
				var bottomLeg = priceAxis.getPositionFromValue(phase.low);
				var topBody = priceAxis.getPositionFromValue(top);
				var topLeg = priceAxis.getPositionFromValue(phase.high);
				
				var left = xPos + 0.5;
				var right = (left + pointWidth) - 1;
				var middle = ((left) + (right)) / 2;
				
				left += 0.5;
				right += 0.5;
				middle += 0.5;
				topLeg += 0.5;
				topBody += 0.5;
				bottomBody += 0.5;
				bottomLeg += 0.5;
				
				
				var positions = {};
				positions.left = left;
				positions.right = right;
				positions.middle = middle;
				positions.topLeg = topLeg;
				positions.topBody = topBody;
				positions.bottomBody = bottomBody;
				positions.bottomLeg = bottomLeg;

				allPoints.push({"phase":phase, "pos":positions});
				
				xPos += fullPointWidth;
			}
			
			chart.allPoints = allPoints;
		},

		
	}
	
	
	
	Sleuthcharts.seriesTypes.candlestick = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "candlestick",
		
		closedHigherFill: "transparent",
		closedHigherStroke: "#19B34C",
		closedLowerFill: "#9C0505",
		closedLowerStroke: "#D12E2E",

		
		drawPoints: function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			var ctx = chart.ctx;

			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var pointWidth = xAxis.pointWidth;
			

			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var closedHigher = phase.close > phase.open;
				
				var strokeColor = closedHigher ? series.closedHigherStroke : series.closedLowerStroke;
				var fillColor = closedHigher ? series.closedHigherFill : series.closedLowerFill;
				
				var topBody = pos.topBody;
				var bottomBody = pos.bottomBody;
				
				if (pointWidth <= 2 && closedHigher)
				{
					fillColor = "transparent"
				}
				if (pointWidth <= 2)
				{
					topBody = pos.topLeg;
					bottomBody = pos.bottomLeg;
				}
	
				if (bottomBody - topBody < 1)
				{
					bottomBody += 0.5;
					topBody -= 0.5;
				}
				
				
				var d = 
				[
					"M", pos.left, topBody, 
					"L", pos.left, bottomBody, 
					"L", pos.right, bottomBody, 
					"L", pos.right, topBody, 
					"Z", 
					"M", pos.middle, bottomBody, 
					"L", pos.middle, pos.bottomLeg, 
					"M", pos.middle, topBody, 
					"L", pos.middle, pos.topLeg
				];
				
				var pathStyle = {};
				pathStyle.strokeColor = strokeColor;
				pathStyle.fillColor = fillColor;
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				

			}
			
			
		},
		
		
		
	
	})
	
	
	Sleuthcharts.seriesTypes.ohlc = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "ohlc",

	
		drawPoints:function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var pointWidth = xAxis.pointWidth;
			
			var ctx = chart.ctx;

	
			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var closedHigher = phase.close > phase.open;
				
				
				var topBody = pos.topBody;
				var bottomBody = pos.bottomBody;
				

				if (pointWidth <= 2)
				{
					topBody = pos.topLeg;
					bottomBody = pos.bottomLeg;
				}
			
				var openPos = closedHigher ? pos.bottomBody : pos.topBody
				var closePos = closedHigher ? pos.topBody : pos.bottomBody
				var leftPos = (pos.left - 0.5) - (xAxis.pointPadding/2)
				var rightPos = (pos.right + 0.5) + (xAxis.pointPadding/2)

				var strokeColor = "#66CCCC";
				var fillColor = "transparent";
				
				var d = 
				[
					"M", leftPos, openPos, 
					"L", pos.middle, openPos, 
					"M", pos.middle, pos.bottomLeg, 
					"L", pos.middle, openPos, 
					"M", pos.middle, pos.topLeg, 
					"L", pos.middle, openPos, 
					"M", rightPos, closePos, 
					"L", pos.middle, closePos 
				];
				
				var pathStyle = {};
				pathStyle.strokeColor = strokeColor;
				pathStyle.fillColor = fillColor;
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				
			}
			

			
		},
	
	})
	
	
	
	Sleuthcharts.seriesTypes.column = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "column",
		
		closedHigherFill: "transparent",
		closedHigherStroke: "#19B34C",
		closedLowerFill: "#9C0505",
		closedLowerStroke: "#D12E2E",	

	
		drawPoints:function()
		{
			var dn = Date.now()

			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var pointWidth = xAxis.pointWidth;
			
			var ctx = chart.ctx;

			
			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var volTop = yAxis.getPositionFromValue(phase.vol);
				var volHeight = yAxis.pos.bottom - volTop;
				
				var closedHigher = phase.close > phase.open;
				
				var strokeColor = closedHigher ? series.closedHigherStroke : series.closedLowerStroke;
				var fillColor = closedHigher ? series.closedHigherFill : series.closedLowerFill;
				
				var d = 
				[
					"M", pos.left, volTop, 
					"L", pos.left, yAxis.pos.bottom, 
					"L", pos.right, yAxis.pos.bottom, 
					"L", pos.right, volTop, 
					"Z", 
				]

				var pathStyle = {};
				pathStyle.strokeColor = strokeColor;
				pathStyle.fillColor = fillColor;
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
			}
			

		},
	
	})
	
	
	Sleuthcharts.seriesTypes.line = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "line",
		
		lineColor: "#9D24C9",
		
		
		drawPoints:function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var ctx = chart.ctx;
			
			var positions = [];

			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var price = phase.close;
				var pixel = Math.floor(yAxis.getPositionFromValue(price));
				positions.push({"x":pos.middle, "y":pixel})
			}
			
			
			var lineFunc = d3.svg.line()
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
				.interpolate("basis")
				

			var rawPath = lineFunc(positions);
			var d = rawPath.split(/(M|L|Z|C)+/);
			d = d.join(",");
			d = d.split(",");			

			if (d.length && !d[0].length)
			{
				d.shift();
			}
			
			//console.log(d);
			
			var pathStyle = {};
			pathStyle.strokeColor = series.lineColor;
			pathStyle.fillColor = "transparent";
			
			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
	})
	
	
	Sleuthcharts.seriesTypes.area = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "area",
		fillColor: "#425A70",
		lineColor: "#6797c5",
		
		drawPoints:function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			var ctx = chart.ctx;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			
			var positions = [];

			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var price = phase.close;
				var pixel = Math.floor(yAxis.getPositionFromValue(price));
				positions.push({"x":pos.middle, "y":pixel})
			}
			
				
				
			var area = d3.svg.area()
				.x(function(d) { return d.x; })
				.y0(yAxis.pos.bottom)
				.y1(function(d) { return d.y; })
				.interpolate("basis");
				
			var rawAreaPath = area(positions);
			var areaPath = rawAreaPath.split(/(M|L|Z|C)+/);
			areaPath = areaPath.join(",");
			areaPath = areaPath.split(",");	
			
			
			if (areaPath.length && !areaPath[0].length)
			{
				areaPath.shift();
			}
			
			//console.log(areaPath);
			
			var areaPathStyle = {};
			areaPathStyle.strokeColor = "transparent";
			areaPathStyle.fillColor = series.fillColor;
			areaPathStyle.fillOpacity = 0.7;
			areaPathStyle.strokeWidth = 0;
			
					
			
			
			var lineFunc = d3.svg.line()
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
				.interpolate("basis")
				
					
			var rawLinePath = lineFunc(positions);
			var linePath = rawLinePath.split(/(M|L|Z|C)+/);
			linePath = linePath.join(",");
			linePath = linePath.split(",");	
			
			
			if (linePath.length && !linePath[0].length)
			{
				linePath.shift();
			}
			
			//console.log(linePath);
			
			var linePathStyle = {};
			linePathStyle.strokeColor = series.lineColor;
			linePathStyle.fillColor = "transparent";
			
			
			
			Sleuthcharts.drawCanvasPath(ctx, linePath, linePathStyle);
			Sleuthcharts.drawCanvasPath(ctx, areaPath, areaPathStyle);
		

		},
		
	})
	
	

		

	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));


