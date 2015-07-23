

var IDEX = (function(IDEX, $, undefined) 
{   
	
	
	
	IDEX.getYAxisNodes = function($node, index)
	{	
		var obj = {}
		var $axisGroup = $node.find(".sleuthYAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".yLabels")
		obj['ticksLeft'] = $axisGroup.find(".yTicksLeft")
		obj['ticksRight'] = $axisGroup.find(".yTicksRight")
		obj['gridLines'] = $axisGroup.find(".yGridLines")
		
		return obj;
	}
	
	IDEX.getXAxisNodes = function($node, index)
	{	
		var obj = {}
		var $axisGroup = $node.find(".sleuthXAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".xLabels")
		obj['ticks'] = $axisGroup.find(".xTicks")
		
		return obj;
	}
	
	

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
				axis.minIndex = 0;
				axis.maxIndex = 0;
				
				axis.numTicks = 0;
				axis.tickInterval = 0;
				axis.tickLength = 0;
				axis.tickStep = 0;
				axis.tickStepStart = 0;
				
				axis.tickPositions = [];
				axis.showTicks = [];
				
				
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
					axis.nodes = IDEX.getXAxisNodes(chart.node, axis.index + 1);
				}
				else
				{
					axis.nodes = IDEX.getYAxisNodes(chart.node, axis.index + 1);
				}
				

				//var obj = IDEX.getYAxisNodes(1)
						
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
					axis.dataMax = allPhases[allPhases.length-1].startTime
					
					axis.minIndex = startIndex;
					axis.maxIndex = endIndex;
					axis.min = visiblePhases[0].startTime;
					axis.max = visiblePhases[visiblePhases.length-1].startTime;
				}
				else
				{
					var minMax = IDEX.getMinMax(visiblePhases, axis.index == 0);

					axis.min = minMax[0];
					axis.max = minMax[1];						
				}				
			},
			


			
			
		/***************		RESIZE AXIS		****************/

			
			resizeAxis: function()
			{
				var axis = this;
				var chart = axis.chart;
				var isXAxis = axis.isXAxis;
				
				var bbox = d3.select(chart.node.get()[0])[0][0].getBoundingClientRect();
				var wrapWidth = bbox.width;
				var wrapHeight = bbox.height;
				
				
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
				converted = hw
				
				if (hasPct)
				{
					var valNum = parseInt(strVal)/100			
					var converted = Math.round(valNum * Number(wrapHW));
				}
				
				return converted
			},
			
			
			
			
			
		/***************		UPDATE INTERNAL DOM POSITIONS		****************/
		
		
			updateAxisPos: function()
			{
				var axis = this;
				var chart = axis.chart;
				var isXAxis = axis.isXAxis;
				
				if (isXAxis)
				{
					var yAxis = chart.yAxis[chart.yAxis.length-1]

					axis.pos.top = yAxis.pos.bottom + axis.padding.top;
					axis.pos.bottom = axis.pos.top + axis.height;
					axis.pos.left = axis.padding.left;
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
						var otherAxis = chart.yAxis[axisIndex-1]
						topAdd += otherAxis.pos.bottom;
					}
					
					axis.pos.top = axis.padding.top + topAdd;
					axis.pos.bottom = axis.pos.top + axis.height;
					axis.pos.left = axis.padding.left + leftAdd;
					axis.pos.right = axis.pos.left + axis.width;
				}
			},
			
			
			
			
			
		/***************		MAKE Y AXIS ????		****************/

			makeYAxis: function()
			{
				var fontLabelAttr = {
					"fill": this.labels.fontColor,
					"font-family": "Roboto",
					"font-size": this.labels.fontSize
				}
				
				var node = this.chart.node
				var $yAxisLabelsID = this.nodes.labels
				var $yAxisTicksID = this.nodes.ticksLeft
				var $yAxisTicksRightID = this.nodes.ticksRight
				var $yAxisGridLinesID = this.nodes.gridLines
				
				$yAxisLabelsID.empty();
				$yAxisTicksID.empty();
				$yAxisTicksRightID.empty();
				$yAxisGridLinesID.empty();
				
				var ticks = [];
				var ticksRight = [];
				var tickLength = this.tickLength
				
				var labels = []
				var gridLines = [];
				
				var paddedMax = this.max + (this.max * (this.maxPadding))
				var paddedMin = this.min - (this.min * (this.minPadding))
				
				var scale = d3.scale.linear()
				.domain([paddedMin, paddedMax])
				.range([this.height, this.pos.top])
				
				var tickVals = scale.ticks(this.numTicks) //.map(o.tickFormat(8))
				
				var tickPositions = []
				
				for (var i = 0; i < tickVals.length; i++)
				{
					//if (this.chart.isMain)
					//	tickVals[i] = Number(tickVals[i].toFixed(6));
					var maxDec = 8;
					var num = tickVals[i];
					var sind = String(num).search("e")
					if (sind != -1)
					{
						var partwhole = String(num).slice(0, sind)
						var partall = partwhole.split(".")
						if (partall.length == 1)
							partall.push("0")
						var exnum = String(num).slice(sind+1)
						var isneg = Number(exnum) < 0
						var pow = exnum.slice(1)
						//partall[0].length + partall[1].length
						num = "0." + (Array(Number(pow) - (0)).join("0")) + partall[0] + partall[1]

					}
					var all = String(num).split(".")
					var numDec = 0;
					var startDec = 0;
					//console.log(all[1])
					if (all.length == 2)
					{
						if (Number(all[0]) > 0)
						{
						}
						else
						{
							for (sing in all[1])
							{
								if (Number(all[1][sing]) > 0)
								{
									break
								}
								startDec++;
							}
						}
					}
					else
					{
						all.push("0")
					}


					var paddedDec = 3;
					var endDec = startDec + paddedDec
					//var avail = maxDec - numDec;
					if (endDec > maxDec)
						endDec = maxDec
					
					var strDec = Number("0."+all[1]).toFixed(endDec)
					var strAll = all[0] + "." + strDec.split(".")[1];
					tickVals[i] = Number(strAll)
					
					
					var p = this.getPositionFromValue(tickVals[i])
					tickPositions.push(p)
				}
				
				var xPos = this.pos.left;
				
				var maxTextWidth = getMaxTextWidth(tickVals, this.labels.fontSize, this.ctx)
				var newAxisWidth = this.width
				
				for (var i = 0; i < tickPositions.length; i++)
				{
					if (tickVals[i] == 0)
						continue
					var yPos = tickPositions[i] + 0.5;
					var text = String(tickVals[i]);
					
					var label = makeLabel(xPos, yPos, text, maxTextWidth, this)
					labels.push(label);
					
					var tick = makeLeftTick(xPos, yPos);
					ticks.push(tick);
					
					var tickRight = makeRightTick(xPos, yPos, this);
					ticksRight.push(tickRight);
					
					var gridLine = makeGridLine(xPos, yPos);
					gridLines.push(gridLine);
				}

				var SVGLabels = d3.select($yAxisLabelsID.get()[0]).selectAll("text")
				.data(labels)
				.enter()
				.append("text")
				
				SVGLabels.attr("x", function (d) { return d.x })
				.attr("y", function (d) { return d.y + 4 })
				.text(function (d) { return d.text })
				.attr(fontLabelAttr)
				//.attr("text-anchor", "end")

				
				var SVGTicks = d3.select($yAxisTicksID.get()[0]).selectAll("line")
				.data(ticks)
				.enter()
				.append("line")
				
				SVGTicks
				.attr("x1", function (d) { return d.x })
				.attr("x2", function (d) { return d.x + tickLength})
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y })
				.attr(tickAttr)
				
				
				var SVGTicksRight = d3.select($yAxisTicksRightID.get()[0]).selectAll("line")
				.data(ticksRight)
				.enter()
				.append("line")
				
				SVGTicksRight
				.attr("x1", function (d) { return d.x })
				.attr("x2", function (d) { return d.x - tickLength})
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y })
				.attr(tickAttr)
				
				
				var SVGGridLines = d3.select($yAxisGridLinesID.get()[0]).selectAll("line")
				.data(gridLines)
				.enter()
				.append("line")
				
				SVGGridLines
				.attr("x1", function (d) { return 0 })
				.attr("x2", function (d) { return d.x })
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y })
				.attr(gridLineAttr)
			},
			
			
		/***************		MAKE X AXIS ????		****************/
		
			makeXAxis: function()
			{
				var xAxis = this
				
				var fontLabelAttr = {
					"fill": "#737373",
					"font-family": "Roboto",
					"font-size": xAxis.labels.fontSize
				}
				
				var $xAxisLabelsID = xAxis.nodes.labels
				var $xAxisTicksID = xAxis.nodes.ticks
				
				$xAxisLabelsID.empty();
				$xAxisTicksID.empty();

				var labels = [];
				
				var ticks = [];
				var tickLength = xAxis.tickLength
				
				var tickStep = xAxis.tickStep;
				var tickStepStart = 0;
				var chart = xAxis.chart

				if (xAxis.showTicks.length)
				{
					var index = -1;
					for (var i = 0; i < chart.pointData.length; i++)
					{
						var point = chart.pointData[i]
						for (var j = 0; j < xAxis.showTicks.length; j++)
						{
							var showTick = xAxis.showTicks[j];
							if (point.phase == showTick.phase)
							{
								index = i;
								break;
							}
						}
						
						if (index != -1)
							break;
					}
					if (index == -1)
					{
						xAxis.tickStepStart = 0;
					}
					else
					{
						xAxis.tickStepStart = index % tickStep;
					}
				}
				
				var showTicks = []
				
				if (tickStep >= chart.pointData.length)
				{
					var index = Math.floor((chart.pointData.length - 1) / 2)
					showTicks.push(chart.pointData[index])
				}
				else
				{
					var numTicks =  Math.floor(xAxis.width / tickStep) 
					var tickJump = Math.floor(numTicks / xAxis.xStep)
					if (tickJump < 1)
						tickJump = 1
					
					var i = xAxis.tickStepStart;
					var len = chart.pointData.length;
					while (i < len)
					{
						showTicks.push(chart.pointData[i])
						i += tickJump;
					}
				}
				xAxis.showTicks = showTicks
				
				var yPos = xAxis.pos.top;
				
				for (var i = 0; i < showTicks.length; i++)
				{
					var showTick = showTicks[i];
					var xPos = showTick.pos.middle;
					
					var label = {};
					label.text = IDEX.formatTime(new Date(showTick.phase.startTime))
					label.x = xPos
					label.y = yPos;
					labels.push(label);
					
					var tick = {};
					tick.x = xPos;
					tick.y = yPos;
					ticks.push(tick);
				}
				
						
				var SVGTimeLabels = d3.select($xAxisLabelsID.get()[0]).selectAll("text")
				.data(labels)
				.enter()
				.append("text")
				
				SVGTimeLabels
				.attr("x", function (d) { return d.x - 20})
				.attr("y", function (d) { return d.y + 16 })
				.text(function (d) { return d.text })
				.attr(fontLabelAttr)
				
				var SVGTimeTicks = d3.select($xAxisTicksID.get()[0]).selectAll("line")
				.data(ticks)
				.enter()
				.append("line")
				
				SVGTimeTicks
				.attr("x1", function (d) { return d.x })
				.attr("x2", function (d) { return d.x })
				.attr("y1", function (d) { return d.y })
				.attr("y2", function (d) { return d.y + tickLength})
				.attr(tickAttr)
			},
			
			
		/***************		LABEL/TICK FUNCTIONS		****************/
			
			
			makeLabel: function(xPos, yPos, text, maxTextWidth, axis)
			{
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
			
			
			makeLeftTick: function(xPos, yPos)
			{
				var tick = {};
				
				tick.x = xPos;
				tick.y = yPos;
				
				return tick;
			},
		
			
			makeRightTick: function(xPos, yPos)
			{
				var axis = this;
				var tickRight = {};
				
				tickRight.y = yPos;
				tickRight.x = xPos + axis.width;
				
				return tickRight;
			},
			
			
			makeGridLine: function(xPos, yPos)
			{
				var gridLine = {};
				
				gridLine.y = yPos;
				gridLine.x = xPos;
				
				return gridLine;	
			},
			
			
		/***************		DRAW LINES		****************/

	
			drawAxisLines: function()
			{
				var chart = this.chart;
				var isXAxis = this.isXAxis;
				var bbox = d3.select(chart.node)[0][0].getBoundingClientRect();	
				
				var $axisGroup = this.axisGroupDom;
				//var $axisGroup = $(chart.node).find(".sleuthYAxis[data-axisNum='" + String(this.axisIndex) +"']")
				//var $axisGroup = $(chart.node).find(".sleuthXAxis[data-axisNum='" + String(this.axisIndex) +"']")

				var $axisLinesGroup = $axisGroup.find(".yAxisLines");
				//var $axisLinesGroup = $axisGroup.find(".xAxisLines");

				var rawgroup = $axisLinesGroup.get()[0]
				
				var lineAttr = {
					"stroke-width": 1,
					"stroke": "#555555"
				}
				
				$axisLinesGroup.empty();

				
				//var firstPos = isXAxis ? this.pos.top + 0.5 : this.pos.bottom + 0.5;
				
				d3.select(rawgroup).append("line")
				.attr("x1", 0 )
				.attr("x2", bbox.right)
				.attr("y1", this.pos['bottom'] + 0.5)
				.attr("y2", this.pos['bottom'] + 0.5)
				.attr(lineAttr)
				
				d3.select(rawgroup).append("line")
				.attr("x1", this.pos['left'] + 0.5)
				.attr("x2", this.pos['left'] + 0.5)
				.attr("y1", 0)
				.attr("y2", this.pos['bottom'])
				.attr(lineAttr)
				
				
				d3.select(rawgroup).append("line")
				.attr("x1", 0 )
				.attr("x2", bbox.right)
				.attr("y1", this.pos['top'] + 0.5)
				.attr("y2", this.pos['top'] + 0.5)
				.attr(lineAttr)
				
				d3.select(rawgroup).append("line")
				.attr("x1", 0 )
				.attr("x2", bbox.right)
				.attr("y1", this.pos['bottom'] + 0.5)
				.attr("y2", this.pos['bottom'] + 0.5)
				.attr(lineAttr)
				
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
	
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));