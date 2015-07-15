

var IDEX = (function(IDEX, $, undefined) 
{
	
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

	IDEX.allcharts = {
		"main_menu_chart":{
			"sleuthchart":null,
			"settings":new IDEX.ChartSettings()
		},
		"ex_chart":{
			"sleuthchart":null,
			"settings":new IDEX.ChartSettings()
		},
	};	
	
	var textAttr = {
		"fill":"#D3D3D3",
		"font-family":"Roboto",
		"font-size":"13px"
	}
	
	var boxAttr = {
		"fill":"#black",
		"stroke":"#a5a5a5",
		"stroke-width":1
	}
	
	
	IDEX.makeTile = function(node)
	{
		var obj = {
			"sleuthchart":null,
			"settings":new IDEX.ChartSettings()
		}
		IDEX.allcharts[node] = obj;
		
		//updateChart(node)
	}
	
	
	$("#main_grid").on("click", ".chart-interval-trig div", function(e)
	{
		var $cell = $(this).find("span")
		
		$(this).parent().find("span").removeClass("active");
		$cell.addClass("active");
		
		var node = $(this).closest(".chart-header").attr("data-chart")
		var chart = IDEX.allcharts[node];
		var settings = chart.settings;
		var confVal = $cell.attr("data-confval");
		var confType = $(this).closest(".mm-interval-type").attr("data-inttype");
		
		settings.barWidth = confVal;
		settings.bars = confType;
		
		IDEX.updateChart(node)
	})
	
	$("#main_grid").on("click", ".chart-time-dropdown-wrap li", function()
	{
		var $wrap = $(this).closest(".chart-time-wrap");
		var isSwitch = $(this).hasClass("time-change");		
		var val = $(this).attr("data-val");	
	
		if (isSwitch)
		{
			var confType = val;
			$wrap.find("ul").removeClass("active");
			var $otherList = $wrap.find("ul[data-inttype='"+val+"']")
			var $otherCell = $otherList.find("li.active")
			val = $otherCell.attr("data-val");
			var title = $otherCell.text();
			$otherList.addClass("active");
			
		}
		else
		{
			var $list = $(this).closest("ul");
			var title = $(this).text();
			var confType = $list.attr("data-inttype");


			$list.find("li").removeClass("active");
			$(this).addClass("active");
		}
		
		$wrap.find(".chart-time-button-title span").text(title);

		var node = $(this).closest(".chart-header").attr("data-chart")
		var chart = IDEX.allcharts[node];
		var settings = chart.settings;
		var confVal = val
		
		settings.barWidth = confVal;
		settings.bars = confType;
		
		IDEX.updateChart(node)
	})
	
	
	$("#main_grid").on("click", ".chart-header .mm-chart-config li", function(e)
	{
		$(this).parent().find("li").removeClass("active");
		$(this).addClass("active");
		
		var confType = $(this).parent().attr("data-config")
		var confVal = $(this).attr("data-val")
		
		var $wrap = $(this).closest(".chart-header");
		var node = $wrap.attr("data-chart");
		
		var chart = IDEX.allcharts[node];
		var settings = chart.settings;
		var sleuthchart = chart.sleuthchart
		
		
		if (sleuthchart !== null)
		{
			console.log(confType)
			console.log(confVal)
			
			if (confType == "charttype")
			{
				settings.chartType = confVal
				sleuthchart.chartType = settings.chartType
					
				if (settings.chartType == "line")
				{
					$("#" + node).find(".boxes").empty()
					sleuthchart.drawCandleSticks = drawInd
					sleuthchart.chartType = "line"
				}
				else if (settings.chartType == "candlestick")
				{
					$("#" + node).find(".mainline").empty()
					sleuthchart.drawCandleSticks = drawCandleSticks
				}
				else if (settings.chartType == "ohlc")
				{
					$("#" + node).find(".mainline").empty()
					sleuthchart.drawCandleSticks = drawCandleSticks
				}
				else if (settings.chartType == "area")
				{
					$("#" + node).find(".boxes").empty()
					sleuthchart.drawCandleSticks = drawInd
					sleuthchart.chartType = "area"
				}
				
				redraw(sleuthchart)
				
			}
			else if (confType == "bartype")
			{
				$wrap.find(".mm-interval-type").removeClass("active")
				var $intervalList = $wrap.find(".mm-interval-type[data-inttype='"+confVal+"']")
				$intervalList.addClass("active")
				$intervalList.find("span.active").trigger("click")
			}
			else if (confType == "indicator")
			{
				var indicatorType = confVal
				
				if (indicatorType == "none")
				{
					$(sleuthchart.node).find(".volInd").empty()
					$(sleuthchart.node).find(".candleInd").empty()

					sleuthchart.settings.isInd = false;
					toggleLoading(node, false)
					redraw(sleuthchart)
				}
				else
				{
					sleuthchart.settings.isInd = true;
					settings.candleInd[0].type = indicatorType
					settings.candleInd[1].type = indicatorType
					settings.volInd[0].type = indicatorType
					settings.volInd[1].type = indicatorType
					
					if (indicatorType == "bollin")
					{
						settings.candleInd[0].len = "1|2"
						settings.candleInd[1].len = "1|2"
						settings.volInd[0].len = "1|2"
						settings.volInd[1].len = "1|2"
					}
					else
					{
						settings.candleInd[0].len = "7"
						settings.candleInd[1].len = "20"
						settings.volInd[0].len = "7"
						settings.volInd[1].len = "20"
					}
					
					sleuthchart.settings = settings
					toggleLoading(node, true)
					IDEX.getBothInds(sleuthchart, settings).done(function()
					{
						toggleLoading(node, false)
						redraw(sleuthchart)
					});
				}
				
			}
			else if (confType == "timescale")
			{
				
			}
			else if (confType == "depth")
			{
				sleuthchart.yAxis[0].minPadding = confVal;
				sleuthchart.yAxis[0].maxPadding = confVal;
				sleuthchart.redraw(sleuthchart)	
			}			
		}
		
	})

	
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
	
	
	IDEX.killChart = function()
	{
		
	}
	
	
	function drawInd(chart)
	{
		var $selector = $(chart.node).find(".mainline")
		var rawSelector = $selector.get()[0]
		var indic = chart.phases
		var priceAxis = chart.yAxis[0]
		var xAxis = chart.xAxis[0]
		
		$selector.empty()

		var colorone = "#2B8714"
		var colortwo = "#54BF39"
		colorone = chart.colorone
		colortwo = chart.colortwo
		
		var visInd = indic.slice(xAxis.minIndex, xAxis.maxIndex+1)
		var flow = []
		var positions = []

		for (var i = 0; i < visInd.length; i++)
		{
			var candle = chart.pointData[i];
			var price = visInd[i].close;
			var pos = Math.floor(priceAxis.getPos(price));
			positions.push({"x":candle.pos.middle, "y":pos})
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
				
		if (chart.chartType == "area")
		{
			d3.select(rawSelector)
			.append("path")
			.attr("d", area(positions))
			.attr("stroke-width", 0)
			.attr("fill", colorone)
			.attr("fill-opacity", 0.7)
		}

		var d = lineFunc(positions)
		
		d3.select(rawSelector)
		.append("path")
		.attr("d", d)
		.attr("stroke", colortwo)
		.attr("stroke-width", "1.5px")
		.attr("fill", "none")
		//.attr("shape-rendering", "crispEdges");
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
					chart.drawCandleSticks = drawInd
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
					chart.drawCandleSticks = drawInd
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
				resetDropdown();
				
				dfd.resolve();
			})
		})
		
		return dfd.promise()
	}
	
	
	function resizeAxis(chart)
	{
		chart.yAxis[0].resizeYAxis()
		chart.yAxis[1].resizeYAxis()
		chart.xAxis[0].resizeXAxis()
	}
	
	function updateAxisPos(chart)
	{
		chart.yAxis[0].updateYAxisPos()
		chart.yAxis[1].updateYAxisPos()
		chart.xAxis[0].updateXAxisPos()	
	}
	
	function updateAxisTicks(chart)
	{
		chart.yAxis[0].makeYAxis()
		chart.yAxis[1].makeYAxis()
		chart.xAxis[0].makeXAxis()	
	}
	
	function drawAxisLines(chart)
	{
		chart.yAxis[0].drawYAxisLines()
		chart.yAxis[1].drawYAxisLines()
		chart.xAxis[0].drawXAxisLines()	
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
	
	
	function redrawLines(chart)
	{
		var node = chart.node;
		var $drawingGroup = $(node).find(".drawingLines");
		$drawingGroup.empty();
		
		var d3DrawingGroup = d3.select($drawingGroup.get()[0])
		
		var lineAttr = {
			"stroke-width": 1.5,
			"stroke": "#999999"
		}
		
		var priceAxis = chart.yAxis[0];
		var xAxis = chart.xAxis[0];
		
		for (var i = 0; i < chart.drawPoints.length; i++)
		{
			var drawPoint = chart.drawPoints[i];
			
			if (drawPoint.length != 2)
				continue;
			
			var positions = [];
			
			for (var j = 0; j < drawPoint.length; j++)
			{
				var linePoint = drawPoint[j];
				var yPos = priceAxis.getPos(linePoint.price);
				var xPoint = IDEX.getXPoint(chart.pointData, linePoint.time);
				
				var xPos = xPoint.pos.middle;
				
				positions.push({"x":xPos, "y":yPos});
			}
			
			d3DrawingGroup.append("line")
			.attr("x1", positions[0].x)
			.attr("y1", positions[0].y)
			.attr("x2", positions[1].x)
			.attr("y2", positions[1].y)
			.attr(lineAttr);
		}
					
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
	
	
	function updateAxisMinMax(vis, startIndex, endIndex, chart)
	{
		var xAxis = chart.xAxis[0]
		
		if (xAxis.calcPointWidth(vis))
		{
			chart.visiblePhases = vis;

			xAxis.updateXMinMax(startIndex, endIndex)
			for (var i = 0; i < chart.yAxis.length; i++)
			{
				var temp = i == 0;
				
				chart.yAxis[i].updateYMinMax(temp)
			}
		}
	}
	
	
	function resizeHandler(chart)
	{
		var xAxis = chart.xAxis[0];
		resizeAxis(chart)
		updateAxisPos(chart)
		
		updateAxisMinMax(chart.visiblePhases, xAxis.minIndex, xAxis.maxIndex, chart)


		redraw(chart)
	}
	
	IDEX.addResize = function(chart)
	{
		var node = chart.node
		var $a = $(chart.node).parent()

		$(chart.node).resize(function(e)
		{
			resizeHandler(chart)
		})
	}
	
	$(window).resize(function(e)
	{
		for (key in IDEX.allcharts)
		{
			var chart = IDEX.allcharts[key].sleuthchart

			if (!chart || !chart.xAxis.length)
			{
				continue;
			}
			else
			{
				doSetTimeout(chart);
			}
		}
	})
	
	function doSetTimeout(chart)
	{
		setTimeout(function()
		{
			var $el = $(chart.node);
			var isVisible = $el.is(":visible")

			if (!isVisible)
			{

			}
			else
			{
				resizeHandler(chart);
			}
			
		}, 200)
	}
	
	
	IDEX.initXAxis = function(chart)
	{
		var xAxis = chart.xAxis[0]
		var allPhases = chart.phases;
		var vis = []
		
		var numShow = xAxis.range;
		var minRange = xAxis.minRange

		var startIndex = 0;
		var endIndex = allPhases.length - 1;
		
		
		if (allPhases.length > numShow)
			startIndex = allPhases.length - numShow;
		
		vis = allPhases.slice(startIndex);
		
		if (xAxis.calcPointWidth(vis) || true);
		{
			chart.visiblePhases = vis;
			
			xAxis.dataMin = allPhases[0].startTime;
			xAxis.dataMax = allPhases[allPhases.length-1].startTime
			
			//updateAxisMinMax(vis, startIndex, endIndex)
			xAxis.updateXMinMax(startIndex, endIndex)
			for (var i = 0; i < chart.yAxis.length; i++)
			{
				var temp = i == 0;
				
				chart.yAxis[i].updateYMinMax(temp)
			}
		}
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
	
	
    function drawCandleSticks(chart)
    {
		var $boxes = $(chart.node).find(".boxes")
		var box = d3.select($boxes.get()[0])
		
		var xAxis = chart.xAxis[0]
		var allPoints = chart.pointData;
		
		var pointsLength = allPoints.length;
		var pointWidth = xAxis.pointWidth;
		
		$boxes.empty();
		
		//var a = Date.now()
		
	    for (var i = 0; i < pointsLength; i++)
		{
			var point = allPoints[i];
			var phase = point.phase;
			var pos = point.pos;
			
			var closedHigher = phase.close > phase.open;
			
			var strokeColor = closedHigher ? "#19B34C" : "#D12E2E"; //d00
			var fillColor = closedHigher ?  "transparent" : "#9C0505";
			
			//console.log(String(pointsLength) + " " + String(pos.right - pos.left))
			var topBody = pos.topBody;
			var bottomBody = pos.bottomBody;
			if (pointWidth <= 2 && closedHigher)
			{
				//console.log(xAxis.pointWidth)
				fillColor = "transparent"
			}
			if (pointWidth <= 2)
			{
				topBody = pos.topLeg;
				bottomBody = pos.bottomLeg;
			}
			
			if (chart.chartType == "candlestick")
			{
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
			}
			if (chart.chartType == "ohlc")
			{
				var openPos = closedHigher ? pos.bottomBody : pos.topBody
				var closePos = closedHigher ? pos.topBody : pos.bottomBody
				var leftPos = (pos.left - 0.5) - (xAxis.pointPadding/2)
				var rightPos = (pos.right + 0.5) + (xAxis.pointPadding/2)

				strokeColor = "#66CCCC";
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
			}

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
		
		if (false)
		{
			$boxes.find("path").on("mouseup", function(e)
			{
				var node = $(this).closest("svg").attr("id")
				//console.log(node)
				
				var chart = IDEX.allcharts[node]
				//console.log(chart)
				var sleuthchart = chart.sleuthchart
				var settings = chart.settings;
					
				if (IDEX.isInspect && sleuthchart.isMain)
				{
					
					var index = $(this).index()
					//console.log(index)
					//var box = d3.select($(this).get()[0])
					//console.log(box)
					//box.attr("class", "inspectedHover");
					

					
					var mouseX = e.pageX
					var mouseY = e.pageY
					var offsetX = $(sleuthchart.node).offset().left;
					var offsetY = $(sleuthchart.node).offset().top;
					var insideX = mouseX - offsetX
					var insideY = mouseY - offsetY


				
					var closestPoint = IDEX.getPoint(sleuthchart.pointData, insideX)
					
					//console.log(closestPoint)
					IDEX.makeCandleArea(closestPoint, chart);
				}
			})
		}
		
		/*
		$boxes.find("path").on("mouseout", function()
		{
			if (IDEX.isInspect)
			{
				var index = $(this).index()
				console.log(index)
				var box = d3.select($(this).get()[0])
				
				$(this).attr('class', function(index, classNames) {
					return classNames.replace('inspectedHover', '');
				});
			}
		})*/
		//console.log(Date.now() - a)	
    }
	
	

	function drawVolBars(chart)
	{
		var $volbars = $(chart.node).find(".volbars")
		var volBars = d3.select($volbars.get()[0])
		
		var xAxis = chart.xAxis[0];
		var volAxis = chart.yAxis[1];
		var allPoints = chart.pointData;
		
		var pointsLength = allPoints.length;
		var pointWidth = xAxis.pointWidth;
		
	    $volbars.empty();

		//var a = Date.now()
		
	    for (var i = 0; i < pointsLength; i++)
		{
			var point = allPoints[i];
			var phase = point.phase;
			var pos = point.pos;
			
			var volTop = volAxis.getPos(phase.vol);
			var volHeight = volAxis.pos.bottom - volTop;
			
			var closedHigher = phase.close > phase.open;
			
			var strokeColor = closedHigher ? "#19B34C" : "#d00"; //d00
			var fillColor = closedHigher ?  "transparent" : "#9C0505";
			
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
			/*.append("path")
			.attr("d", d.join(" "))
			.attr("fill", fillColor)
			.attr("stroke", strokeColor)
			.attr("stroke-width", 1)
			.attr('shape-rendering', "crispEdges")*/
		}
	}
	


	function highLowPrice(chart)
	{
		if (!chart.xAxis.length)
			return
		
		
		var points = chart.pointData
		var highestPrice = null;
		var lowestPrice = null;

		for (var i = 0; i < points.length; ++i)
		{
			if (chart.chartType == "candlestick" || chart.chartType == "ohlc")
			{
				if (highestPrice === null || points[i].phase.high >= highestPrice.phase.high)
				{
					highestPrice = points[i]
				}
				if (lowestPrice === null || points[i].phase.low <= lowestPrice.phase.low)
				{
					lowestPrice = points[i]
				}
			}
			else if (chart.chartType == "line" || chart.chartType == "area")
			{
				if (highestPrice === null || points[i].phase.close >= highestPrice.phase.close)
				{
					highestPrice = points[i]
				}
				if (lowestPrice === null || points[i].phase.close <= lowestPrice.phase.close)
				{
					lowestPrice = points[i]
				}
			}
		}
				
		var fontAttr = {
			"fill": "#B0B0B0",
			"font-family": "Roboto",
			"font-size": "13px"
		}
		
		if (chart.chartType == "line" || chart.chartType == "area")
		{
			var topPos = highestPrice.phase.close > highestPrice.phase.open ? highestPrice.pos.topBody : highestPrice.pos.bottomBody 
			var bottomPos = lowestPrice.phase.close > lowestPrice.phase.open ? lowestPrice.pos.topBody : lowestPrice.pos.bottomBody 
		}
		else if (chart.chartType == "candlestick" || chart.chartType == "ohlc")
		{
			var topPos = highestPrice.pos.topLeg - 2
			var bottomPos = lowestPrice.pos.bottomLeg + 2
		}
		
		var $highestPriceEl = $(chart.node).find(".highestPrice");
		var $lowestPriceEl = $(chart.node).find(".lowestPrice");

		$highestPriceEl
		.text("- " + String(highestPrice.phase.high))
		.attr('x', highestPrice.pos.middle)
		.attr('y', topPos)
		.attr(fontAttr)
		
		$lowestPriceEl
		.text("- " + String(lowestPrice.phase.low))
		.attr('x', lowestPrice.pos.middle)
		.attr('y', bottomPos)
		.attr(fontAttr)
	}
	
	
	
	IDEX.addWheel = function(chart)
	{
		var node = chart.node
		
		$(chart.node).on('mousewheel DOMMouseScroll', function(e)
		{
			e.preventDefault()
			e.stopPropagation()
			//console.log(e.target)
			tryZoom(chart, e)
		})
	}
	
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
	
	
	
	function drawMarketName(chart, settings)
	{
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
	}
	
	
	$(".browse-chart-wrap").on("mouseup", ".cur-market", function(e)
	{
		var node = $(this).closest("svg").attr("id")
		//console.log(node)
		
		var chart = IDEX.allcharts[node]
		//console.log(chart)
		var sleuthchart = chart.sleuthchart
		var settings = chart.settings;
			
		if (IDEX.isInspect && sleuthchart.isMain)
		{	

			IDEX.makeChartMarketInspect(sleuthchart, settings)
			console.log(settings)
		}
	})
	
	function getNames(baseID, relID)
	{
		
		var nxtass = "5527630"
		
		var base = IDEX.user.getAssetInfo("assetID", baseID)
		var rel = IDEX.user.getAssetInfo("assetID", relID)
		
		if (!($.isEmptyObject(base)))
		{
			var basename = base.name
		}
		else
		{
			var basename = baseID
		}

		if (!($.isEmptyObject(rel)))
		{
			var relname = rel.name
		}
		else
		{
			var relname = relID
		}
		
		return [basename, relname]
	}
	
	
	function drawMarketInfo(chart, closestPoint)
	{
		//var insideTimeX = insideX - xAxis.padding.left;
		//var time = xAxis.getXVal(insideTimeX);
		//time = Math.floor(time);
		var $marketNameEl = $(chart.node).find(".cur-market")
		var marketNameBbox = d3.select($marketNameEl.get()[0]).node().getBBox();
		var leftPos = marketNameBbox.x + marketNameBbox.width + 10;
		var topPos = marketNameBbox.y + marketNameBbox.height - 3;

		//console.log(marketNameBbox)
		
		var fontSize = chart.marketInfoFontSize
		var textAttr = {
			"fill":"#bbbbbb",
			"font-family":"Roboto",
			"font-size":fontSize
		}
		
		var priceAxis = chart.yAxis[0];
		var $candleInfoEl = $(chart.node).find(".candleInfo");
		
		var pad = 7
		//"Date: " + String("a") + 
		var openStr = "O: " + IDEX.formatNumWidth(Number(closestPoint.phase.open))
		var highStr = "H: " + IDEX.formatNumWidth(Number(closestPoint.phase.high))
		var lowStr = "L: " + IDEX.formatNumWidth(Number(closestPoint.phase.low))
		var closeStr = "C: " + IDEX.formatNumWidth(Number(closestPoint.phase.close))
		var volStr = "V: " + IDEX.formatNumWidth(Number(closestPoint.phase.vol))
		
		var str = ""
		str += padString(openStr)
		str += padString(highStr)
		str += padString(lowStr)
		str += padString(closeStr)
		str += padString(volStr)

		//var a = formatNumWidth(Number(closestPoint.phase.vol))
		//console.log(a)
		//var textWidth = priceAxis.ctx.measureText(openStr).width;
		//var move = (width - textWidth) / 2
		
		d3.select($candleInfoEl.get()[0])
		.text(str)
		.attr("y", topPos)
		.attr("x", leftPos)
		.attr(textAttr)
	}
		
	function padString(string)
	{
		var numSpaces = 20;
		
		var needed = 20 - string.length
		if (needed < 0)
			needed = 0;
		
		for (i = 0; i < needed; i++)
			string += " "
		
		return string;
	}
	
	
	IDEX.addMove = function(chart, settings)
	{
		$(chart.node).on("mousemove", function(e)
		{
			onChartMove(chart, e);
		})
	}
	
	IDEX.addMouseout = function(chart)
	{
		$(chart.node).on("mouseleave", function(e)
		{
			hideRenders(chart);
		})
	}
	

	function onChartMove(chart, e)
    {
		if (!chart.xAxis.length)
			return
		
		var node = chart.node
		var xAxis = chart.xAxis[0]
		var priceAxis = chart.yAxis[0];
		
		var hasVol = chart.yAxis.length > 1
		if (hasVol)
			var volAxis = chart.yAxis[1];
		
		var $cursor_follow_x = $(chart.node).find(".cursor_follow_x");
		var $cursor_follow_y = $(chart.node).find(".cursor_follow_y");
		
		var $priceFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='1']");
		var $volFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='2']");
		var $timeFollowWrap = $(chart.node).find(".xAxis-follow");

		
		var mouseX = e.pageX
		var mouseY = e.pageY
		var offsetX = $(node).offset().left;
		var offsetY = $(node).offset().top;
		var insideX = mouseX - offsetX
		var insideY = mouseY - offsetY

		var height = xAxis.pos['bottom'];
		var width = priceAxis.pos['left'];

		
		var topAxis = chart.yAxis[0]
		var bottomAxis = chart.yAxis[chart.yAxis.length-1]
		
		if (insideY >= 0 && insideY <= height && insideX >= 0 && insideX <= width)
		{
			var closestPoint = IDEX.getPoint(chart.pointData, insideX)
			var index = chart.visiblePhases.indexOf(closestPoint.phase)
			
			drawXLine(chart, insideY);
			
			
			if (index != chart.prevIndex && index >= 0) //&& (closestTime % pointRange <= pointRange/2))
			{
				chart.prevIndex = index;
				
				drawMarketInfo(chart, closestPoint);
				
				drawYLine(chart, closestPoint);

				
				if (insideX >= xAxis.pos.left && insideX <= xAxis.pos.right)
				{
					//var insideTimeX = insideX - xAxis.pos.left;
					var time = closestPoint.phase.startTime
					drawTimeBox(insideX, time, chart)
				}
				else
				{
					chart.prevIndex = -1;
					$timeFollowWrap.hide()
				}
			}
			
			if (insideY >= priceAxis.pos.top && insideY <= priceAxis.pos.bottom)
			{
				drawYAxisFollow(insideY, chart, priceAxis)
			}
			else
			{
				$priceFollowWrap.hide()
			}
			
			
			if (hasVol && insideY >= volAxis.pos.top && insideY <= volAxis.pos.bottom)
			{
				drawYAxisFollow(insideY, chart, volAxis)
			}
			else
			{
				$volFollowWrap.hide()
			}
		}
		else
		{
			chart.prevIndex = -1;
			hideRenders(chart);
		}

		if (chart.isDragging)
		{
			handleDrag(chart, insideX)
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
	
	
	function drawXLine(chart, yPos)
	{
		if (!chart.isCrosshair)
			return
		
		var priceAxis = chart.yAxis[0];
		var width = priceAxis.pos['left']; //+ priceAxis.width
		var $cursor_follow_x = $(chart.node).find(".cursor_follow_x");

		$cursor_follow_x
		.attr("x1", 0)
		.attr("x2", width)
		.attr("y1", yPos + 0.5)
		.attr("y2", yPos + 0.5)
		.attr("stroke-width", 1)
		.attr("stroke", "#a5a5a5")
		.attr("pointer-events", "none");
	}
	
	function drawYLine(chart, closestPoint)
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
	}
	
	
	function drawYAxisFollow(mousePosY, chart, axis)
	{
	
		var axisNum = String(chart.yAxis.indexOf(axis) + 1)

		var $followWrap = $(chart.node).find(".yAxis-follow[data-axisnum='"+axisNum+"']");
		var $followBackbox = $followWrap.find(".yAxis-follow-backbox");
		var $followText = $followWrap.find(".yAxis-follow-text");
		
		var fontSize = chart.marketInfoFontSize
		var textAttr = {
			"fill":"#D3D3D3",
			"font-family":"Roboto",
			"font-size":fontSize
		}
		
		var topPos = axis.pos.top;
		var leftPos = axis.pos.left;
		var width = axis.width;
		
		var insidePriceY = mousePosY - topPos
		var price = axis.getPriceFromY(insidePriceY)
		price = IDEX.formatNumWidth(Number(price))
		
		var textWidth = axis.ctx.measureText(price).width;
		var move = (width - textWidth) / 2
	
		$followText
		.text(price)
		.attr("y", mousePosY + 5)
		.attr("x", leftPos + move)
		.attr(textAttr)

		
		var backboxRect = d3.select($followText.get()[0]).node().getBBox();
		var rightPos = axis.pos.right - 1;
		var leftPos = axis.pos.left;
		var topPos = backboxRect.y - 3;
		var bottomPos = topPos + backboxRect.height + 6;
		var yMiddlePos = topPos + ((bottomPos - topPos) / 2) + 0.5
		var leftPosPad = leftPos + 7
		
		var d = 
		[
			"M", rightPos, topPos, 
			"L", leftPosPad, topPos, 
			"L", leftPos, yMiddlePos, 
			"L", leftPosPad, bottomPos, 
			"L", rightPos, bottomPos, 
			"L", rightPos, topPos, 
		]


		d3.select($followBackbox.get()[0])
		.attr("d", d.join(" "))
		.attr("stroke", "#D3D3D3")
		.attr("stroke-width", 0.5)
	
		$followWrap.show()
	}
	
	
	function drawTimeBox(mousePosX, time, chart)
	{
		var $followWrap = $(chart.node).find(".xAxis-follow");
		var $followBackbox = $followWrap.find(".xAxis-follow-backbox");
		var $followText = $followWrap.find(".xAxis-follow-text");
		
		var xAxis = chart.xAxis[0];
		
		var topPos = xAxis.pos.top;
		var height = xAxis.height;
		
		time = IDEX.formatTimeDate(new Date(time))
							
		$followText
		.text(time)
		.attr("y", topPos + 15)
		.attr("x", mousePosX - 37)
		.attr(textAttr)

		//var timerect = d3.select($cursor_follow_time.get()[0]).node().getBBox();
		d3.select($followBackbox.get()[0])
		.attr("x", mousePosX - 55)
		.attr("y", topPos)
		.attr("width", 110)
		.attr("height", height)
		.attr(boxAttr)
		
		$followWrap.show()
	}
	
	
	
	IDEX.addMouseup = function(chart)
	{
		$(chart.node).on("mouseup", function(e)
		{
			$(chart.node).css("cursor", "default");
			chart.isDragging = false;
		})
	}
	
	IDEX.addMousedown = function(chart)
	{
		$(chart.node).on("mousedown", function(e)
		{
			chartMousedown(e, chart);
		})
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
	

	
	function hideRenders(chart)
	{
		var $candleInfoEl = $(chart.node).find(".candleInfo");
		var $cursor_follow_x = $(chart.node).find(".cursor_follow_x");
		var $cursor_follow_y = $(chart.node).find(".cursor_follow_y");
		var $priceFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='1']");
		var $volFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='2']");
		var $timeFollowWrap = $(chart.node).find(".xAxis-follow");

		
		$cursor_follow_x.attr("stroke-width", 0);
		$cursor_follow_y.attr("stroke-width", 0);

		$priceFollowWrap.hide()
		$volFollowWrap.hide()
		$timeFollowWrap.hide()
		
		$candleInfoEl.text(""); 
	}
	
	
	$("#main_grid").on("click", ".dropdown-option", function(e)
	{
		$(this).closest("ul").find(".dropdown-option").removeClass("active")
		$(this).addClass("active")		
	})
	
	
	function resetDropdown()
	{
		$(".dropdown-option").removeClass("active")
		$("#numbars .dropdown-option").first().addClass("active")	
		$("#numticks .dropdown-option").first().addClass("active")			
		$("#flip .dropdown-option").first().addClass("active")			
	}
	
	
	
	function toggleLoading(node, isLoading)
	{
		if (node[0] != "#")
			node = "#"+node
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
	}
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));



