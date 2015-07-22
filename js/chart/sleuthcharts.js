var Sleuthcharts = {};


var IDEX = (function(IDEX, $, undefined) 
{   


	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		Sleuthcharts.allCharts = [];
		
		
		
		Sleuthcharts.getChart = function()
		{
			var allCharts = this.allCharts;
			var len = allCharts.length;
			
			for (var i = 0; i < len; i++)
			{
				
			}
		}
		

		
		
		var Chart = Sleuthcharts.Chart = function()
		{
			this.init.apply(this, arguments)
		}
		
		Chart.prototype = 
		{
			
			//series: [],
			//axes: [],
			//xAxis: [],
			//yAxis: [],
			
			
			init: function(userOptions)
			{
				
				var chart = this;
				chart.userOptions = userOptions;
				
				
				chart.series = [];
				chart.axes = [];
				chart.xAxis = [];
				chart.yAxis = [];
				
				chart.initAxes();
				chart.initSeries();
				//chart.addEventListeners();				

					
				Sleuthcharts.allCharts.push(chart);
				return chart;

			},
			
		
			
			initSeries: function()
			{
				var chart = this;
				var seriesOptions = chart.userOptions.series;
				
				
				for (var i = 0; i < seriesOptions.length; i++)
				{
					var opt = seriesOptions[i];
					opt.index = i;
					var seriesType = opt.seriesType;
					var seriesClass = Sleuthcharts.seriesTypes[seriesType]
					console.log(seriesClass);
					var series = new seriesClass(chart, opt);
					chart.series.push(series);
				}
			},
			
			
			initAxes: function()
			{
				var chart = this;
				var xAxisOptions = chart.userOptions.xAxis;
				var yAxisOptions = chart.userOptions.yAxis;
				
				for (var i = 0; i < xAxisOptions.length; i++)
				{
					var opt = xAxisOptions[i];
					opt.isXAxis = true;
					opt.axisIndex = i;
					
					var axis = new Sleuthcharts.Axis(chart, opt)
					chart.xAxis.push(axis)
				}
				
				for (var i = 0; i < yAxisOptions.length; i++)
				{
					var opt = yAxisOptions[i];
					opt.isXAxis = false;
					opt.axisIndex = i;
					
					var axis = new Sleuthcharts.Axis(chart, opt)
					chart.yAxis.push(axis)
				}
			},
			
			
			addEventListeners: function()
			{
				var chart = this;
				
				chart.addWheel();
				chart.addMove();
				chart.addMouseout();
				chart.addMouseup();
				chart.addMousedown();
				chart.addDrawing();
			},
			
			
			resizeAxis: function()
			{
				var chart = this;
				
				chart.yAxis[0].resizeYAxis()
				chart.yAxis[1].resizeYAxis()
				chart.xAxis[0].resizeXAxis()
			},
			
			updateAxisPos: function()
			{
				var chart = this;
				
				chart.yAxis[0].updateYAxisPos()
				chart.yAxis[1].updateYAxisPos()
				chart.xAxis[0].updateXAxisPos()	
			},
			
			updateAxisTicks: function()
			{
				var chart = this;
				
				chart.yAxis[0].makeYAxis()
				chart.yAxis[1].makeYAxis()
				chart.xAxis[0].makeXAxis()	
			},
			
			drawAxisLines: function()
			{
				var chart = this;
				
				chart.yAxis[0].drawYAxisLines()
				chart.yAxis[1].drawYAxisLines()
				chart.xAxis[0].drawXAxisLines()
			},
			
			
			toggleLoading: function (isLoading)
			{
				var chart = this;
				var node  = chart.node;
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
			},
			
			

		}
		
		

		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
	
		

	
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
			]
		}
		
		
		var chart = new Sleuthcharts.Chart(chartOptions);

		
		//var chart = Sleuthcharts.getChart(node);
		//chart.changeMarket(obj);
		
		
	}

	
	IDEX.updateChart = function()
	{
		var dfd = new $.Deferred();

		var chart = this;
		var settings = chart.settings;
		var isTime = settings.bars == "time";

		
		chart.emptyChart();
		chart.unbindEventListeners();	//$("#"+node).unbind();
		chart.toggleLoading(true);
		
		chart.prevIndex = -1;

		updateChartType();

		chart.MarketData.getMarketData.done(function()
		{	
			chart.resizeAxis();
			chart.updateAxisPos();
			chart.initXAxis();
			
			chart.redraw();
			
			chart.drawBothInds();

			chart.drawMarketName();
			chart.toggleLoading(false)
			
			
			dfd.resolve();
		})
		
		return dfd.promise()
	}
	

	function updateChartType()
	{
		var chart = this;
		var settings = chart.settings;
		
		
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
	}
		
		
		
	function redraw(chart)
	{
		var chart = this;
		
		
		if (!chart.xAxis.length)
			return
		

		chart.getPointPositions();
		chart.EqualizeYAxisWidth();
		chart.resizeAxis();
		chart.updateAxisPos();
		
		chart.updateAxisMinMax();
		
		
		chart.getPointPositions();
		chart.EqualizeYAxisWidth(priceAxis)
		chart.resizeAxis();
		chart.updateAxisPos();
				
				
		chart.drawCandleSticks();
		chart.drawVolBars()
		chart.drawBothInds();


		updateAxisTicks(chart);
		drawAxisLines(chart);
		
		highLowPrice(chart);
		redrawLines(chart);
	}
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
