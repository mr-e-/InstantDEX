var Sleuthcharts = {};


var IDEX = (function(IDEX, $, undefined) 
{   


	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		Sleuthcharts.allCharts = [];
		
		
		$.fn.sleuthcharts = function () 
		{
			var args = arguments;
			var options;
			var ret;
			var chart;
			
			
			if (this[0]) 
			{


				options = args[0];

				// Create the chart
				if (typeof options !== "undefined") 
				{
					//console.log(options);
					chart = new Sleuthcharts.Chart(options);
					ret = chart;
				}

				if (typeof options === "undefined") 
				{
					var index = $(this).attr('data-sleuthcharts');
					ret = Sleuthcharts.allCharts[index];
				}
			}
			
			return ret;
		};
		
		
		
		Sleuthcharts.getChart = function($node)
		{
			var allCharts = this.allCharts;
			var len = allCharts.length;
			var ret = false;
			
			for (var i = 0; i < len; i++)
			{
				var chart = allCharts[i];
				
				if (chart.node.is($node))
				{
					ret = chart;
					break;
				}
			}
			
			return ret;
		};
		

		
		var Chart = Sleuthcharts.Chart = function()
		{
			this.init.apply(this, arguments)
		}
		
		Chart.prototype = 
		{
			
			init: function(userOptions)
			{
				
				var chart = this;
				chart.userOptions = userOptions;
				chart.chartOptions = userOptions.chart;
				
				chart.node = chart.userOptions.chart.node;
				
				chart.allPoints = [];
				chart.visiblePhases = [];
				chart.DOMPosition = {};
				chart.padding = new Sleuthcharts.Padding();
				chart.padding = Sleuthcharts.extend(chart.padding, chart.chartOptions.padding);
				
				chart.isDragging = false;
				chart.isCrosshair = true;
				chart.prevIndex = -2;
				
				
				chart.DOMEventHandler;
				chart.marketHandler
				chart.series = [];
				chart.axes = [];
				chart.xAxis = [];
				chart.yAxis = [];
								
				
				chart.setContainerSize();
				chart.initAxes();
				chart.initSeries();
				chart.initMarketHandler();
				chart.initDOMEventHandler();


				

					
				chart.node.attr("data-sleuthcharts", Sleuthcharts.allCharts.length)

				Sleuthcharts.allCharts.push(chart);
				
				var load = "marketSettings" in chart.userOptions;

				{
					chart.resizeAxis();
					chart.updateAxisPos();
					
					//chart.redraw();
					
					//chart.drawBothInds();

					//chart.drawMarketName();
				}
				
				if (load)
				{
					var marketHandler = chart.marketHandler;
					
					//chart.toggleLoading(true);

					marketHandler.getMarketData().done(function()
					{
						var tempSeries = chart.series[0];
						
						//chart.toggleLoading(false);	

						tempSeries.setDefaultMarketDataRange();
						tempSeries.getPointPositions();
						
						chart.equalizeYAxisWidth();
						chart.resizeAxis();
						chart.updateAxisPos();
						
		
						tempSeries.setDefaultMarketDataRange();
						tempSeries.getPointPositions();
						
						//chart.updateAxisMinMax(chart.visiblePhases, chart.xAxis[0].minIndex, chart.xAxis[0].maxIndex);
						
								
						
						for (var i = 0; i < chart.series.length; i++)
						{
							var series = chart.series[i];
							console.log(series);
							series.drawPoints();
						}
						
						//chart.drawBothInds();

						chart.updateAxisTicks();
						chart.drawAxisLines();
						
						//highLowPrice(chart);
						//redrawLines(chart);

					})
					
				}
				
				return chart;
			},
			
			
			shiftXAxis: function(shifts, direction)
			{
				var chart = this;
				var xAxis = chart.xAxis[0];
				var vis = [];
				var marketHandler = chart.marketHandler;
				var allPhases = marketHandler.marketData.ohlc;

				
				if (direction == false)
				{
					if (xAxis.minIndex > 0)
					{
						var startIndex = xAxis.minIndex - shifts;
						var endIndex = xAxis.maxIndex - shifts;
						vis = allPhases.slice(startIndex, endIndex+1);
					}
				}
				else
				{
					if (xAxis.maxIndex < allPhases.length - 1)
					{
						var startIndex = xAxis.minIndex + shifts;
						var endIndex = xAxis.maxIndex + shifts;
						vis = allPhases.slice(startIndex, endIndex+1);
					}
				}

				if (vis.length)
				{
					console.log(vis);
					var series = chart.series[0];

					if (series.calcPointWidth(vis))
					{
						chart.visiblePhases = vis;
						series.updateAxisMinMax(startIndex, endIndex);
					}
				}
			},
	
			

			redraw: function()
			{
				var chart = this;
				
				var tempSeries = chart.series[0];

				chart.resizeAxis();
				chart.updateAxisPos();
				tempSeries.getPointPositions();
				
				chart.equalizeYAxisWidth();
				
				chart.resizeAxis();
				chart.updateAxisPos();
				tempSeries.getPointPositions();
										
				
				for (var i = 0; i < chart.series.length; i++)
				{
					var series = chart.series[i];
					series.drawPoints();
				}
				
				chart.updateAxisTicks();
				chart.drawAxisLines();
			},
			
			
			
			isInsidePlot: function(mouseX, mouseY)
			{
				var chart = this;
				
				var isInsideX = mouseX > chart.plotLeft && mouseX < chart.plotRight;
				var isInsideY = mouseY > chart.plotTop && mouseY < chart.plotBottom;
				
				var isInside = isInsideX && isInsideY;
				
				return isInside
			},
			
			
			getPoint: function(points, value) 
			{
				var chart = this;
				var val = null;

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
				
				return val;
			},
			
		
			setContainerSize: function()
			{
				var chart = this;
				var chartPadding = chart.padding;
				var $chartNode = chart.node;
				
				var DOMPosition = Sleuthcharts.getDOMPosition($chartNode);
				
				chart.DOMPosition = DOMPosition;
				
				chart.plotTop = DOMPosition.top + chartPadding.top;
				chart.plotBottom = DOMPosition.bottom - chartPadding.bottom;
				chart.plotLeft = DOMPosition.left + chartPadding.left;
				chart.plotRight = DOMPosition.right - chartPadding.right;
				
				chart.plotHeight = chart.plotBottom - chart.plotTop;
				chart.plotWidth = chart.plotRight - chart.plotLeft;
			},
			
			
			initMarketHandler: function()
			{
				var chart = this;
				
				var marketSettings = chart.userOptions.marketSettings || {};
				
				//console.log(marketSettings);
				
				var marketHandler = new Sleuthcharts.MarketHandler(chart, marketSettings);
				chart.marketHandler = marketHandler;
			},
			
		
			
			initSeries: function()
			{
				var chart = this;
				var seriesOptions = chart.userOptions.series;
				
				
				for (var i = 0; i < seriesOptions.length; i++)
				{
					var opt = seriesOptions[i];
					opt.index = i;
					var seriesType = opt.seriesType;
					var seriesClass = Sleuthcharts.seriesTypes[seriesType];
					var series = new seriesClass();
					series.init(chart, opt)
					chart.series.push(series);
				}
			},
			
			
			initAxes: function()
			{
				var chart = this;
				var xAxisOptions = chart.userOptions.xAxis;
				var yAxisOptions = chart.userOptions.yAxis;
				
				for (var i = 0; i < xAxisOptions.length; i++)
				{
					var opt = xAxisOptions[i];
					opt.isXAxis = true;
					opt.index = i;
					
					var axis = new Sleuthcharts.Axis(chart, opt)
					chart.xAxis.push(axis)
				}
				
				for (var i = 0; i < yAxisOptions.length; i++)
				{
					var opt = yAxisOptions[i];
					opt.isXAxis = false;
					opt.index = i;
					
					var axis = new Sleuthcharts.Axis(chart, opt)
					chart.yAxis.push(axis)
				}
				
				chart.axes = chart.xAxis.concat(chart.yAxis);
			},
			
			
			initDOMEventHandler: function()
			{
				var chart = this;
				var DOMEventHandler = new Sleuthcharts.DOMEventHandler(chart);
				DOMEventHandler.setDOMEvents();
				
				chart.DOMEventHandler = DOMEventHandler;
			},
			
			
			
			equalizeYAxisWidth: function()
			{
				var chart = this;
				var allSeries = chart.series;
				var biggestWidth = 0;
				
				for (var i = 0; i < allSeries.length; i++)
				{
					var yAxis = allSeries[i].yAxis;
					
					var paddedMax = yAxis.max + (yAxis.max * (yAxis.maxPadding))
					var paddedMin = yAxis.min - (yAxis.min * (yAxis.minPadding))
					
					var scale = d3.scale.linear()
					.domain([paddedMin, paddedMax])
					.range([yAxis.height, yAxis.pos.top])
					
					var tickVals = scale.ticks(yAxis.numTicks) //.map(o.tickFormat(8))
					
					
					var maxTextWidth = IDEX.getMaxTextWidth(tickVals, yAxis.labels.fontSize, yAxis.ctx)
					var textPadding = yAxis.labels.textPadding;
					var combinedWidth = maxTextWidth + (yAxis.tickLength * 2) + (textPadding * 2);
					var newAxisWidth = combinedWidth;

					biggestWidth = newAxisWidth > biggestWidth ? newAxisWidth : biggestWidth;
				}
				for (var i = 0; i < allSeries.length; i++)
				{
					var yAxis = allSeries[i].yAxis
					yAxis.widthInit = biggestWidth
					yAxis.width = biggestWidth;
				}
			},
			

			
			resizeAxis: function()
			{
				var chart = this;
				
				for (var i = 0; i < chart.axes.length; i++)
				{
					chart.axes[i].resizeAxis();
				}
			},
			
			updateAxisPos: function()
			{
				var chart = this;
				
				for (var i = 0; i < chart.axes.length; i++)
				{
					chart.axes[i].updateAxisPos();
				}
			},
			
			updateAxisTicks: function()
			{
				var chart = this;
				
				for (var i = 0; i < chart.axes.length; i++)
				{
					chart.axes[i].makeAxis();
				}
			},
			
			drawAxisLines: function()
			{
				var chart = this;
				
				for (var i = 0; i < chart.axes.length; i++)
				{
					chart.axes[i].drawAxisLines();
				}
			},
			
			
			toggleLoading: function (isLoading)
			{
				var chart = this;
				var node  = chart.node;
				var $parent = $(node).parent();
				var $loading = $parent.find(".chart-loading")
				if (isLoading)
				{
					$loading.show();
				}
				else
				{
					$loading.hide()
				}
			},
			
			
			
			updateChart: function()
			{
				var dfd = new $.Deferred();

				var chart = this;
				var settings = chart.settings;
				var isTime = settings.bars == "time";

				
				chart.emptyChart();
				chart.unbindEventListeners();	//$("#"+node).unbind();
				chart.toggleLoading(true);
				
				chart.prevIndex = -1;

				updateChartType();

				chart.MarketData.getMarketData.done(function()
				{
					chart.resizeAxis();
					chart.updateAxisPos();
					chart.initXAxis();
					
					chart.redraw();
					
					chart.drawBothInds();

					chart.drawMarketName();
					chart.toggleLoading(false)
					
					
					dfd.resolve();
				})
				
				return dfd.promise()
			},
			
			
			
			
			drawMarketName: function()
			{
				var chart = this;
				var settings = chart.marketHandler.marketSettings;
				
				var both = settings.pair.split("_")
				var b = both[0]
				var r = both[1]
				var a = getNames(b, r)
				var pair = a[0] + "_" + a[1]
				
				var $el = $(chart.node).find(".cur-market")
				d3.select($el.get()[0])
				.text(pair.toUpperCase() + " - " + settings.exchange.toUpperCase())
				.attr("y", 20)
				.attr("x", 20)
				.attr(textAttr)
				.attr("fill", "#bbbbbb")
				.attr("font-size", "11px")
			},
			
			
			drawMarketInfo: function(closestPoint)
			{
				var chart = this;
				var $node = chart.node;
				
				//var fontSize = chart.marketInfoFontSize
				var textAttr = {
					"fill":"#bbbbbb",
					"font-family":"Roboto",
					"font-size":"12px"
				}
				
				var $marketNameEl = $node.find(".cur-market")
				var marketNameBbox = d3.select($marketNameEl.get()[0]).node().getBBox();
				var leftPos = marketNameBbox.x + marketNameBbox.width + 10;
				var topPos = marketNameBbox.y + marketNameBbox.height - 3;
				
				leftPos = 10;
				topPos = 10;

				var openStr = "O: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.open))
				var highStr = "H: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.high))
				var lowStr = "L: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.low))
				var closeStr = "C: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.close))
				var volStr = "V: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.vol))
				
				var str = ""
				str += openStr
				str += highStr
				str += lowStr
				str += closeStr
				str += volStr

				
				var $candleInfoEl = $node.find(".candleInfo");
				d3.select($candleInfoEl.get()[0])
				.text(str)
				.attr("y", topPos)
				.attr("x", leftPos)
				.attr(textAttr)
			},
			
			
			drawCrosshairX: function(yPos)
			{
				var chart = this;
				
				if (!chart.isCrosshair)
					return;
				
				var lineLeft = chart.xAxis[0].pos.left;
				var lineRight = chart.yAxis[0].pos.left;
				var $cursor_follow_x = chart.node.find(".cursor_follow_x");

				$cursor_follow_x
				.attr("x1", lineLeft)
				.attr("x2", lineRight)
				.attr("y1", yPos + 0.5)
				.attr("y2", yPos + 0.5)
				.attr("stroke-width", 1)
				.attr("stroke", "#a5a5a5")
				.attr("pointer-events", "none");
			},
			
			
			drawCrosshairY: function(closestPoint)
			{
				var chart = this;
				
				if (!chart.isCrosshair)
					return;
				
				var $cursor_follow_y = chart.node.find(".cursor_follow_y");
				
				var xAxis = chart.xAxis[0];
				var lineTop = 0;
				var lineBottom = chart.xAxis[0].pos.top;
			
				$cursor_follow_y
				.attr("x1", closestPoint.pos.middle)
				.attr("x2", closestPoint.pos.middle)
				.attr("y1", lineTop)
				.attr("y2", lineBottom)
				.attr("stroke-width", 1)
				.attr("stroke", "#a5a5a5")
				.attr("pointer-events", "none");
			},
			
			
			hideRenders: function()
			{
				var chart = this;
				
				var $node = chart.node;
				var $candleInfoEl = $node.find(".candleInfo");
				var $cursor_follow_x = $node.find(".cursor_follow_x");
				var $cursor_follow_y = $node.find(".cursor_follow_y");
				var $priceFollowWrap = $node.find(".yAxis-follow[data-axisNum='1']");
				var $volFollowWrap = $node.find(".yAxis-follow[data-axisNum='2']");
				var $timeFollowWrap = $node.find(".xAxis-follow");

				
				$cursor_follow_x.attr("stroke-width", 0);
				$cursor_follow_y.attr("stroke-width", 0);

				$priceFollowWrap.hide()
				$volFollowWrap.hide()
				$timeFollowWrap.hide()
				
				$candleInfoEl.text(""); 
			}
			
		}
		
		

		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
	
		
		
		

	
	IDEX.makeChart = function(obj)
	{
		var node = obj.node		
		
		var volAxisHeight = "20%"
		var priceAxisHeight = "80%"
		var priceAxisTopPadding = 35;
		var yLabelStyle =
		{
			"textPadding":5,
			"fontSize":"13px",
			"fontColor":"#8C8C8C",
		};
		
		
		var chartOptions = 
		{
			chart:
			{
				node:node,
				padding:
				{
					left:0,
					right:0,
					top:0,
					bottom:0,
				},
			},
			
			
			xAxis: [
				{	
					"isXAxis":true,
					"heightInit":20,
					"widthInit":"100%",
					
					"range":40,
					"minRange":40,
					
					"padding":{
						"top":0,
						"left":10,
					},
					
					"numTicks":8,
					"tickLength":4,
					"tickStep":6,

					"labels":{
						"fontSize":"12px",
						"fontColor":"#8C8C8C"
					},
				}
			],
			
			
			yAxis: [
				{
					"heightInit":priceAxisHeight,
					"widthInit":50,
					
					"padding":
					{
						"top":priceAxisTopPadding,
						"left":20,
					},
					
					"minPadding":0.05,
					"maxPadding":0.05,
					
					"numTicks":10,
					"tickLength":7,
					
					"labels":yLabelStyle
				},
			
				{
					"heightInit":volAxisHeight,
					"widthInit":50,
					
					"padding":{
						"top":20,
						"left":20,
					},
					
					"minPadding":0.1,
					"maxPadding":0.05,
					
					"numTicks":3,
					"tickLength":7,
					
					"labels":yLabelStyle
				}
			],
			
			series: 
			[
				{
					seriesType: "candlestick",
				},
				{
					seriesType: "column",
				}
			],
			
			marketSettings:
			{
				
			},
			
		}
		
		
		obj.node.sleuthcharts(chartOptions);
		//var chart = new Sleuthcharts.Chart(chartOptions);

		
		//var chart = Sleuthcharts.getChart(node);
		//chart.changeMarket(obj);
		
		
	}

	


	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
