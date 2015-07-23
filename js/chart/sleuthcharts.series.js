var IDEX = (function(IDEX, $, undefined) 
{   





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
				
				
				series.height = 0;
				series.width = 0;
				
				
				series.positions = new Sleuthcharts.Positions();
				series.padding = new Sleuthcharts.Padding();
				series.padding = Sleuthcharts.extend(series.padding, userOptions.padding);
				
				if (this.seriesType == "candlestick")
				{
					series.pointsDom = chart.node.find(".boxes");
				}
				else if (this.seriesType == "column")
				{
					series.pointsDom = chart.node.find(".volbars");
				}
				
				
			},
			
			initAxis: function()
			{
				var series = this;
				var chart = series.chart;
				//axis.height = this.height * options.heightPerc;
				//axis.width = this.width * options.widthPerc;
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
				
				//var a = Date.now()
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
					
					//console.log(String(left) + " " + String(right) + " " + String(middle))
					
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
				
				var $pointsDom = series.pointsDom;
				var d3PointsDom = d3.select($pointsDom.get()[0])
				
				var chart = series.chart;
				var xAxis = series.xAxis;
				var yAxis = series.yAxis;
				
				var chartData = chart.chartData;
				var allPoints = chart.allPoints;
				var allPointsLength = allPoints.length;
				
				var pointWidth = xAxis.pointWidth;
				
				
				$pointsDom.empty();

		
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
					]
					

					var a = d3PointsDom
					//.selectAll("path")
					//.data(allPoints)
					//.enter()
					.append("path")
					.attr("d", d.join(" "))
					.attr("fill", fillColor)
					.attr("stroke", strokeColor)
					.attr("stroke-width", 1)
					.attr('shape-rendering', "crispEdges")
				}

				
			},
		
		})
		
		
		Sleuthcharts.seriesTypes.ohlc = Sleuthcharts.extendClass(Series, 
		{
			seriesType: "ohlc",
		
		
			drawPoints:function()
			{
				var series = this;
				
				var $pointsDom = series.pointsDom;
				var d3PointsDom = d3.select($pointsDom.get()[0])
				
				var chart = series.chart;
				var xAxis = series.xAxis;
				var yAxis = series.yAxis;
				
				var chartData = chart.chartData;
				var allPoints = chartData.allPoints;
				var allPointsLength = allPoints.length;
				
				var pointWidth = xAxis.pointWidth;
				
				
				$pointsDom.empty();

		
				for (var i = 0; i < allPoints; i++)
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

					strokeColor = "#66CCCC";
					fillColor = "transparent"
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
					]
					
					var a = d3PointsDom
					//.selectAll("path")
					//.data(allPoints)
					//.enter()
					.append("path")
					.attr("d", d.join(" "))
					.attr("fill", fillColor)
					.attr("stroke", strokeColor)
					.attr("stroke-width", 1)
					.attr('shape-rendering', "crispEdges")
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
				var series = this;
				
				var $pointsDom = series.pointsDom;
				var d3PointsDom = d3.select($pointsDom.get()[0])
				
				var chart = series.chart;
				var xAxis = series.xAxis;
				var yAxis = series.yAxis;
				
				var chartData = chart.chartData;
				var allPoints = chart.allPoints;
				var allPointsLength = allPoints.length;
				
				var pointWidth = xAxis.pointWidth;
				
				
				$pointsDom.empty();

				
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
					
					/*var d = 
					[
						"M", pos.left, volTop, 
						"L", pos.left, volAxis.pos.bottom, 
						"L", pos.right, volAxis.pos.bottom, 
						"L", pos.right, volTop, 
						"Z", 
					]*/

					d3PointsDom
					.append("rect")
					.attr("x", pos.left + 1)
					.attr("y", volTop - 2)
					.attr("height", volHeight)
					.attr("width", pointWidth - 1)
					.attr("fill", fillColor)
					.attr("stroke", strokeColor)
					.attr("stroke-width", 1)
					.attr('shape-rendering', "crispEdges")
				}
			},
		
		})
		
		
		Sleuthcharts.seriesTypes.line = Sleuthcharts.extendClass(Series, 
		{
			seriesType: "line",
			
			lineColor: "#54BF39",
			
			
			drawPoints:function()
			{
				var series = this;
				
				var $pointsDom = series.pointsDom;
				var rawPointsDom = $pointsDom.get()[0]
				
				var chart = series.chart;
				var xAxis = series.xAxis;
				var yAxis = series.yAxis;
				
				var chartData = chart.chartData;
				var allPoints = chartData.allPoints;
				var allPointsLength = allPoints.length;
				
				
				$pointDom.empty()

				
				var positions = []

				for (var i = 0; i < allPointsLength; i++)
				{
					var point = allPoints[i];
					var phase = point.phase;
					var pos = point.pos;
					
					var price = phase.close;
					var pixel = Math.floor(yAxis.getPos(price));
					positions.push({"x":pos.middle, "y":pixel})
				}
				
				
				var lineFunc = d3.svg.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.interpolate("basis")
					

				var d = lineFunc(positions)
				
				d3.select(rawPointsDom)
				.append("path")
				.attr("d", d)
				.attr("stroke", series.lineColor)
				.attr("stroke-width", "1.5px")
				.attr("fill", "none")
			},
			
		})
		
		
		Sleuthcharts.seriesTypes.area = Sleuthcharts.extendClass(Series, 
		{
			seriesType: "area",
			fillColor: "#2B8714",
			lineColor: "#54BF39",
			
			drawPoints:function()
			{
				var series = this;
				
				var $pointsDom = series.pointsDom;
				var rawPointsDom = $pointsDom.get()[0]
				
				var chart = series.chart;
				var xAxis = series.xAxis;
				var yAxis = series.yAxis;
				
				var chartData = chart.chartData;
				var allPoints = chartData.allPoints;
				var allPointsLength = allPoints.length;
				
				
				$pointDom.empty()

				
				var positions = []

				for (var i = 0; i < allPointsLength; i++)
				{
					var point = allPoints[i];
					var phase = point.phase;
					var pos = point.pos;
					
					var price = phase.close;
					var pixel = Math.floor(yAxis.getPos(price));
					positions.push({"x":pos.middle, "y":pixel})
				}
				
				
				var lineFunc = d3.svg.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.interpolate("basis")
					
				var area = d3.svg.area()
					.x(function(d) { return d.x; })
					.y0(priceAxis.pos.bottom)
					.y1(function(d) { return d.y; })
					.interpolate("basis");
						

				d3.select(rawPointsDom)
				.append("path")
				.attr("d", area(positions))
				.attr("stroke-width", 0)
				.attr("fill", series.fillColor)
				.attr("fill-opacity", 0.7)

					

				var d = lineFunc(positions)
				
				d3.select(rawPointsDom)
				.append("path")
				.attr("d", d)
				.attr("stroke", series.lineColor)
				.attr("stroke-width", "1.5px")
				.attr("fill", "none")

			},
			
		})
		
		

			

		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
	
	
	

	
	return IDEX;
	
}(IDEX || {}, jQuery));