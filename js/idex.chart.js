var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");

	
	IDEX.makeChart = function(obj)
	{
		var node = obj.node		
		
		var volAxisHeight = "25%"
		var priceAxisHeight = "75%"
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
						"left":0,
						"right":10,
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
						//"bottom":10,
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
						//"bottom":10,
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
		
		if ("marketSettings" in obj)
		{
			chartOptions.marketSettings = obj.marketSettings;
		}

		obj.node.sleuthcharts(chartOptions);
		//var chart = new Sleuthcharts.Chart(chartOptions);

		
		//var chart = Sleuthcharts.getChart(node);
		//chart.changeMarket(obj);
	}
	
	
	IDEX.changeChartMarket = function(obj)
	{
		var $node = obj.node.closest(".cell").find(".chart-wrap svg");
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




	$contentWrap.on("click", ".chart-time-dropdown-wrap li", function()
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

		
		
		var $node = $(this).closest(".cell").find(".chart-wrap svg");
		var chart = Sleuthcharts.getChart($node);
		var marketHandler = chart.marketHandler;

		//console.log(chart);
		
		var newSettings = {};

		newSettings.configType = "time";
		newSettings.configVal = timeType;
		newSettings.val = timeVal;
		

		marketHandler.changeSettings(newSettings);

	})
	
	
	$contentWrap.on("click", ".chart-header .mm-chart-config li", function(e)
	{
		$(this).parent().find("li").removeClass("active");
		$(this).addClass("active");
		
				
		var $node = $(this).closest(".cell").find(".chart-wrap svg");
		var chart = Sleuthcharts.getChart($node);
		var marketHandler = chart.marketHandler;
		
		var confType = $(this).parent().attr("data-config")
		var confVal = $(this).attr("data-val")
		
		var newSettings = {};
		newSettings.configType = confType;
		newSettings.configVal = confVal;		

		marketHandler.changeSettings(newSettings);

	})
	

	
	$contentWrap.on("click", ".chart-tools-line, .chart-tools-crosshair, .chart-tools-fib", function()
	{
		var isCross = $(this).hasClass("chart-tools-crosshair");
		var isFib = $(this).hasClass("chart-tools-fib");
		
		var $node = $(this).closest(".cell").find(".chart-wrap svg");
		var chart = Sleuthcharts.getChart($node);
		
		var yLabelStyle =
		{
			"textPadding":5,
			"fontSize":"13px",
			"fontColor":"#8C8C8C",
		};
		
		var yAxisSettings = 
		{
			"heightInit":"25%",
			"widthInit":50,
			
			"padding":{
				"top":20,
				"left":0,
			},
			
			"minPadding":0.0,
			"maxPadding":0.0,
			
			"numTicks":3,
			"tickLength":7,
			
			"labels":yLabelStyle
		};

		var seriesSettings = 
		{
			seriesType: "indicator",
			indicatorSettings: 
			{
				icode: "macd",
				ion: "cl",
				ilen: 9
				//icode: "storsi",
				//ion: "cl", //vol
				//ilen: 14
			}
		};
		
		if (isCross)
		{
			seriesSettings = 
			{
				seriesType: "indicator",
				indicatorSettings: 
				{
					icode: "storsi",
					ion: "cl", //vol
					ilen: 14
				}
			};
		}
		
		if (isFib)
		{
			seriesSettings = 
			{
				seriesType: "column",
			};
		}
		
		var newSeriesSettings = {};
		newSeriesSettings.series = seriesSettings;
		newSeriesSettings.yAxis = yAxisSettings;
		
		chart.addSeries(newSeriesSettings);

	})
	
	
	
	
	$(".mainHeader-menu-ico-markets").on("click", function()
	{
		var saves = JSON.parse(localStorage.getItem('grids'));
		console.log(saves);
		console.log(JSON.stringify(saves))
	})
	
	
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
