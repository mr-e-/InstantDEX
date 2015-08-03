




Sleuthcharts = (function(Sleuthcharts) 
{
	
	var tickAttr = 
	{
		"stroke": "white",
		"stroke-width": 0.5
	};
	
	var gridLineAttr = 
	{
		"stroke": "#404040",
		"stroke-dasharray": "1,3",
		"stroke-width": 1
	};
	

	Sleuthcharts.getYAxisNodes = function($node, index)
	{	
		var obj = {}
		var $axisGroup = $node.find(".sleuthYAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".yLabels")
		obj['ticksLeft'] = $axisGroup.find(".yTicksLeft")
		obj['ticksRight'] = $axisGroup.find(".yTicksRight")
		obj['gridLines'] = $axisGroup.find(".yGridLines")
		
		return obj;
	}

	Sleuthcharts.getXAxisNodes = function($node, index)
	{	
		var obj = {}
		var $axisGroup = $node.find(".sleuthXAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".xLabels")
		obj['ticks'] = $axisGroup.find(".xTicks")
		
		return obj;
	}



	var Axis = Sleuthcharts.Axis = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	Axis.prototype = 
	{
		
		defaultXAxisOptions:
		{	
			//"heightInit":20,
			//"widthInit":"100%",
			
			"range":40,
			"minRange":40,
			
			"padding":{
				"top":0,
				"bottom":0,
				"left":0,
				"right":0,
			},
			
			"numTicks":8,
			"tickLength":4,
			"tickStep":6,

			"labels":{
				"fontSize":"12px",	
			},
		},
		
		defaultYAxisOptions:
		{
			
			"padding":
			{
				"top":0,
				"bottom":0,
				"left":0,
				"right":0,
			},
			
			"minPadding":0.05,
			"maxPadding":0.05,
			
			"numTicks":10,
			"tickLength":7,
			
			"labels":
			{
				"textPadding":5,
				"fontSize":"13px",
				"fontColor":"#8C8C8C",
			},
		},
		
		
		init: function(chart, options)
		{
			var axis = this;
			axis.chart = chart;
			axis.series = [];
			axis.options = options;
			

			
			axis.height = 0;
			axis.width = 0;
			
			axis.dataMin = 0;
			axis.dataMax = 0;
			axis.min = 0;
			axis.max = 0;
			axis.paddedMin = 0;
			axis.paddedMax = 0;
			
			axis.minIndex = 0;
			axis.maxIndex = 0;
			
			axis.numTicks = 0;
			axis.tickLength = 0;
			axis.tickStep = 0;
			
			axis.ticks = [];
			
			
			axis.isXAxis = options.isXAxis;
			axis.index = options.index;
			
			axis.heightInit = options.heightInit;
			axis.widthInit = options.widthInit;
			
			axis.minPadding = options.minPadding || 0;
			axis.maxPadding = options.maxPadding || 0;
			
			axis.numTicks = options.numTicks;
			axis.tickLength = options.tickLength;
			
			axis.pos = new Sleuthcharts.Positions();
			axis.padding = new Sleuthcharts.Padding();
			axis.padding = Sleuthcharts.extend(axis.padding, options.padding);
			
			axis.labels = options.labels;
			
			if (axis.isXAxis)
			{
				axis.fullPointWidth = 0;
				axis.pointPadding = 0;
				axis.pointWidth = 0;
				axis.numPoints = 0;
				
				axis.range = options.range;
				axis.minRange = options.minRange;
				
				axis.tickStep = options.tickStep;
				axis.nodes = Sleuthcharts.getXAxisNodes(chart.node, axis.index + 1);
			}
			else
			{
				axis.nodes = Sleuthcharts.getYAxisNodes(chart.node, axis.index + 1);
			}
									
			axis.canvas = document.createElement('canvas');
			axis.ctx = axis.canvas.getContext("2d");
			axis.ctx.font = axis.labels.fontSize + " Roboto"; 


		},
		
		
		
		updateMinMax: function(startIndex, endIndex)
		{
			var axis = this;
			var chart = axis.chart;
			var isXAxis = axis.isXAxis;

			var visiblePhases = chart.visiblePhases;

		
			if (isXAxis)
			{
				var marketHandler = chart.marketHandler;

				var allPhases = marketHandler.marketData.ohlc;


				axis.dataMin = allPhases[0].startTime;
				axis.dataMax = allPhases[allPhases.length-1].startTime;
				
				axis.minIndex = startIndex;
				axis.maxIndex = endIndex;
				axis.min = visiblePhases[0].startTime;
				axis.max = visiblePhases[visiblePhases.length-1].startTime;
			}
			else
			{
				var minMax = Sleuthcharts.getMinMax(visiblePhases, axis.index == 0);

				axis.min = minMax[0];
				axis.max = minMax[1];			
			}
			
			axis.paddedMax = axis.max + (axis.max * (axis.maxPadding));
			axis.paddedMin = axis.min - (axis.min * (axis.minPadding));
		},
		


		
		
	/***************		RESIZE AXIS		****************/

		
		resizeAxis: function()
		{
			var axis = this;
			var chart = axis.chart;
			var chartPadding = chart.padding;
			var isXAxis = axis.isXAxis;
			
			var bbox = d3.select(chart.node.get()[0])[0][0].getBoundingClientRect();
			var wrapWidth = chart.plotWidth;
			var wrapHeight = chart.plotHeight;
			
			
			if (isXAxis)
			{
				var widest = 0;
				
				for (var i = 0; i < chart.yAxis.length; i++)
				{
					var yAxis = chart.yAxis[i];
					
					if (yAxis.width > widest)
						widest = yAxis.width;
				}
				
				var convertedHeight = axis.resizeHW(axis.heightInit, wrapHeight);
				
				var convertedWidth = axis.resizeHW("100%", wrapWidth);
				convertedWidth = convertedWidth - (widest + yAxis.padding.left) - axis.padding.left;
			}
			
			else
			{
				var xAxis = chart.xAxis[0];
				var len = chart.yAxis.length;
				
				var convertedHeight = axis.resizeHW(axis.heightInit, wrapHeight);
				convertedHeight = ((convertedHeight - (xAxis.height / len)) - (xAxis.padding.top / len)) - axis.padding.top
				
				var convertedWidth = axis.resizeHW(axis.widthInit, wrapWidth);
			}

			
			axis.height = convertedHeight;
			axis.width = convertedWidth;
		},
		
		
		
		resizeHW: function(hw, wrapHW)
		{
			var strVal = String(hw);
			var hasPct = strVal.indexOf('%') >= 0;
			converted = hw;
			
			if (hasPct)
			{
				var valNum = parseInt(strVal)/100			;
				var converted = Math.round(valNum * Number(wrapHW));
			}
			
			return converted
		},
		
		
		
		
		
	/***************		UPDATE INTERNAL DOM POSITIONS		****************/
	
	
		updateAxisPos: function()
		{
			var axis = this;
			var chart = axis.chart;
			var chartPadding = chart.padding;
			var isXAxis = axis.isXAxis;
			
			if (isXAxis)
			{
				var yAxis = chart.yAxis[chart.yAxis.length-1]

				axis.pos.top = yAxis.pos.bottom + axis.padding.top;
				axis.pos.bottom = axis.pos.top + axis.height;
				axis.pos.left = axis.padding.left + chartPadding.left;
				axis.pos.right = axis.pos.left + axis.width;
			}
			else
			{
				var xAxis = chart.xAxis[0];
				var axisIndex = axis.index;
				
				var leftAdd = xAxis.padding['left'] + xAxis.width;
				var topAdd = 0;
				
				if (axisIndex > 0)
				{
					var otherAxis = chart.yAxis[axisIndex-1];
					topAdd += otherAxis.pos.bottom;
				}
				
				axis.pos.top = axis.padding.top + topAdd + (chartPadding.top / chart.yAxis.length);
				axis.pos.bottom = axis.pos.top + axis.height;
				axis.pos.left = axis.padding.left + leftAdd + chartPadding.left;
				axis.pos.right = axis.pos.left + axis.width;
			}
		},
		
		
		
		makeAxis: function()
		{
			
			var axis = this;
			var isXAxis = axis.isXAxis;
			
			
			var ticksLeft = [];
			var ticksRight = [];
			var labels = [];
			var gridLines = [];

			
			if (isXAxis)
			{
				var ticksDom = [];
				
				var ticks = axis.getXAxisTicks();
				var yPos = axis.pos.top;
				
				for (var i = 0; i < ticks.length; i++)
				{
					var tick = ticks[i];
					var xPos = tick.position;
					
					var label = {};
					label.text = Sleuthcharts.formatTime(new Date(tick.val))
					label.x = xPos
					label.y = yPos;
					labels.push(label);
					
					var tickDom = {};
					tickDom.x = xPos;
					tickDom.y = yPos;
					ticksDom.push(tickDom);
				}
				
			}
			else
			{
				var ticks = axis.getYAxisTicks();
				var xPos = axis.pos.left;

				for (var i = 0; i < ticks.length; i++)
				{	
					var tick = ticks[i];
					var yPos = tick.position + 0.5;
					var text = String(tick.val);
					
					var label = axis.calcLabelPosition(xPos, yPos, text)
					labels.push(label);
					
					var tickLeft = axis.calcLeftTickPosition(xPos, yPos);
					ticksLeft.push(tickLeft);
					
					var tickRight = axis.calcRightTickPosition(xPos, yPos);
					ticksRight.push(tickRight);
					
					var gridLine = axis.calcGridlinePosition(xPos, yPos);
					gridLines.push(gridLine);
				}
			}

			

			
			
			var tickLength = axis.tickLength;

			var fontLabelAttr = {
				"fill": axis.labels.fontColor,
				"font-family": "Roboto",
				"font-size": axis.labels.fontSize
			}
			
			
			if (isXAxis)
			{
				var $axisLabels = axis.nodes.labels;
				var $axisTicks = axis.nodes.ticks;
				
				$axisLabels.empty();
				$axisTicks.empty();
				
				
				var SVGTimeLabels = d3.select($axisLabels.get()[0]).selectAll("text")
				.data(labels)
				.enter()
				.append("text")
				
				SVGTimeLabels
				.attr("x", function (d) { return d.x - 20})
				.attr("y", function (d) { return d.y + 16 })
				.text(function (d) { return d.text })
				.attr(fontLabelAttr)
				
				var SVGTimeTicks = d3.select($axisTicks.get()[0]).selectAll("line")
				.data(ticksDom)
				.enter()
				.append("line")
				
				SVGTimeTicks
				.attr("x1", function (d) { return d.x })
				.attr("x2", function (d) { return d.x })
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y + tickLength})
				.attr(tickAttr)
				
				axis.ticks = [];
			}
			else
			{
				
				var $axisLabels = axis.nodes.labels;
				var $axisTicksLeft = axis.nodes.ticksLeft;
				var $axisTicksRight = axis.nodes.ticksRight;
				var $axisGridLines = axis.nodes.gridLines;
				
				$axisLabels.empty();
				$axisTicksLeft.empty();
				$axisTicksRight.empty();
				$axisGridLines.empty();


				var SVGLabels = d3.select($axisLabels.get()[0]).selectAll("text")
				.data(labels)
				.enter()
				.append("text")
				
				SVGLabels.attr("x", function (d) { return d.x })
				.attr("y", function (d) { return d.y + 4 })
				.text(function (d) { return d.text })
				.attr(fontLabelAttr)
				//.attr("text-anchor", "end")

				
				var SVGTicks = d3.select($axisTicksLeft.get()[0]).selectAll("line")
				.data(ticksLeft)
				.enter()
				.append("line")
				
				SVGTicks
				.attr("x1", function (d) { return d.x })
				.attr("x2", function (d) { return d.x + tickLength})
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y })
				.attr(tickAttr)
				
				
				var SVGTicksRight = d3.select($axisTicksRight.get()[0]).selectAll("line")
				.data(ticksRight)
				.enter()
				.append("line")
				
				SVGTicksRight
				.attr("x1", function (d) { return d.x })
				.attr("x2", function (d) { return d.x - tickLength})
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y })
				.attr(tickAttr)
				
				
				var SVGGridLines = d3.select($axisGridLines.get()[0]).selectAll("line")
				.data(gridLines)
				.enter()
				.append("line")
				
				SVGGridLines
				.attr("x1", function (d) { return 0 })
				.attr("x2", function (d) { return d.x })
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y })
				.attr(gridLineAttr)
			
			}
			
		},
		
		
		getXAxisTicks: function()
		{
			var axis = this;
			var chart = axis.chart;

			
			var tickStep = axis.tickStep;
			var tickStepStart = 0;
			
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var ticks = axis.ticks;
			var ticksLength = ticks.length;
			

			
			var index = -1;
				
			for (var j = 0; j < ticksLength; j++)
			{
				var tick = ticks[j];
				
				for (var i = 0; i < allPointsLength; i++)
				{
					var point = allPoints[i]
					
					if (point.phase.startTime == tick.val)
					{
						index = i;
						break;
					}
				}
				
				if (index != -1)
				{
					tickStepStart = index % tickStep;
					break;
				}
			}
								
			
			var showTicks = []
			//console.log(chart.node[0].getBoundingClientRect().height);
			//console.log(chart.canvas.height);
			if (tickStep >= allPointsLength)
			{
				var index = Math.floor((allPointsLength - 1) / 2)
				showTicks.push(allPoints[index])
			}
			else
			{
				var numTicks =  Math.floor(axis.width / tickStep);
				var tickJump = Math.floor(numTicks / axis.fullPointWidth);
				
				if (tickJump < 1)
					tickJump = 1
				
				var tickStepPos = tickStepStart;
				

				while (tickStepPos < allPointsLength)
				{
					showTicks.push(allPoints[tickStepPos]);
					tickStepPos += tickJump;
				}
			}
			
			for (var i = 0; i < showTicks.length; i++)
			{
				var showTick = showTicks[i];
				ticks.push({"position":showTick.pos.middle, "val":showTick.phase.startTime, "point":showTick})
			}
			
			axis.ticks = ticks;
			
			return ticks;
		},
		
		
		getYAxisTicks: function()
		{
			var axis = this;
			var ticks = [];
			
			var paddedMax = axis.paddedMax;
			var paddedMin = axis.paddedMin;
			
			var scale = d3.scale.linear()
			.domain([paddedMin, paddedMax])
			.range([axis.height, axis.pos.top])
			
			
			var tickVals = scale.ticks(axis.numTicks) //.map(o.tickFormat(8))
							
			for (var i = 0; i < tickVals.length; i++)
			{
				var val = tickVals[i];
				val = Sleuthcharts.formatExponent(val);
				var position = axis.getPositionFromValue(val)
				
				ticks.push({"position":position, "val":val})
			}
			
			axis.ticks = ticks;

			
			return ticks;
		},
		
		
	/***************		LABEL/TICK FUNCTIONS		****************/
		
		
		calcLabelPosition: function(xPos, yPos, text)
		{
			var axis = this;
			var ticks = axis.ticks;
			var maxTextWidth = 0
			
			for (var i = 0; i < ticks.length; i++)
			{
				var loopText = String(Number(ticks[i].val.toPrecision(3)));
				var wid = axis.ctx.measureText(loopText).width;
				maxTextWidth = wid > maxTextWidth ? wid : maxTextWidth;
			}
			

			var label = {};
			
			var axisWidth = axis.width;
			var tickLength = axis.tickLength;
			var fixedTextPadding = axis.labels.textPadding
			
			var textWidth =  axis.ctx.measureText(text).width;
			var diff = maxTextWidth - textWidth 
			var shift = 0
			
			var wrapWidth = (tickLength * 2) + (fixedTextPadding * 2)
			var pad = ((axis.width - wrapWidth) / 2) - (maxTextWidth / 2)
			
			if (diff >= 1)
				shift = diff/2
			
			if (pad >= 0.5)
				shift += pad

			label.text = text;
			label.y = yPos;
			
			label.x = xPos + shift + fixedTextPadding + tickLength;
			
			return label;
		},
		
		
		calcLeftTickPosition: function(xPos, yPos)
		{
			var tick = {};
			
			tick.x = xPos;
			tick.y = yPos;
			
			return tick;
		},
	
		
		calcRightTickPosition: function(xPos, yPos)
		{
			var axis = this;
			var tickRight = {};
			
			tickRight.y = yPos;
			tickRight.x = xPos + axis.width;
			
			return tickRight;
		},
		
		
		calcGridlinePosition: function(xPos, yPos)
		{
			var gridLine = {};
			
			gridLine.y = yPos;
			gridLine.x = xPos;
			
			return gridLine;	
		},
		
		
	/***************		DRAW LINES		****************/


		drawAxisLines: function()
		{
			var axis = this;
			var chart = axis.chart;
			var isXAxis = axis.isXAxis;
			
			//var bbox = d3.select(chart.node.get()[0])[0][0].getBoundingClientRect();	
			var bbox = chart.node[0].getBoundingClientRect()
			//bbox.right = chart.plotRight;
			//var $axisGroup = this.axisGroupDom;
			
			if (isXAxis)
			{
				var $axisGroup = chart.node.find(".sleuthXAxis[data-axisNum='" + String(axis.index + 1) +"']")
				var $axisLinesGroup = $axisGroup.find(".xAxisLines");
			}
			else
			{
				var $axisGroup = chart.node.find(".sleuthYAxis[data-axisNum='" + String(axis.index + 1) +"']")
				var $axisLinesGroup = $axisGroup.find(".yAxisLines");
			}


			var rawgroup = $axisLinesGroup.get()[0]
			
			var lineAttr = {
				"stroke-width": 1,
				"stroke": "#555555"
			}
			
			$axisLinesGroup.empty();

			
			//var firstPos = isXAxis ? this.pos.top + 0.5 : this.pos.bottom + 0.5;
			
			
			if (isXAxis)
			{
				d3.select(rawgroup).append("line")
				.attr("x1", 0 )
				.attr("x2", bbox.right)
				.attr("y1", axis.pos.top + 0.5)
				.attr("y2", axis.pos.top + 0.5)
				.attr(lineAttr)
				
				d3.select(rawgroup).append("line")
				.attr("x1", 0 )
				.attr("x2", bbox.right)
				.attr("y1", axis.pos.bottom + 0.5)
				.attr("y2", axis.pos.bottom + 0.5)
				.attr(lineAttr)
			}
			else
			{
				d3.select(rawgroup).append("line")
				.attr("x1", 0 )
				.attr("x2", bbox.right)
				.attr("y1", axis.pos.bottom + 0.5)
				.attr("y2", axis.pos.bottom + 0.5)
				.attr(lineAttr)
				
				d3.select(rawgroup).append("line")
				.attr("x1", axis.pos.left + 0.5)
				.attr("x2", axis.pos.left + 0.5)
				.attr("y1", 0)
				.attr("y2", axis.pos.bottom)
				.attr(lineAttr)
			}
			

			
		},
		
		
		drawYAxisFollow: function(mousePosY)
		{
			var axis = this;
			var chart = axis.chart;
			var axisIndex = axis.index;

			var $followWrap = chart.node.find(".yAxis-follow[data-axisnum='"+ String(axisIndex + 1) +"']");
			var $followBackbox = $followWrap.find(".yAxis-follow-backbox");
			var $followText = $followWrap.find(".yAxis-follow-text");
			
			var textAttr = {
				"fill":"#D3D3D3",
				"font-family":"Roboto",
				"font-size":"12px"
			}
			
			var leftPos = axis.pos.left;
			var width = axis.width;
			
			var insideY = mousePosY - axis.pos.top;
			var val = axis.getValueFromPosition(insideY);
			val = Sleuthcharts.formatNumWidth(Number(val));
			
			var textWidth = axis.ctx.measureText(val).width;
			var move = (width - textWidth) / 2;
		
			$followText
			.text(val)
			.attr("y", mousePosY + 5)
			.attr("x", leftPos + move)
			.attr(textAttr)

			
			var backboxRect = d3.select($followText.get()[0]).node().getBBox();
			var rightPos = axis.pos.right - 1;
			var leftPos = axis.pos.left;
			var topPos = backboxRect.y - 3;
			var bottomPos = topPos + backboxRect.height + 6;
			var yMiddlePos = topPos + ((bottomPos - topPos) / 2) + 0.5;
			var leftPosPad = leftPos + 7;
			
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
		
			$followWrap.show();
		},
		
		
		
		drawTimeBox: function(mousePosX, time)
		{	
			var axis = this;
			var chart = axis.chart;
			time = Sleuthcharts.formatTime(new Date(time), true)

			
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
			
			var $followWrap = chart.node.find(".xAxis-follow");
			var $followBackbox = $followWrap.find(".xAxis-follow-backbox");
			var $followText = $followWrap.find(".xAxis-follow-text");
			
			
			var topPos = axis.pos.top;
			var height = axis.height;
			
								
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
		},
		
		
		// highcharts
		normalizeTimeTickInterval: function(tickInterval, unitsOption)
		{
			var units = unitsOption || 
			[[
					'millisecond', // unit name
					[1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
				], [
					'second',
					[1, 2, 5, 10, 15, 30]
				], [
					'minute',
					[1, 2, 5, 10, 15, 30]
				], [
					'hour',
					[1, 2, 3, 4, 6, 8, 12]
				], [
					'day',
					[1, 2]
				], [
					'week',
					[1, 2]
				], [
					'month',
					[1, 2, 3, 4, 6]
				], [
					'year',
					null
			]];
			
			var unit = units[units.length - 1];
			var interval = timeUnits[unit[0]];
			var multiples = unit[1];
			var count;
				
			// loop through the units to find the one that best fits the tickInterval
			for (i = 0; i < units.length; i++)
			{
				unit = units[i];
				interval = timeUnits[unit[0]];
				multiples = unit[1];


				if (units[i + 1])
				{
					// lessThan is in the middle between the highest multiple and the next unit.
					var lessThan = (interval * multiples[multiples.length - 1] +
								timeUnits[units[i + 1][0]]) / 2;

					// break and keep the current unit
					if (tickInterval <= lessThan)
						break;
				}
			}
			
			// prevent 2.5 years intervals, though 25, 250 etc. are allowed
			if (interval === timeUnits.year && tickInterval < 5 * interval)
			{
				multiples = [1, 2, 5];
			}

			// get the count
			count = normalizeTickInterval(
				tickInterval / interval, 
				multiples,
				unit[0] === 'year' ? mathMax(getMagnitude(tickInterval / interval), 1) : 1 // #1913, #2360
			);
			
			return {
				unitRange: interval,
				count: count,
				unitName: unit[0]
			};
		},

		
	/***************		CONVERT PIXEL/VALUE		****************/

	
		getPositionFromValue: function(pointValue)
		{
			var axis = this;
			
			var paddedMax = axis.max + (axis.max * axis.maxPadding)
			var paddedMin = axis.min - (axis.min * axis.minPadding)

			var num = pointValue - paddedMin;
			var range = paddedMax - paddedMin;
			var ratio = num / range;
			var pos = Number((axis.pos.bottom - (ratio * axis.height)).toFixed(4));
			//console.log(String(pointValue) + "    " + String(ratio) + "  " + String(pos));
			
			return pos
		},
		
		
		getValueFromPosition: function(pos)
		{
			var axis = this;
			
			var isXAxis = axis.isXAxis
			var paddedMax = axis.max + (axis.max * axis.maxPadding)
			var paddedMin = axis.min - (axis.min * axis.minPadding)
			
			
			var range = paddedMax - paddedMin;
			var ratio = isXAxis ? pos / axis.width : pos / axis.height;
			var num = ratio * range
			var val = isXAxis ? paddedMin + num : paddedMax - num

			return val
		},
		
		
	}
	
	
	
	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));

