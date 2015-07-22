var IDEX = (function(IDEX, $, undefined) 
{   





	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		Sleuthcharts.seriesTypes = {};
		
		var Series = Sleuthcharts.Series = function()
		{
			this.init.apply(this, arguments)
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
				
			},
			
			initAxis: function()
			{
				var series = this;
				var chart = series.chart;
				//axis.height = this.height * options.heightPerc;
				//axis.width = this.width * options.widthPerc;
			}
			
			
			
		}
		
		
		
		Sleuthcharts.seriesTypes.candlestick = Sleuthcharts.extend(Series, 
		{
			seriesType: "candlestick",
			
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
					

					var a = box
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
		
		
		Sleuthcharts.seriesTypes.ohlc = Sleuthcharts.extend(Series, 
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
					
					var a = box
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
		
		
		
		Sleuthcharts.seriesTypes.column = Sleuthcharts.extend(Series, 
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
				var allPoints = chartData.allPoints;
				var allPointsLength = allPoints.length;
				
				var pointWidth = xAxis.pointWidth;
				
				
				$pointsDom.empty();

				
				for (var i = 0; i < allPointsLength; i++)
				{
					var point = allPoints[i];
					var phase = point.phase;
					var pos = point.pos;
					
					var volTop = yAxis.getPos(phase.vol);
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

					volBars
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
		
		
		Sleuthcharts.seriesTypes.line = Sleuthcharts.extend(Series, 
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
		
		
		Sleuthcharts.seriesTypes.area = Sleuthcharts.extend(Series, 
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