





var IDEX = (function(IDEX, $, undefined) 
{   

	IDEX.allcharts = {};
	Sleuthcharts = {};



	(function(Sleuthcharts) 
	{
		
	}(Sleuthcharts));
	
	
		
	IDEX.ChartSettings = function(obj) 
	{
		this.base = "6854596569382794790";
		this.rel = "6932037131189568014";
		this.basename = "SkyNET";
		this.relname = "jl777hodl";
		this.numticks = "100";
		this.isvirtual = false;
		this.flip = false;
		this.isNew = false;
		
		this.pair = "6932037131189568014_NXT";
		this.pairName = ""
		this.exchange = "nxtae";
		this.barWidth = "100";
		this.bars = "tick"
		this.chartType = "candlestick"
		
		var color1 = "#FFB669"
		var color2 = "#D4F6FF"
		
		this.isInd = true;
		this.candleInd = [
			{
				type:"ema",
				color:color1,
				price:"cl",
				len:"7",
				axisIndex:0
			},
			{
				type:"ema",
				color:color2,
				price:"cl",
				len:"20",
				axisIndex:0
			}
		]
		
		this.volInd = [
			{
				type:"ema",
				color:color1,
				price:"vol",
				len:"7",
				axisIndex:1
			},
			{
				type:"ema",
				color:color2,
				price:"vol",
				len:"20",
				axisIndex:1
			}
		]
		
		
		IDEX.constructFromObject(this, obj);
	}
	
	
	IDEX.Chart = function(obj) 
	{
		this.baseid = "6854596569382794790"
		this.relid = "6932037131189568014"
		this.basename = "SkyNET"
		this.relname = "jl777hodl"
		this.isvirtual = false
		this.flip = false
		this.isNew = false
		
		this.tradeData = [];
		this.phases = [];
		
		this.timespan = 0;
		this.barWidth = 0;
		this.numBars = 0;
		
		this.startTime = 0;
		this.endTime = 0;
		this.maxTimespan = 0;
		this.visibleTimespan = 0;

		this.series = []
		this.xAxis = []
		this.yAxis = []
		
		this.draggingPos = 0;
		this.isDragging = false;
		
		this.isMain = false;
		this.isVolInd = false;
		this.chartType = "candlestick";
		
		this.settings = {};
		this.marketInfoFontSize = "13px"
		
		this.colorone = "#410947"
		this.colortwo = "#B726C7"
		
		
		this.isCrosshair = true;
		this.isDrawing = false;
		this.isDrawingLine = false;
		this.isFib = false;
		this.isFibDrawing = false;
		
		this.drawFib = [];
		
		this.drawingLine;
		this.drawPoints = [];
		this.curDrawPoint = [];
		
		IDEX.constructFromObject(this, obj);
		//this.addChart(this);

	}

		
		
		
	IDEX.makeChartDefault = function(node)
	{
		var dfd = new $.Deferred();
		
		IDEX.allcharts[node] = {
			"sleuthchart":null,
			"settings":new IDEX.ChartSettings()
		}
		
		IDEX.updateChart(node).done(function()
		{
			dfd.resolve();
		})
		
		return dfd.promise();
	}
	
	IDEX.makeChart = function(obj)
	{
		var dfd = new $.Deferred();
		
		var node = obj.node
		
		if (!node in IDEX.allcharts)
		{	
			IDEX.allcharts[node] = {
				"sleuthchart":null,
				"settings":new IDEX.ChartSettings()
			}
		}
		var chart = IDEX.allcharts[node];
		var settings = chart.settings
		
		var pair = obj.baseid + "_" + obj.relid
		
		if (obj.relid == 5527630)
			pair = obj.baseid + "_" + "NXT"
		
		settings.pair = pair;
		settings.exchange = obj.exchange;
		
		IDEX.updateChart(node).done(function()
		{
			dfd.resolve();
		})
		
		//console.log(pair)
		//console.log(node)
		//var $el = $(node);
		//var isVisible = $el.is(":visible")
		
		return dfd.promise();
	}
	
	
	
	
		IDEX.initMainChart = function(chart) 
		{
			//siteOptions = (typeof siteOptions === "undefined") ? {} : siteOptions;
			
			
			var obj = IDEX.getXAxisNodes(chart.node, 1)
			

			var volAxisHeight = "20%"
			var priceAxisHeight = "80%"
			var priceAxisTopPadding = 35;
			//chart.isVolInd = true;

			
			
			var xAxisOpt = {
				"chart":chart,
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
					"containerID":"xAxisLabels",
				},
				
				"nodes":obj,
				
				"isXAxis":true,
			}
			
			var obj = IDEX.getYAxisNodes(chart.node, 1)
			var priceAxisOpt = {
				"chart":chart,
				"axisIndex":1,
				"heightInit":priceAxisHeight,
				"widthInit":50,
				
				"padding":{
					"top":priceAxisTopPadding,
					"left":20,
				},
				
				"minPadding":0.05,
				"maxPadding":0.05,
				
				"numTicks":10,
				"tickLength":7,
				
				"labels":{
					"textPadding":5,
					"fontSize":"13px",
					"fontColor":"#8C8C8C",
					"containerID":"yAxisLabels",
				},
				
				"nodes":obj,

			}
			
			var obj = IDEX.getYAxisNodes(chart.node, 2)
			var volAxisOpt = {
				"chart":chart,
				"axisIndex":2,
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
				
				"labels":{
					"textPadding":5,
					"fontSize":"13px",
					"fontColor":"#8C8C8C",
					"containerID":"volAxisLabels",
				},
				
				"nodes":obj,
				
				
			}
			
			var xAxis = new IDEX.Axis(xAxisOpt);
			var priceAxis = new IDEX.Axis(priceAxisOpt)
			var volAxis = new IDEX.Axis(volAxisOpt)
			
			
			var candleSeriesOpt = {
				"xAxis":xAxis,
				"yAxis":priceAxis,
			};
			
			var volSeriesOpt = {
				"xAxis":xAxis,
				"yAxis":volAxis,
			};
			
			var candleSeries = new IDEX.Series(candleSeriesOpt)
			var volSeries = new IDEX.Series(volSeriesOpt)

			chart.xAxis.push(xAxis)
			chart.yAxis.push(priceAxis)
			chart.yAxis.push(volAxis)
			chart.series.push(candleSeries)
			chart.series.push(volSeries)
			
			return chart;
		}
		
		
		
	IDEX.updateChart = function(node)
	{
		$("#"+node).unbind()

		var dfd = new $.Deferred();
		
		var chartWrap = IDEX.allcharts[node];
		var settings = chartWrap.settings;
		var barWidth = settings.barWidth;
		var isMain = node == "main_menu_chart";
		var isTime = settings.bars == "time"
		
		toggleLoading(node, true)
		var chart = new IDEX.Chart();
		chart.settings = settings
		var $drawingGroup = $(node).find(".drawingLines");
		$drawingGroup.empty();
		
		IDEX.getData(settings).done(function(data)
		{	
			IDEX.getBothInds(chart, settings).done(function(indData)
			{			
				data = data.results
				
				var both = IDEX.getStepOHLC(data, isTime);
				var ohlc = both[0]
				var vol = both[1]
				
				
				chart.barWidth = barWidth;
				IDEX.allcharts[node].sleuthchart = chart;
				chart.isMain = isMain

				chart.node = "#" + node;
				chart = IDEX.initMainChart(chart)

				chart.redraw = redraw
				chart.resizeAxis = resizeAxis
				chart.updateAxisPos = updateAxisPos
				chart.phases = ohlc
				
				chart.chartType = settings.chartType
				
				if (settings.chartType == "candlestick")
				{
					$(chart.node).find(".mainline").empty()
					chart.drawCandleSticks = drawCandleSticks
					chart.chartType = "candlestick"
				}
				else if (settings.chartType == "line")
				{
					$(chart.node).find(".boxes").empty()
					chart.drawCandleSticks = drawLineArea
					chart.chartType = "line"

				}
				else if (settings.chartType == "ohlc")
				{
					$(chart.node).find(".mainline").empty()
					chart.drawCandleSticks = drawCandleSticks
					chart.chartType = "ohlc"
				}
				else if (settings.chartType == "area")
				{
					$(chart.node).find(".boxes").empty()
					chart.drawCandleSticks = drawLineArea
					chart.chartType = "area"
				}
				
				chart.prevIndex = -1;
				
				IDEX.addWheel(chart);
				IDEX.addMove(chart);
				IDEX.addMouseout(chart);
				IDEX.addMouseup(chart);
				IDEX.addMousedown(chart);
				IDEX.addDrawing(chart);
				
				resizeAxis(chart);
				updateAxisPos(chart)

				IDEX.initXAxis(chart);
				
				redraw(chart)
				
				if (chart.settings.isInd)
					IDEX.drawBothInds(chart)

				
				drawMarketName(chart, settings)
				
				toggleLoading(node, false)
				
				dfd.resolve();
			})
		})
		
		return dfd.promise()
	}
		
		
		
	function redraw(chart)
	{
		if (!chart.xAxis.length)
			return
		
		var priceAxis = chart.yAxis[0];
		var volAxis = chart.yAxis[1];
		var xAxis = chart.xAxis[0];
		

		IDEX.getPointPositions(chart);
		IDEX.getNeededWidth(priceAxis)
		resizeAxis(chart)
		updateAxisPos(chart);
		
		updateAxisMinMax(chart.visiblePhases, xAxis.minIndex, xAxis.maxIndex, chart)
		
		IDEX.getPointPositions(chart);
		IDEX.getNeededWidth(priceAxis)
		resizeAxis(chart)
		updateAxisPos(chart);
				
				
		chart.drawCandleSticks(chart);
		drawVolBars(chart);
		
		if (chart.settings.isInd)
		{
			IDEX.drawBothInds(chart)
		}

		updateAxisTicks(chart);
		drawAxisLines(chart);
		
		highLowPrice(chart);
		redrawLines(chart);
	}
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
