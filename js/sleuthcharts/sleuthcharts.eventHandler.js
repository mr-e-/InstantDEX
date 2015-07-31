


Sleuthcharts = (function(Sleuthcharts) 
{
	

	var DOMEventHandler = Sleuthcharts.DOMEventHandler = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	DOMEventHandler.prototype = 
	{
		init: function(chart)
		{
			var DOMEventHandler = this;
			DOMEventHandler.chart = chart;
		},
		
		
		
		setDOMEvents: function()
		{
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;
			var $chartEl = chart.node;
			
	
			$chartEl.on('mousewheel DOMMouseScroll', function(e)
			{
				DOMEventHandler.onContainerMouseWheel(e);
			})
			
			$chartEl.on('mousedown', function(e)
			{
				DOMEventHandler.onContainerMouseDown(e);
			})
			
			$chartEl.on('mouseup', function(e)
			{
				DOMEventHandler.onContainerMouseUp(e);
			})
			
			$chartEl.on('mousemove', function(e)
			{
				DOMEventHandler.onContainerMouseMove(e);
			})
			
			$chartEl.on('mouseleave', function(e)
			{
				DOMEventHandler.onContainerMouseLeave(e);
			})
			
			$chartEl.on('click', function(e)
			{
				DOMEventHandler.onContainerMouseClick(e);
			})

			$chartEl.on('resize', function(e)
			{
				DOMEventHandler.onContainerResize(e);
			})
			
		},
		
		
		normalizeMouseEvent: function(e)
		{
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;
			var $chartContainer = chart.node;
			
			var mouseX = e.pageX;
			var mouseY = e.pageY;
			var offset = $chartContainer.offset();
			var chartX = mouseX - offset.left;
			var chartY = mouseY - offset.top;
			
			
			if ("type" in e && e.type == "DOMMouseScroll")
			{
				e.wheelDeltaY = e['originalEvent']['detail'] > 0 ? -1 : 1;
				e.clientX = e['originalEvent']['clientX'];
				e.clientY = e['originalEvent']['clientY'];
			}
			else
			{
				e.wheelDeltaY = e.originalEvent.wheelDeltaY;
				e.clientX = e['clientX'];
				e.clientY = e['clientY'];
			}
			
			e.chartX = chartX;
			e.chartY = chartY;

			
			return e;
		},
		
		
		
		onContainerMouseClick: function(e)
		{
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;
			
			//console.log('click');
			//console.log(chart);
		},
		
		
		
		onContainerMouseDown: function(e)
		{				
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;

			e = DOMEventHandler.normalizeMouseEvent(e);


			var mouseX = e.pageX;
			var mouseY = e.pageY;
			var insideX = e.chartX;
			var insideY = e.chartY;
			

			if (chart.isInsidePlot(mouseX, mouseY))
			{
				var xAxis = chart.xAxis[0];
				var leftCheck = xAxis.pos.left;
				var rightCheck = xAxis.pos.right;
				var topCheck = chart.yAxis[0].pos.top;
				var bottomCheck = chart.yAxis[chart.yAxis.length - 1].pos.bottom;
		
				if ((insideY >= topCheck && insideY <= bottomCheck) && (insideX >= leftCheck && insideX <= rightCheck))
				{
					chart.node.css("cursor", "move");
					chart.isDragging = true;
					chart.draggingPos = insideX - xAxis.pos.left;
				}
			}	
		},
		
		
		
		onContainerMouseUp: function(e)
		{				
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;

			chart.node.css("cursor", "default");
			chart.isDragging = false;
		},
		

		
		onContainerMouseMove: function(e)
		{
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;
			
			e = DOMEventHandler.normalizeMouseEvent(e);

			
			var mouseX = e.pageX;
			var mouseY = e.pageY;
			var insideX = e.chartX;
			var insideY = e.chartY;

			
			if (chart.isInsidePlot(mouseX, mouseY))
			{
				var closestPoint = chart.getPoint(chart.allPoints, insideX)
				var index = chart.visiblePhases.indexOf(closestPoint.phase)
				
				chart.drawCrosshairX(insideY);
				chart.drawCrosshairY(closestPoint);
				
				for (var i = 0; i < chart.axes.length; i++)
				{
					var axis = chart.axes[i];
					var isXAxis = axis.isXAxis;
					var axisIndex = axis.index;
					
					if (isXAxis)
					{

						if (index != chart.prevIndex && index >= 0) //&& (closestTime % pointRange <= pointRange/2))
						{
							chart.prevIndex = index;
							
							chart.drawMarketInfo(closestPoint);
							
							
							if (insideX >= axis.pos.left && insideX <= axis.pos.right)
							{
								var time = closestPoint.phase.startTime;
								axis.drawTimeBox(closestPoint.pos.middle, time);
							}
							else
							{
								var $timeFollowWrap = chart.node.find(".xAxis-follow");

								chart.prevIndex = -2;
								$timeFollowWrap.hide();
							}
						}
					}
					else
					{
						if (insideY >= axis.pos.top && insideY <= axis.pos.bottom)
						{
							axis.drawYAxisFollow(insideY);
						}
						else
						{
							var $yAxisFollowWrap = chart.node.find(".yAxis-follow[data-axisNum='" + String(axisIndex + 1) + "']");
							$yAxisFollowWrap.hide();
						}
					}
				}
			}
			else
			{
				chart.prevIndex = -2;
				chart.hideRenders();
			}

			if (chart.isDragging)
			{
				DOMEventHandler.handleDrag(insideX)
			}
		},
		
		
		
		handleDrag: function(xPos)
		{
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;
			var xAxis = chart.xAxis[0];
			
			var insideTimeX = xPos - xAxis.pos.left;
			var diff = insideTimeX - chart.draggingPos;
			var direction = diff < 0;
			diff = Math.abs(diff);
			
			if (diff != 0 && diff > xAxis.fullPointWidth)
			{	
				var shifts = Math.floor(diff / xAxis.fullPointWidth)
				
				chart.draggingPos = insideTimeX;
				
				chart.shiftXAxis(shifts, direction);
				chart.redraw();
			}
		},
		
		
		
		onContainerMouseLeave: function(e)
		{
			var chart = this.chart;
			
			chart.hideRenders();
		},
		
		
		
		onContainerMouseWheel: function(e)
		{
			e.preventDefault();
			e.stopPropagation();
			
			var DOMEventHandler = this;
			var chart = DOMEventHandler.chart;
			
			e = DOMEventHandler.normalizeMouseEvent(e);

			
			var mouseX = e.pageX;
			var mouseY = e.pageY;
			var insideX = e.chartX;
			var insideY = e.chartY;
					
					
			var xAxis = chart.xAxis[0];
			var leftCheck = xAxis.pos.left;
			var rightCheck = xAxis.pos.right;
			var topCheck = chart.yAxis[0].pos.top;
			var bottomCheck = chart.yAxis[chart.yAxis.length - 1].pos.bottom;
	
			if ((insideY >= topCheck && insideY <= bottomCheck) && (insideX >= leftCheck && insideX <= rightCheck))
			{
				var isZoomOut = e.wheelDeltaY <= 0;
				chart.zoomChart(isZoomOut);
			}	
	
		},
		
		
		
		onContainerResize: function(e)
		{
			console.log('resize');
		},
		

		
	}
		
	
	
	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));









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

