var IDEX = (function(IDEX, $, undefined) 
{
	
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
	
	
	IDEX.changeChartMarket = function(obj)
	{
		var $node = obj.node.closest(".tile").find(".chart-wrap svg");
		var chart = Sleuthcharts.getChart($node);
		var marketHandler = chart.marketHandler;
		
		var newMarket = {};
		newMarket.baseID = obj.baseID;
		newMarket.relID = obj.relID;
		newMarket.baseName = getName(newMarket.baseID);
		newMarket.relName = getName(newMarket.relID);
		newMarket.exchange = obj.exchange;
		
		marketHandler.changeMarket(newMarket);
		chart.updateChart();
	}
	

	function getName(assetID)
	{
		//var nxtAssetID = "5527630"
		var asset = IDEX.user.getAssetInfo("assetID", assetID)
		
		if (!($.isEmptyObject(asset)))
		{
			var name = asset.name
		}
		else
		{
			var name = assetID
		}

		
		return name;
	}




	$("#main_grid").on("click", ".chart-time-dropdown-wrap li", function()
	{
		var $wrap = $(this).closest(".chart-time-wrap");
		var isSwitch = $(this).hasClass("time-change");		


		if (isSwitch)
		{
			var timeType = $(this).attr("data-val");	
			var $otherList = $wrap.find("ul[data-inttype='"+timeType+"']")
			var $otherCell = $otherList.find("li.active")
			var timeVal = $otherCell.attr("data-val");
			var title = $otherCell.text();
			
			$wrap.find("ul").removeClass("active");
			$otherList.addClass("active");
		}
		else
		{
			var $list = $(this).closest("ul");
			var timeType = $list.attr("data-inttype");
			var timeVal = $(this).attr("data-val");	
			var title = $(this).text();

			$list.find("li").removeClass("active");
			$(this).addClass("active");
		}
		
		$wrap.find(".chart-time-button-title span").text(title);

		
		
		var $node = $(this).closest(".tile").find(".chart-wrap svg");
		var chart = Sleuthcharts.getChart($node);
		var marketHandler = chart.marketHandler;

		//console.log(chart);
		
		var newSettings = {};

		newSettings.configType = "time";
		newSettings.configVal = timeType;
		newSettings.val = timeVal;
		

		marketHandler.changeSettings(newSettings);

	})
	
	
	$("#main_grid").on("click", ".chart-header .mm-chart-config li", function(e)
	{
		$(this).parent().find("li").removeClass("active");
		$(this).addClass("active");
		
				
		var $node = $(this).closest(".tile").find(".chart-wrap svg");
		var chart = Sleuthcharts.getChart($node);
		var marketHandler = chart.marketHandler;
		
		var confType = $(this).parent().attr("data-config")
		var confVal = $(this).attr("data-val")
		
		var newSettings = {};
		newSettings.configType = confType;
		newSettings.configVal = confVal;		

		marketHandler.changeSettings(newSettings);

	})
	

	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
