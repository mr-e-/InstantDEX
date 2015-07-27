



var IDEX = (function(IDEX, $, undefined) 
{
	
	
	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		
		var Renderer = Sleuthcharts.Renderer = function()
		{
			this.init.apply(this, arguments)
		}
		
		Renderer.prototype = 
		{
			
		}
		
		
		
		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
	

	

	
	

	

	
	
	
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

		var $node = $(this).closest(".tile").find(".chart-wrap svg");
		var chart = Sleuthcharts.getChart($node);
	
		console.log(chart);
		//console.log(Sleuthcharts);
		
		//var confVal = val
		//settings.barWidth = confVal;
		//settings.bars = confType;
		
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
