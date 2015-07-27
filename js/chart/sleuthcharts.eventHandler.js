

var IDEX = (function(IDEX, $, undefined) 
{

	

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
				//console.log('click');
			},
			
			
			onContainerMouseDown: function(e)
			{
				console.log('mousedown');

				//chartMousedown(e, chart);
			},
			
			onContainerMouseUp: function(e)
			{
				console.log('mouseup');

				//$(chart.node).css("cursor", "default");
				//chart.isDragging = false;
			},
			

			
			onContainerMouseMove: function(e)
			{
			
				var DOMEventHandler = this;
				var chart = DOMEventHandler.chart;
				e = DOMEventHandler.normalizeMouseEvent(e);

				if (!chart.xAxis.length)
					return
				
				var $cursor_follow_x = $(chart.node).find(".cursor_follow_x");
				var $cursor_follow_y = $(chart.node).find(".cursor_follow_y");
				
				var $priceFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='1']");
				var $volFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='2']");
				var $timeFollowWrap = $(chart.node).find(".xAxis-follow");

				

				
				var mouseX = e.pageX;
				var mouseY = e.pageY;
				var insideX = e.chartX;
				var insideY = e.chartY;

				var node = chart.node;
				var xAxis = chart.xAxis[0]
				var priceAxis = chart.yAxis[0];
				
				var height = xAxis.pos.bottom;
				var width = priceAxis.pos.left;

				
				if (insideY >= 0 && insideY <= height && insideX >= 0 && insideX <= width)
				{
					var closestPoint = IDEX.getPoint(chart.allPoints, insideX)
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
			},
			
			onContainerMouseLeave: function(e)
			{
				console.log('mouseleave');

				//hideRenders(chart);
			},
			
			
			onContainerMouseWheel: function(e)
			{
				console.log('mousewheel');

				//e.preventDefault();
				//e.stopPropagation();
				//tryZoom(chart, e);
			},
			
			onContainerResize: function(e)
			{
				console.log('resize');

				//resizeHandler(chart);
			},
			
						
		}
			
		
		
		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
	
	

	
	
	
	function tryZoom(e)
	{	
		e = this.normalizeMouseEvent(e);
		var chart = this.chart;
		
		var mouseX = e.pageX
		var mouseY = e.pageY
		var offsetX = chart.node.offset().left;
		var offsetY = chart.node.offset().top;
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
	
	
	
	function zoomChart(isZoomOut)
	{
		var series = this;
		var chart = series.chart;
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
	
	
	
	function shiftXAxis(shifts, direction)
	{
		var series = this;
		var chart = series.chart;
		var xAxis = chart.xAxis[0];
		var vis = [];
		
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
	
	
	
	function onChartMove(chart, e)
    {

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
	
	
	function resizeHandler(chart)
	{
		var xAxis = chart.xAxis[0];
		resizeAxis(chart)
		updateAxisPos(chart)
		
		updateAxisMinMax(chart.visiblePhases, xAxis.minIndex, xAxis.maxIndex, chart)


		redraw(chart)
	}
	
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));