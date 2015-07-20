



var IDEX = (function(IDEX, $, undefined) 
{

	
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
	

	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
