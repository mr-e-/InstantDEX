/**
 * Using this plugin will enable "Oxymoronic" candlesticks.
 *
 * Author: Roland Banguiran
 * Email: banguiran@gmail.com
 *
*/


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
					var diff = (pairwidth - c)
					diff = diff/2
					//if (i == 10)
						//console.log(diff)
					if ( diff < 0.4 && points.length > 150)
						diff = 0.5
					else if (diff < 0.4 && points.length >150 && points.length < 300)
						diff = 0.5
					else if (diff < 0.4)
						diff = 0.5
	
					//diff = Number(Math.round(diff * 100000) / 100000).toFixed(5);
					diff = Number(diff)
					sub[1] = String((Number(sub[1])) + (diff))
					sub[4] = String((Number(sub[4])) + (diff))
					sub[7] = String((Number(sub[7])) - (diff))
					sub[10] = String((Number(sub[10])) - (diff))
					if (i == 10)
					{
						//console.log(sub[1] + "  " + sub[7])
						//console.log(points.length)
						//console.log(diff)
						//console.log(Number(sub[7]) - Number(sub[4]))
					}
					graphic.attr({d:sub.join(" ")})
					graphic.attr('stroke-width', "0.04rem")
			        graphic.attr('stroke', strokeColor);
			        graphic.attr('fill', fillColor);
					graphic.attr('shape-rendering', "crispEdges")
				}
				else if (type === 'column')
				{
					var w = graphic.attr('width')
					var sw = graphic.attr('stroke-width') 
					var diff = w - c
					if (c < w)
						w = c
					if (i == 10)
					{
						//console.log(colWidth)
						//console.log(w)
						//console.log(sw)
						
					}
					if (point.y < 1 && point.y > 0.00)
					{
						graphic.attr('height', 1)
						graphic.attr('y', series.yAxis.bottom - (series.yAxis.bottom - series.yAxis.height))
					}
					if (w < 0.2)
						w = 0.2
					graphic.attr('width', w)
					graphic.attr('stroke', strokeColor)
					graphic.attr('stroke-width', "0.04rem")
					graphic.attr('borderWidth', "0.04rem")
			        graphic.attr('fill', fillColor);
					graphic.attr('shape-rendering', "crispEdges")
				} 
            });
        }
    });
}(Highcharts));
