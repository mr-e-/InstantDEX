
(function (H) {
	'use strict';
	var each = H.each;
	var merge = H.merge;

	H.wrap(H.Series.prototype, 'render', function (proceed) {

		// Run the original proceed method
		proceed.apply(this, Array.prototype.slice.call(arguments, 1));

		var series = this;
		var chart = series.chart;
		var backgroundColor = chart.options.chart.backgroundColor || '#ffffff';
		var points = series.points;
		var options = series.options;
		var type = options.type;

		if (type === 'candlestick' || type === 'column') 
		{
			var candleSeries = chart.series[0]
			var candlePoints = candleSeries.points
			var a = candlePoints[0].graphic.d.split(" ")[1]
			var b = (candlePoints[candlePoints.length-1].graphic.d.split(" ")[7])
			var c = ((b-a) / candlePoints.length)
			var xAxis = chart.xAxis[0]			

			each(points, function (point, i) 
			{
				var graphic = point.graphic
				var attribute = point.pointAttr
				var isOpenUp = candlePoints[i].open > candlePoints[i].close
				var strokeColor = isOpenUp ? "#d00" : "#0c0";
				var fillColor = isOpenUp ? '#a80808' : backgroundColor;

				point.pointAttr = merge(attribute, 
				{
					'': 
					{
						stroke: strokeColor,
						fill: fillColor
					}
				});

				if (type === 'candlestick')
				{
					var sub = graphic.d.split(" ")
					var pairwidth = Number(sub[7]) - Number(sub[4])
					var diff = points.length > 700 ? 0.6 : 0.5
	
					sub[1] = String((Number(sub[1])) + (diff))
					sub[4] = String((Number(sub[4])) + (diff))
					sub[7] = String((Number(sub[7])) - (diff))
					sub[10] = String((Number(sub[10])) - (diff))

					graphic.attr({d:sub.join(" ")})
					graphic.attr('stroke-width', 1)
					graphic.attr('stroke', strokeColor);
					graphic.attr('fill', fillColor);
					graphic.attr('shape-rendering', "crispEdges")
				}
				else if (type === 'column')
				{
					var w = graphic.attr('width')
					
					if (c < w)
						w = c
					if (w < 0.2)
						w = 0.2
						
					if (point.y < 1.0 && point.y > 0.00)
					{
						graphic.attr('height', 1)
						graphic.attr('y', series.yAxis.bottom - (series.yAxis.bottom - series.yAxis.height))
					}
					
					graphic.attr('width', w)
					graphic.attr('stroke', strokeColor)
					graphic.attr('stroke-width', 1)
					graphic.attr('borderWidth', 1)
					graphic.attr('fill', fillColor);
					graphic.attr('shape-rendering', "crispEdges")
				} 
			});
			if (false)
			{
				var prev = 0
				for ( var i = 0; i < candlePoints.length; ++i)
				{
					if (i < candlePoints.length-1)
					{
						var tn =  Number(candlePoints[i+1].graphic.d.split(" ")[7]) - Number(candlePoints[i].graphic.d.split(" ")[1])
						//var tn2 = sub[1] - points[i-1].graphic.d.split(" ")[7]
						//console.log(String(i) + " " +String(nn))
						//console.log(String(i) + ":  " +String(tn) )
					}
				}
			}
		}
	});
	
}(Highcharts));
