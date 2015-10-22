
// Created by CryptoSleuth <cryptosleuth@gmail.com>


var Sleuthcharts = {};

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
	

	
	var Chart = Sleuthcharts.Chart = function()
	{
		this.init.apply(this, arguments)
	}
	
	Chart.prototype = 
	{
		
		init: function(userOptions)
		{
			var chart = this;
			var chartOptions = userOptions.chart;
			
			chart.userOptions = userOptions;
			
			chart.node = chartOptions.node;
			chart.pointInfoDOM = chart.node.find(".chart-marketInfo");
			chart.canvas;
			chart.ctx;
			chart.infoCanvas;
			chart.infoCtx;
			chart.crosshairCanvas;
			chart.crosshairCTX;
			
			chart.padding = new Sleuthcharts.Padding();
			chart.padding = Sleuthcharts.extend(chart.padding, chartOptions.padding);
			
			chart.minPlotHeight = 200;
			chart.minPlotWidth = 400;
			chart.plotHeight = 0;
			chart.plotWidth = 0;
			chart.prevHeight = 0;
			chart.prevWidth = 0;
			
			chart.allPoints = [];
			chart.visiblePhases = [];
			
			chart.isDragging = false;
			chart.isCrosshair = true;
			chart.prevIndex = -2;
			chart.needsResize = false;
			chart.hasRenderedOnce = false;
			
			chart.plotHandler = new Sleuthcharts.PlotHandler(chart);
			chart.DOMEventHandler;
			chart.marketHandler;
			chart.series = [];
			chart.axes = [];
			chart.xAxis = [];
			chart.yAxis = [];
			
			chart.initDOM();
			chart.initCanvas();
			chart.setContainerSize();
			chart.initMarketHandler();
			chart.initAxes();
			chart.initSeries();
			chart.initDOMEventHandler();

			//chart.resizeAxis();
			//chart.updateAxisPos();
			
			chart.node.attr("data-sleuthcharts", Sleuthcharts.allCharts.length);
			Sleuthcharts.allCharts.push(chart);

			
			return chart;
		},
		
		
		
		initDOM: function()
		{
			var chart = this;
			
			chart.header = chart.node.find(".chart-header");
			
			
		},
		
		
		initCanvas: function()
		{
			var chart = this;
			var chartPositions = Sleuthcharts.getDOMPosition(chart.node);
			var minHeight = chart.minPlotHeight;
			var minWidth = chart.minPlotWidth;
			var height = chartPositions.height;
			var width = chartPositions.width;
			width = width < minWidth ? minWidth : width;
			height = height < minHeight ? minHeight : height;
			
			var makeCanvas = function()
			{
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				canvas.style.position = "absolute";
				canvas.style.top = 0;
				canvas.style.left = 0;
				//canvas.style.zIndex = 2;
				chart.node.append(canvas);
				canvas.getContext("2d").translate(0.5, 0.5);
				
				return canvas;
			}
			
			var canvas = makeCanvas();
			chart.canvas = canvas;
			chart.canvasJQ = $(canvas);
			chart.ctx = canvas.getContext("2d");
			
			
			var infoCanvas = makeCanvas();
			chart.infoCanvas = infoCanvas;
			chart.infoCTX = infoCanvas.getContext("2d");
			
			
			var crosshairCanvas = makeCanvas();
			chart.crosshairCanvas = crosshairCanvas;
			chart.crosshairCTX = crosshairCanvas.getContext("2d");
		},
		
		
		
		initMarketHandler: function()
		{
			var chart = this;
			var marketSettings = chart.userOptions.marketSettings || {};			
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
				series.init(chart, opt);
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
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].initAxisHeightWidth();
			}
		},
		
		
		
		initDOMEventHandler: function()
		{
			var chart = this;
			var DOMEventHandler = new Sleuthcharts.DOMEventHandler(chart);
			DOMEventHandler.setDOMEvents();
			
			chart.DOMEventHandler = DOMEventHandler;
		},
		
		
		
		setContainerSize: function()
		{
			var chart = this;
			var chartPadding = chart.padding;
			var isVisible = chart.node.is(":visible");
			var minHeight = chart.minPlotHeight;
			var minWidth = chart.minPlotWidth;
			
			//if (!isVisible)
			//	return;
						

			chart.prevHeight = chart.plotHeight;
			chart.prevWidth = chart.plotWidth;

			var chartPositions = Sleuthcharts.getDOMPosition(chart.node);
			chart.positions = chartPositions;
			var height = chartPositions.height;
			var width = chartPositions.width;
			
			width = width < minWidth ? minWidth : width;
			height = height < minHeight ? minHeight : height;
			
			
			chart.plotTop = chartPositions.top + chartPadding.top;
			chart.plotBottom = chartPositions.bottom - chartPadding.bottom;
			chart.plotLeft = chartPositions.left + chartPadding.left;
			chart.plotRight = chartPositions.right - chartPadding.right;
			chart.plotHeight = chart.plotBottom - chart.plotTop;
			chart.plotWidth = chart.plotRight - chart.plotLeft;
			

			chart.canvas.height = height;
			chart.canvas.width = width;
			chart.infoCanvas.height = height;
			chart.infoCanvas.width = width;
			chart.crosshairCanvas.height = height;
			chart.crosshairCanvas.width = width;
		},
		
		
		isInsidePlot: function(mouseX, mouseY)
		{
			var chart = this;
			
			var isInsideX = mouseX > chart.plotLeft && mouseX < chart.plotRight;
			var isInsideY = mouseY > chart.plotTop && mouseY < chart.plotBottom;
			
			var isInside = isInsideX && isInsideY;
			
			return isInside;
		},
		

		
		
		addSeries: function(settings)
		{			
			var chart = this;
			var seriesOptions = chart.userOptions.series;
			var numYAxis = chart.yAxis.length;

			var addedHeightInit = settings.yAxis.heightInit;
			var addedHeightPerc = parseFloat(addedHeightInit);			
			
			for (var i = 0; i < numYAxis; i++)
			{
				var loopYAxis = chart.yAxis[i];
				
				var minus = (loopYAxis.fullHeight * (addedHeightPerc / 100));
				loopYAxis.fullHeight = loopYAxis.fullHeight - minus;
				loopYAxis.height = loopYAxis.fullHeight - (loopYAxis.padding.top + loopYAxis.padding.bottom);	
			}
			
			var yAxisOptions = settings.yAxis;
			yAxisOptions.isXAxis = false;
			yAxisOptions.index = chart.yAxis.length;
			
			var axis = new Sleuthcharts.Axis(chart, yAxisOptions);
			chart.yAxis.push(axis);
			
			//axis.initAxisHeightWidth();
			axis.fullHeight = ((addedHeightPerc/100) * (chart.plotHeight - chart.xAxis[0].fullHeight));
			axis.height = axis.fullHeight - (axis.padding.top + axis.padding.bottom);
			axis.width = chart.yAxis[0].width;
			axis.fullWidth = chart.yAxis[0].fullWidth;
			
			chart.axes = chart.xAxis.concat(chart.yAxis);

			var seriesOptions = settings.series;
			seriesOptions.index = chart.series.length;
			var seriesType = seriesOptions.seriesType;
			var seriesClass = Sleuthcharts.seriesTypes[seriesType];
			
			var series = new seriesClass();
			series.init(chart, seriesOptions);
			chart.series.push(series);
	
	
			chart.updateChart().done(function()
			{
				//chart.redraw();
			})
			
		},
		
		
		
		getAllSeriesData: function()
		{
			var dfd = new $.Deferred();
			var chart = this;
			var allSeries = chart.series;
			var len = allSeries.length;
			
			chart.getAllSeriesDataLoop(0, function(ret)
			{
				if (ret)
					dfd.resolve();
				else
					dfd.reject();
			})
			
			return dfd.promise();
		},
		
		
		
		getAllSeriesDataLoop: function(index, callback)
		{
			var chart = this;
			var allSeries = chart.series;
			var len = allSeries.length;
			var series = allSeries[index];
			
			series.getSeriesData().done(function()
			{
				if (index == len - 1)
				{
					callback(true);
				}
				else
				{
					chart.getAllSeriesDataLoop(index + 1, callback)
				}
			}).fail(function()
			{
				callback(false);
			})
			
		},
		
		
		
		updateChart: function()
		{
			var dfd = new $.Deferred();
			var chart = this;
			var marketHandler = chart.marketHandler;
			var plotHandler = chart.plotHandler;
			
			chart.toggleLoading(true);
			chart.editLoading();
			chart.prevIndex = -2;

			chart.ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);

			
			chart.getAllSeriesData().done(function()
			{				
				plotHandler.setDefaultMarketDataRange();
				chart.hasRenderedOnce = true;
				chart.redraw();
				chart.toggleLoading(false);
				
				dfd.resolve();
				
			}).fail(function()
			{
				chart.editLoading("Error loading market " + marketHandler.marketSettings.market.marketName);
			})
			
			
			
			return dfd.promise();
		},
		
		
		
		redraw: function()
		{
			var chart = this;
			var plotHandler = chart.plotHandler;
			var isVisible = chart.node.is(":visible");
			
			if (!isVisible)
				return;
			
			if (chart.hasRenderedOnce)
			{
				chart.ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);
				
				chart.setContainerSize();				
				chart.resizeAxis();
				chart.updateAxisPos();
				chart.equalizeYAxisWidth();

				plotHandler.calcPointWidth();
				plotHandler.getPointPositions();
				
				chart.updateAxisTicks();
				chart.drawAxisLines();
				
				chart.drawSeriesPoints();
			}
		},
		
		
		
		equalizeYAxisWidth: function()
		{
			var chart = this;
			var allSeries = chart.series;
			var biggestWidth = 0;
			var oldw = chart.yAxis[0].fullWidth;
			
			for (var i = 0; i < allSeries.length; i++)
			{
				var yAxis = allSeries[i].yAxis;
				
				var paddedMax = yAxis.max + (yAxis.max * (yAxis.maxPadding))
				var paddedMin = yAxis.min - (yAxis.min * (yAxis.minPadding))
				
				var scale = d3.scale.linear()
				.domain([paddedMin, paddedMax])
				.range([yAxis.height, yAxis.pos.top])
				
				var tickVals = scale.ticks(yAxis.numTicks) //.map(o.tickFormat(8))
				
				
				var maxTextWidth = Sleuthcharts.getMaxTextWidth(tickVals, yAxis.labels.fontSize, yAxis.ctx)
				var textPadding = yAxis.labels.textPadding;
				var combinedWidth = maxTextWidth + (yAxis.tickLength * 2) + (textPadding * 2);
				var newAxisWidth = combinedWidth;

				biggestWidth = newAxisWidth > biggestWidth ? newAxisWidth : biggestWidth;
			}
			for (var i = 0; i < allSeries.length; i++)
			{
				var yAxis = allSeries[i].yAxis
				//yAxis.widthInit = biggestWidth
				yAxis.width = biggestWidth;
				yAxis.fullWidth = yAxis.width + yAxis.padding.left + yAxis.padding.right;
			}
			
			var xAxis = chart.xAxis[0];
			var diff = oldw - biggestWidth;
			xAxis.width = xAxis.width + diff;
			xAxis.fullWidth = xAxis.width + xAxis.padding.left + xAxis.padding.right;
		},
		
		

		drawSeriesPoints: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.series.length; i++)
			{
				var series = chart.series[i];
				series.drawPoints();
				series.seriesTab.updatePositions();
				//highLowPrice();

			}
		},
		
		
		
		updateAxisMinMax: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].updateMinMax();
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
		
		

		toggleLoading: function(isLoading)
		{
			var chart = this;
			var $node  = chart.node;
			var $loading = $node.find(".chart-loading");
			
			if (isLoading)
			{
				$loading.show();
			}
			else
			{
				$loading.hide()
			}
		},
		
		
		
		editLoading: function(text)
		{
			var chart = this;
			var $node  = chart.node;
			var $loading = $node.find(".chart-loading");
			
			text = typeof text === "undefined" ? "Loading..." : text;
			$loading.find("span").text(text);
		},
		
		
		
		drawMarketName: function()
		{
			var chart = this;
			var marketHandler = chart.marketHandler;
			var marketSettings = marketHandler.marketSettings;
			
			var pair = marketSettings.market.marketName;
			var exchange = marketSettings.exchange;
			
			var $el = chart.node.find(".chart-marketName span");
			
			$el.text(pair.toUpperCase() + " - " + exchange.toUpperCase());
		},
		
		
		
		drawMarketInfo: function(closestPoint)
		{
			var chart = this;
			var $node = chart.node;

			var openStr = "O: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.open))
			var highStr = " H: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.high))
			var lowStr = " L: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.low))
			var closeStr = " C: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.close))
			var volStr = " V: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.vol))
			
			var str = ""
			str += openStr
			str += highStr
			str += lowStr
			str += closeStr
			str += volStr

			
			var $candleInfoWrap = chart.pointInfoDOM.find(".chart-candleInfo");
			var $candleInfoText = $candleInfoWrap.find("span");
			$candleInfoText.text(str);
			
			$candleInfoWrap.addClass("active");
		},
		
		
		
		drawCrosshairX: function(yPos)
		{
			var chart = this;
			var canvas = chart.crosshairCanvas
			var ctx = chart.crosshairCTX;
			
			if (!chart.isCrosshair)
				return;
			
			var lineLeft = chart.xAxis[0].pos.left;
			var lineRight = chart.yAxis[0].pos.left;
			
			//ctx.clearRect(0, 0, canvas.width, canvas.height);

			
			var d = 
			[
				"M", lineLeft, yPos + 0.5, 
				"L", lineRight, yPos + 0.5,  
			]

			var pathStyle = {};
			pathStyle.strokeColor = "#a5a5a5";
			pathStyle.lineWidth = 1;

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
		
		
		drawCrosshairY: function(closestPoint)
		{
			var chart = this;
			var canvas = chart.crosshairCanvas
			var ctx = chart.crosshairCTX;
			
			if (!chart.isCrosshair)
				return;
			
			
			var xAxis = chart.xAxis[0];
			var lineTop = 0;
			var lineBottom = chart.xAxis[0].pos.top;
			
			var d = 
			[
				"M", closestPoint.pos.middle, lineTop, 
				"L", closestPoint.pos.middle, lineBottom,  
			]

			var pathStyle = {};
			pathStyle.strokeColor = "#a5a5a5";
			pathStyle.lineWidth = 1;

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
		
		
		hideRenders: function()
		{
			var chart = this;
			
			var $candleInfoWrap = chart.pointInfoDOM.find(".chart-candleInfo");
			$candleInfoWrap.removeClass("active");
			
			chart.crosshairCTX.clearRect(0, 0, chart.crosshairCanvas.width, chart.crosshairCanvas.height);
			chart.infoCTX.clearRect(0, 0, chart.infoCanvas.width, chart.infoCanvas.height);
		}
		
	}
	
	

	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));



$(window).resize(function(e)
{	
	return;
	var prevWindowHeight = $(window).height();
	var prevWindowWidth = $(window).width();
	
	
	setTimeout(function()
	{
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		
		//console.log([prevWindowHeight, windowHeight])
		
		if (windowHeight != prevWindowHeight || windowWidth != prevWindowWidth)
		{

		}
		else
		{
			var allCharts = Sleuthcharts.allCharts;
			var len = allCharts.length;
			
			for (var i = 0; i < len; i++)
			{
				var chart = allCharts[i]

				var $chartNode = chart.node;
				var isVisible = $chartNode.is(":visible")

				if (!isVisible)
				{
					chart.needsResize = true;
				}
				else
				{
					chart.redraw();
				}
			}
		}
	}, 300)
})



