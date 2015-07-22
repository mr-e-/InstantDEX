var IDEX = (function(IDEX, $, undefined) 
{   





	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		Sleuthcharts.seriesTypes = {};
		
		var Series = Sleuthcharts.Series = function()
		{
			this.init.apply(this, arguments)
		}
		
		Series.prototype = 
		{

			//defaultOptions: Sleuthcharts.defaultOptions.series
			
			
			
			init: function(chart, userOptions)
			{
				var series = this;
				series.chart = chart;
				
				
				series.seriesType = userOptions.seriesType;
				series.index = userOptions.index;

				series.xAxis = [];
				series.yAxis = [];
				series.yAxis = chart.yAxis[series.index];
				series.xAxis = chart.xAxis[0];
				
				
				series.height = 0;
				series.width = 0;
				
				
				series.positions = new Sleuthcharts.Positions();
				series.padding = new Sleuthcharts.Padding();
				series.padding = Sleuthcharts.extend(series.padding, userOptions.padding);
				
	
				
			}
			
			
			
		}
		
		
		
		Sleuthcharts.seriesTypes.candlestick = Sleuthcharts.extend(Series, 
		{
			seriesType: "candlestick",
		
		})
		
		
		Sleuthcharts.seriesTypes.column = Sleuthcharts.extend(Series, 
		{
			seriesType: "column",
		
		})
			

		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
	
	

	IDEX.Series = function(obj) 
	{	
		this.xAxis;
		this.yAxis;
		



		IDEX.constructFromObject(this, obj);
		
		this.xAxis.series.push(this);
		this.yAxis.series.push(this);
		
	}
	
	
	IDEX.Series.prototype.initAxis = function(options)
	{
		var axis = new IDEX.Axis(options);
		axis.height = this.height * options.heightPerc;
		axis.width = this.width * options.widthPerc;
		//axis.bottom = axis.height + 
		//axis.left = 
		//axis.bottom = 
		//axis.right =
		axis.numTicks = options.numTicks	
		if (options.isXAxis)
		{
			this.xAxis = axis;
		}
		else
		{
			this.yAxis = axis;
		}
	}
	
	

	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));